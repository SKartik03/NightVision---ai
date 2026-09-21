/**
 * NightVision AI - Live Camera Workspace
 * Processes actual frames captured from the user's webcam.
 * Operates with real neural network detection (COCO-SSD) and illumination estimation.
 * No fabricated or hardcoded results.
 */

import { appState } from '../state.js';
import { cameraService } from '../services/cameraService.js';
import { realDetector } from '../services/realDetector.js';

export class LiveCameraPage {
  constructor(container) {
    this.container = container;
    this.errorMessage = null;
    this.devices = [];
    this.statusUpdateInterval = null;
  }

  async initDevices() {
    this.devices = await cameraService.getAvailableDevices();
  }

  render() {
    const metrics = appState.get('metrics');
    const isStreaming = cameraService.isStreaming;
    const isPaused = cameraService.isPaused;
    const modelReady = realDetector.isReady();

    const conditionBadge = metrics.sceneCondition === 'NIGHT'
      ? '🌙 NIGHT'
      : metrics.sceneCondition === 'LOW_LIGHT'
      ? '🌘 LOW LIGHT'
      : '🌗 MODERATE';

    // Real status reflecting camera & detection
    let hudStatus = cameraService.statusText || (isStreaming ? 'Camera active' : 'Camera not started');

    this.container.innerHTML = `
      ${this.errorMessage ? `
        <div class="notice-banner demo-alert" style="margin-bottom: 20px;">
          <span>⚠️ <strong>Camera Notice:</strong> ${this.errorMessage}</span>
          <button class="btn btn-sm btn-secondary" style="margin-left: auto;" id="btn-dismiss-err">Dismiss</button>
        </div>
      ` : ''}

      <div class="camera-layout">
        <!-- Main Camera Feed -->
        <div class="camera-main-panel">
          <div class="camera-view-container" id="camera-container">
            <video id="camera-video" class="camera-video" playsinline muted></video>
            <canvas id="camera-canvas" class="camera-canvas"></canvas>

            ${!isStreaming ? `
              <div id="camera-idle-placeholder" style="position: absolute; text-align: center; color: #94a3b8; padding: 20px;">
                <div style="font-size: 48px; margin-bottom: 12px;">📷</div>
                <h3 style="color: #f8fafc; font-size: 18px; margin-bottom: 8px;">Live Camera Feed Idle</h3>
                <p style="font-size: 13.5px; max-width: 440px; margin: 0 auto 20px; line-height: 1.5;">
                  Click "Start Camera" to access your real webcam. The system captures actual frames, evaluates spatial illumination, and executes real in-browser neural detection.
                </p>
                <button class="btn btn-primary btn-lg" id="btn-init-cam">
                  Start Camera Feed
                </button>
              </div>
            ` : ''}

            <!-- Real-Time Camera HUD -->
            <div class="camera-hud">
              <div class="hud-badge">
                <span class="status-dot ${isStreaming && !isPaused ? '' : 'demo'}"></span>
                <span id="hud-status-text">${hudStatus.toUpperCase()}</span>
              </div>
              <div class="hud-badge">
                <span id="hud-fps-telemetry">
                  ⚡ INFERENCE: ${cameraService.currentInferenceFps ? `${cameraService.currentInferenceFps} FPS` : '--'} 
                  (${cameraService.currentLatencyMs ? `${cameraService.currentLatencyMs} ms` : '--'})
                </span>
              </div>
            </div>
          </div>

          <!-- Camera Controls Bar -->
          <div class="camera-controls-bar">
            <div style="display: flex; align-items: center; gap: 10px;">
              ${!isStreaming ? `
                <button class="btn btn-primary" id="btn-start-stream">
                  ▶ Start Camera
                </button>
              ` : `
                <button class="btn btn-secondary" id="btn-toggle-pause">
                  ${isPaused ? '▶ Resume' : '⏸ Pause'}
                </button>
                <button class="btn btn-secondary" id="btn-stop-stream">
                  ⏹ Stop
                </button>
                <button class="btn btn-teal" id="btn-capture-frame" title="Freeze and decompose exact frame into 4 analysis views">
                  📸 Capture Frame
                </button>
              `}
            </div>

            <div style="display: flex; align-items: center; gap: 16px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary);">
                <span>Device:</span>
                <select id="select-camera-device" style="padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); font-size: 12px; max-width: 180px;">
                  <option value="">Default Camera</option>
                  ${this.devices.map(d => `<option value="${d.deviceId}">${d.label || 'Camera'}</option>`).join('')}
                </select>
              </div>

              <button class="btn btn-secondary btn-sm" id="btn-cam-fullscreen" title="Toggle Fullscreen">
                ⛶ Fullscreen
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side Analysis & Real-Time Metrics -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Live Scene Analysis -->
          <div class="panel-card">
            <h3 class="panel-title">LIVE SCENE ANALYSIS</h3>
            <p class="panel-subtitle">IlluminationNet real-time telemetry from webcam</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div class="metric-row">
                <span class="metric-name">Illumination Score</span>
                <span class="metric-val" id="val-illum">${metrics.illuminationScore !== null ? `${metrics.illuminationScore} / 100` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Dark Region Pixels</span>
                <span class="metric-val" id="val-dark-pct">${metrics.darkRegionPct !== null ? `${metrics.darkRegionPct}%` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Noise Variance</span>
                <span class="metric-val" id="val-noise">${metrics.noiseLevel !== null ? `${metrics.noiseLevel} / 100` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Scene Condition</span>
                <span class="metric-val" id="val-condition"><strong>${conditionBadge}</strong></span>
              </div>
            </div>
          </div>

          <!-- Real-Time Metrics -->
          <div class="panel-card">
            <h3 class="panel-title">REAL-TIME METRICS</h3>
            <p class="panel-subtitle">Actual measured performance</p>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div class="metric-row">
                <span class="metric-name">Camera Input FPS</span>
                <span class="metric-val" id="val-in-fps">${cameraService.currentInputFps ? `${cameraService.currentInputFps} FPS` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Inference Rate</span>
                <span class="metric-val" id="val-inf-fps">${cameraService.currentInferenceFps ? `${cameraService.currentInferenceFps} FPS` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Processing Latency</span>
                <span class="metric-val" id="val-latency">${cameraService.currentLatencyMs ? `${cameraService.currentLatencyMs} ms` : '--'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Objects Detected</span>
                <span class="metric-val" id="val-objs" style="font-weight: 700; color: ${metrics.objectsDetected > 0 ? 'var(--cv-blue)' : 'var(--text-muted)'};">
                  ${metrics.objectsDetected !== null ? (metrics.objectsDetected === 0 ? 'No objects detected' : `${metrics.objectsDetected} targets`) : '--'}
                </span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Average Confidence</span>
                <span class="metric-val" id="val-conf">${metrics.avgConfidence !== null && metrics.objectsDetected > 0 ? `${metrics.avgConfidence}%` : '--'}</span>
              </div>
            </div>
          </div>

          <!-- Model Status & Inference Configuration -->
          <div class="panel-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <h3 class="panel-title" style="margin-bottom: 0;">DETECTION MODEL</h3>
              <span class="tag-pill" style="${modelReady ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
                ${modelReady ? '● Neural Model Ready' : '⏳ Model Initializing...'}
              </span>
            </div>

            <div class="control-group" style="margin-top: 12px;">
              <div class="control-label">
                <span>Inference Throttle:</span>
                <span id="label-target-fps">${appState.get('settings').inferenceFps} FPS</span>
              </div>
              <input type="range" class="range-slider" min="5" max="30" step="5" value="${appState.get('settings').inferenceFps}" id="slider-target-fps">
              <span style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                Throttles heavy neural inference while keeping the camera display fluid at 60 FPS.
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._startStatusPolling();
  }

  _startStatusPolling() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }
    this.statusUpdateInterval = setInterval(() => {
      if (cameraService.isStreaming) {
        const hudStatusEl = this.container.querySelector('#hud-status-text');
        const hudFpsEl = this.container.querySelector('#hud-fps-telemetry');
        const inFpsEl = this.container.querySelector('#val-in-fps');
        const infFpsEl = this.container.querySelector('#val-inf-fps');
        const latEl = this.container.querySelector('#val-latency');
        const objsEl = this.container.querySelector('#val-objs');
        const confEl = this.container.querySelector('#val-conf');
        const illumEl = this.container.querySelector('#val-illum');
        const darkEl = this.container.querySelector('#val-dark-pct');

        if (hudStatusEl) hudStatusEl.textContent = cameraService.statusText.toUpperCase();
        if (hudFpsEl) {
          hudFpsEl.textContent = `⚡ INFERENCE: ${cameraService.currentInferenceFps || '--'} FPS (${cameraService.currentLatencyMs || '--'} ms)`;
        }
        if (inFpsEl) inFpsEl.textContent = `${cameraService.currentInputFps || '--'} FPS`;
        if (infFpsEl) infFpsEl.textContent = `${cameraService.currentInferenceFps || '--'} FPS`;
        if (latEl) latEl.textContent = `${cameraService.currentLatencyMs || '--'} ms`;

        const m = appState.get('metrics');
        if (objsEl) {
          objsEl.textContent = m.objectsDetected !== null ? (m.objectsDetected === 0 ? 'No objects detected' : `${m.objectsDetected} targets`) : '--';
        }
        if (confEl) {
          confEl.textContent = m.avgConfidence !== null && m.objectsDetected > 0 ? `${m.avgConfidence}%` : '--';
        }
        if (illumEl && m.illuminationScore !== null) illumEl.textContent = `${m.illuminationScore} / 100`;
        if (darkEl && m.darkRegionPct !== null) darkEl.textContent = `${m.darkRegionPct}%`;
      }
    }, 300);
  }

  _bindEvents() {
    const startCamBtn = this.container.querySelector('#btn-start-stream');
    const initCamBtn = this.container.querySelector('#btn-init-cam');
    const togglePauseBtn = this.container.querySelector('#btn-toggle-pause');
    const stopCamBtn = this.container.querySelector('#btn-stop-stream');
    const captureBtn = this.container.querySelector('#btn-capture-frame');
    const fullscreenBtn = this.container.querySelector('#btn-cam-fullscreen');
    const deviceSelect = this.container.querySelector('#select-camera-device');
    const fpsSlider = this.container.querySelector('#slider-target-fps');
    const dismissErrBtn = this.container.querySelector('#btn-dismiss-err');

    if (dismissErrBtn) {
      dismissErrBtn.onclick = () => {
        this.errorMessage = null;
        this.render();
      };
    }

    const startHandler = async () => {
      this.errorMessage = null;
      const video = this.container.querySelector('#camera-video');
      const canvas = this.container.querySelector('#camera-canvas');
      const selectedDev = deviceSelect ? deviceSelect.value : null;

      try {
        await cameraService.startCamera(video, canvas, selectedDev);
        await this.initDevices();
        this.render();

        // After render() replaces innerHTML, re-attach the active stream
        // to the newly created video/canvas elements
        const newVideo = this.container.querySelector('#camera-video');
        const newCanvas = this.container.querySelector('#camera-canvas');
        if (newVideo && cameraService.stream) {
          newVideo.srcObject = cameraService.stream;
          newVideo.setAttribute('playsinline', 'true');
          newVideo.muted = true;
          await newVideo.play();
          cameraService.videoElement = newVideo;
          cameraService.canvasElement = newCanvas;
        }
      } catch (err) {
        this.errorMessage = err.message || 'Could not start camera feed.';
        this.render();
      }
    };

    if (startCamBtn) startCamBtn.onclick = startHandler;
    if (initCamBtn) initCamBtn.onclick = startHandler;

    if (togglePauseBtn) {
      togglePauseBtn.onclick = () => {
        if (cameraService.isPaused) {
          cameraService.resumeCamera();
        } else {
          cameraService.pauseCamera();
        }
        this.render();
      };
    }

    if (stopCamBtn) {
      stopCamBtn.onclick = () => {
        cameraService.stopCamera();
        if (this.statusUpdateInterval) clearInterval(this.statusUpdateInterval);
        this.render();
      };
    }

    if (captureBtn) {
      captureBtn.onclick = async () => {
        captureBtn.disabled = true;
        captureBtn.textContent = 'Freezing Frame...';
        const frozen = await cameraService.captureFrame();
        if (frozen) {
          // Store frozen capture for the 4-panel Image Analysis page
          appState.set('frozenAnalysis', frozen);
          appState.set('currentPage', 'image_analysis');
        }
        captureBtn.disabled = false;
      };
    }

    if (fullscreenBtn) {
      fullscreenBtn.onclick = () => {
        const container = this.container.querySelector('#camera-container');
        if (container) {
          if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.warn(err));
          } else {
            document.exitFullscreen();
          }
        }
      };
    }

    if (fpsSlider) {
      fpsSlider.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        appState.updateSettings({ inferenceFps: val });
        const lbl = this.container.querySelector('#label-target-fps');
        if (lbl) lbl.textContent = `${val} FPS`;
      };
    }
  }
}
