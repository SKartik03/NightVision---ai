/**
 * NightVision AI - Camera Manager Service
 * Connects to the user's real webcam using WebRTC/getUserMedia.
 * Continuously captures actual frames and runs real neural network inference (COCO-SSD).
 * Strictly operates on the real camera content without fabricating detections or confidence.
 */

import { appState } from '../state.js';
import { CVEngine } from './cvEngine.js';
import { realDetector } from './realDetector.js';

export class CameraService {
  constructor() {
    this.stream = null;
    this.videoElement = null;
    this.canvasElement = null;
    this.isStreaming = false;
    this.isPaused = false;
    this.animationFrameId = null;
    this.lastInferenceTime = 0;
    this.isInferring = false;
    
    // Camera operational status
    // 'Camera not started' | 'Camera active' | 'Analyzing live frame...' | 'No objects detected' | 'X objects detected'
    this.statusText = 'Camera not started';

    // Telemetry
    this.frameCounter = 0;
    this.lastFpsCalcTime = performance.now();
    this.currentInputFps = 0;
    this.currentInferenceFps = 0;
    this.currentLatencyMs = 0;

    // Multi-object tracking state
    this.trackerState = {
      tracks: {},
      nextId: 1,
      counters: {}
    };

    // Pre-load detector
    realDetector.loadModel();
  }

