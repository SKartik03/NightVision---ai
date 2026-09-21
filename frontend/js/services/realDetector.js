/**
 * NightVision AI - Real ML Object Detector Service
 * Loads and runs real in-browser neural network inference (COCO-SSD / MobileNet-v2).
 * Operates strictly on actual user camera frames, video frames, and uploaded images.
 * Never invents or hardcodes detections.
 */

export class RealDetectorService {
  constructor() {
    this.model = null;
    this.status = 'unloaded'; // 'unloaded', 'loading', 'ready', 'error'
    this.errorMessage = null;
    this.loadPromise = null;
  }

  async loadModel() {
    if (this.status === 'ready' && this.model) {
      return this.model;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.status = 'loading';
    this.loadPromise = (async () => {
      try {
        // Check if cocoSsd is available in window
        if (typeof window.cocoSsd === 'undefined') {
          // Wait up to 3 seconds for script to be loaded
          let retries = 30;
          while (typeof window.cocoSsd === 'undefined' && retries > 0) {
            await new Promise(r => setTimeout(r, 100));
            retries--;
          }
        }

        if (typeof window.cocoSsd === 'undefined') {
          throw new Error('TensorFlow COCO-SSD library is not loaded in browser.');
        }

        // Load lightweight MobileNet-v2 base for real-time camera/video processing
        this.model = await window.cocoSsd.load({ base: 'lite_mobilenet_v2' });
        this.status = 'ready';
        console.log('RealDetectorService: COCO-SSD model loaded successfully.');
        return this.model;
      } catch (err) {
        this.status = 'error';
        this.errorMessage = err.message || 'Model loading error';
        console.warn('RealDetectorService load failed:', err);
        return null;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  isReady() {
    return this.status === 'ready' && this.model !== null;
  }

  /**
   * Runs real model inference on an HTMLImageElement, HTMLVideoElement, or HTMLCanvasElement.
   * Returns: Array of { class, confidence, confidencePct, bbox: [x1, y1, x2, y2], focusArea }
   * Returns empty array [] if no objects are detected. NEVER fabricates fake boxes.
   */
  async detect(sourceElement, threshold = 0.40) {
    if (!this.isReady()) {
      await this.loadModel();
      if (!this.isReady()) {
        return {
          status: 'unavailable',
          message: 'Detection model currently unavailable',
          detections: []
        };
      }
    }

    try {
      // Run actual inference on the pixels of sourceElement
      const rawPredictions = await this.model.detect(sourceElement, 15, threshold);
      
      const width = sourceElement.videoWidth || sourceElement.naturalWidth || sourceElement.width;
      const height = sourceElement.videoHeight || sourceElement.naturalHeight || sourceElement.height;

      const detections = rawPredictions.map((pred, idx) => {
        const [bx, by, bw, bh] = pred.bbox;
        const x1 = Math.max(0, Math.round(bx));
        const y1 = Math.max(0, Math.round(by));
        const x2 = Math.min(width, Math.round(bx + bw));
        const y2 = Math.min(height, Math.round(by + bh));
        const confPct = Math.round(pred.score * 100);

        return {
          id: `real_${idx + 1}`,
          class: pred.class.toLowerCase(),
          confidence: Number(pred.score.toFixed(4)),
          confidencePct: confPct,
          bbox: [x1, y1, x2, y2], // [x1, y1, x2, y2]
          normalizedBbox: [
            Number((x1 / width).toFixed(4)),
            Number((y1 / height).toFixed(4)),
            Number((x2 / width).toFixed(4)),
            Number((y2 / height).toFixed(4))
          ],
          focusArea: `${(((x2 - x1) * (y2 - y1)) / (width * height) * 100).toFixed(1)}% of frame`
        };
      });

      return {
        status: 'success',
        detections: detections
      };
    } catch (err) {
      console.warn('Real detection error:', err);
      return {
        status: 'error',
        message: err.message,
        detections: []
      };
    }
  }
}

export const realDetector = new RealDetectorService();