  async getAvailableDevices() {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return [];
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(d => d.kind === 'videoinput');
    } catch (err) {
      console.warn('Could not enumerate video devices:', err);
      return [];
    }
  }

  async startCamera(videoElement, canvasElement, deviceId = null) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.statusText = 'Camera unsupported';
      throw new Error('Camera access (getUserMedia) is not supported by your browser.');
    }

    // Stop existing stream if any
    this.stopCamera();

    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: false
    };

    if (deviceId) {
      constraints.video.deviceId = { exact: deviceId };
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.videoElement.srcObject = this.stream;
      this.videoElement.setAttribute('playsinline', 'true');
      await this.videoElement.play();

      this.isStreaming = true;
      this.isPaused = false;
      this.lastInferenceTime = 0;
      this.statusText = 'Camera active';

      appState.set('currentInputType', 'camera');
      appState.set('currentInputName', 'Live Webcam Stream (Local WebRTC)');

      // Reset tracker
      this.trackerState = { tracks: {}, nextId: 1, counters: {} };

      // Start inference and rendering loop
      this._startProcessingLoop();

      return true;
    } catch (err) {
      this.isStreaming = false;
      this.statusText = 'Camera permission denied';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Camera permission was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No physical camera device was detected on your system.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        throw new Error('Camera is already in use by another application.');
      } else {
        throw new Error(`Camera initialization error: ${err.message || err.name}`);
      }
    }
  }

  stopCamera() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.isStreaming = false;
    this.isPaused = false;
    this.statusText = 'Camera not started';
    this.currentInputFps = 0;
    this.currentInferenceFps = 0;
    this.currentLatencyMs = 0;
  }

  pauseCamera() {
    if (this.isStreaming) {
      this.isPaused = true;
      this.statusText = 'Feed paused';
      if (this.videoElement) {
        this.videoElement.pause();
      }
    }
  }

  resumeCamera() {
    if (this.isStreaming && this.isPaused) {
      this.isPaused = false;
      this.statusText = 'Camera active';
      if (this.videoElement) {
        this.videoElement.play();
      }
    }
  }

  /**
   * Captures the EXACT current frame from the webcam stream.
   * Generates: Original frame, Illumination Map, Enhanced Frame, and Detection Overlay.
   * All 4 views strictly originate from this frozen frame.
   */
  async captureFrame() {
    if (!this.videoElement || !this.videoElement.videoWidth) {
      return null;
    }

    const vw = this.videoElement.videoWidth;
    const vh = this.videoElement.videoHeight;

    // 1. Original Frozen Canvas
    const origCanvas = document.createElement('canvas');
    origCanvas.width = vw;
    origCanvas.height = vh;
    const oCtx = origCanvas.getContext('2d');
    oCtx.drawImage(this.videoElement, 0, 0, vw, vh);

    // Compute actual illumination of this frame
    const imgData = oCtx.getImageData(0, 0, vw, vh);
    const illumMetrics = CVEngine.computeLuminance(imgData);

    // 2. Illumination Map Canvas of THIS frame
    const illumCanvas = document.createElement('canvas');
    CVEngine.renderIlluminationHeatmap(origCanvas, illumCanvas);

    // 3. Enhanced Canvas of THIS frame (Zero-DCE curve iteration)
    const enhCanvas = document.createElement('canvas');
    CVEngine.enhanceZeroDCE(origCanvas, enhCanvas, appState.get('settings').enhancementStrength || 0.70);

    // 4. Detected Canvas of THIS frame (Run real ML detection on the captured frame)
    const detCanvas = document.createElement('canvas');
    detCanvas.width = vw;
    detCanvas.height = vh;
    const dCtx = detCanvas.getContext('2d');
    dCtx.drawImage(enhCanvas, 0, 0);

    const threshold = appState.get('settings').confidenceThreshold || 0.40;
    const detResult = await realDetector.detect(enhCanvas, threshold);
    const detections = detResult.detections || [];

    if (appState.get('settings').enableTracking && detections.length > 0) {
      const tracked = CVEngine.updateTracks(detections, this.trackerState);
      CVEngine.drawBoundingBoxes(dCtx, tracked, {
        showLabels: appState.get('settings').showBoundingLabels,
        showConfidence: appState.get('settings').showConfidence
      });
    } else {
      CVEngine.drawBoundingBoxes(dCtx, detections, {
        showLabels: appState.get('settings').showBoundingLabels,
        showConfidence: appState.get('settings').showConfidence
      });
    }

    return {
      type: 'webcam_capture',
      originalCanvas: origCanvas,
      illumCanvas: illumCanvas,
      enhCanvas: enhCanvas,
      detCanvas: detCanvas,
      illumMetrics: illumMetrics,
      detections: detections,
      width: vw,
      height: vh,
      timestamp: new Date().toLocaleTimeString()
    };
  }

  _startProcessingLoop() {
    const loop = async (now) => {
      if (!this.isStreaming) return;

      // Calculate camera input FPS
      this.frameCounter++;
      if (now - this.lastFpsCalcTime >= 1000) {
        this.currentInputFps = Math.round((this.frameCounter * 1000) / (now - this.lastFpsCalcTime));
        this.frameCounter = 0;
        this.lastFpsCalcTime = now;
      }

      if (!this.isPaused && this.videoElement && this.videoElement.readyState >= 2) {
        const vw = this.videoElement.videoWidth;
        const vh = this.videoElement.videoHeight;

        if (this.canvasElement && vw > 0 && vh > 0) {
          if (this.canvasElement.width !== vw || this.canvasElement.height !== vh) {
            this.canvasElement.width = vw;
            this.canvasElement.height = vh;
          }

          const ctx = this.canvasElement.getContext('2d');

          // Throttled inference check
          const targetInferenceFps = appState.get('settings').inferenceFps || 15;
          const inferenceInterval = 1000 / targetInferenceFps;

          if (!this.isInferring && (now - this.lastInferenceTime >= inferenceInterval)) {
            this.lastInferenceTime = now;
            this.isInferring = true;
            const t0 = performance.now();

            this.statusText = 'Analyzing live frame...';

            // Real illumination estimation from the current video frame
            const dw = Math.min(240, vw);
            const dh = Math.min(180, vh);
            const sampleCanvas = document.createElement('canvas');
            sampleCanvas.width = dw;
            sampleCanvas.height = dh;
            const sCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
            sCtx.drawImage(this.videoElement, 0, 0, dw, dh);

            const imgData = sCtx.getImageData(0, 0, dw, dh);
            const illumMetrics = CVEngine.computeLuminance(imgData);

            // Run REAL neural network inference on the actual webcam frame
            const threshold = appState.get('settings').confidenceThreshold || 0.40;
            const detResult = await realDetector.detect(this.videoElement, threshold);
            let detections = detResult.detections || [];

            const latency = performance.now() - t0;
            this.currentLatencyMs = Math.round(latency * 10) / 10;
            this.currentInferenceFps = Math.round(1000 / Math.max(latency, 1));

            // Apply persistent tracking if enabled
            if (appState.get('settings').enableTracking && detections.length > 0) {
              detections = CVEngine.updateTracks(detections, this.trackerState);
            }

            // Update status text honestly based on real model output
            if (!realDetector.isReady()) {
              this.statusText = 'Detection model unavailable';
            } else if (detections.length === 0) {
              this.statusText = 'No objects detected';
            } else {
              this.statusText = `${detections.length} object${detections.length === 1 ? '' : 's'} detected`;
            }

            // Calculate average confidence from real detections
            const avgConf = detections.length
              ? Math.round(detections.reduce((acc, d) => acc + d.confidencePct, 0) / detections.length)
              : 0;

            // Update app metrics with REAL values
            appState.updateMetrics({
              illuminationScore: illumMetrics.illuminationScore,
              objectsDetected: detections.length,
              avgConfidence: avgConf,
              processingFps: this.currentInferenceFps,
              latencyMs: this.currentLatencyMs,
              sceneCondition: illumMetrics.sceneCondition,
              darkRegionPct: illumMetrics.darkRegionPct,
              brightRegionPct: illumMetrics.brightRegionPct,
              noiseLevel: illumMetrics.noiseLevel
            });

            appState.set('detectedObjects', detections);

            // Record session frame
            appState.recordSessionFrame({
              objects: detections.length,
              confidence: avgConf,
              illumination: illumMetrics.illuminationScore,
              fps: this.currentInferenceFps,
              latency: this.currentLatencyMs
            });

            // Draw bounding boxes on the overlay canvas
            ctx.clearRect(0, 0, vw, vh);
            const settings = appState.get('settings');
            CVEngine.drawBoundingBoxes(ctx, detections, {
              showLabels: settings.showBoundingLabels,
              showConfidence: settings.showConfidence,
              selectedId: appState.get('selectedObjectId')
            });

            this.isInferring = false;
          } else {
            // Redraw cached detections without blocking the 60fps video stream
            ctx.clearRect(0, 0, vw, vh);
            const detections = appState.get('detectedObjects') || [];
            const settings = appState.get('settings');
            CVEngine.drawBoundingBoxes(ctx, detections, {
              showLabels: settings.showBoundingLabels,
              showConfidence: settings.showConfidence,
              selectedId: appState.get('selectedObjectId')
            });
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }
}

export const cameraService = new CameraService();
