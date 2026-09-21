/**
 * NightVision AI - Global Reactive State Store
 */

class AppState {
  constructor() {
    this.listeners = new Set();

    this.state = {
      // Current active page: 'introduction', 'dashboard', 'camera', 'image_analysis', etc.
      currentPage: 'introduction',
      
      // System & Model Status
      modelMode: 'DEMO', // 'DEMO' or 'REAL'
      backendUrl: (typeof window !== 'undefined' && window.location)
        ? ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '8080' ? 'http://localhost:8000' : window.location.origin)
        : 'http://localhost:8000',

      // Active Input
      currentInputType: 'none', // 'none', 'camera', 'image', 'video'
      currentInputName: 'No input loaded',

      // Live Metrics
      metrics: {
        illuminationScore: null, // null displays as "--"
        objectsDetected: null,
        avgConfidence: null,
        processingFps: null,
        latencyMs: null,
        sceneCondition: 'NIGHT', // 'NIGHT', 'LOW_LIGHT', 'MODERATE'
        darkRegionPct: null,
        brightRegionPct: null,
        noiseLevel: null
      },

      // Detected objects in active view
      detectedObjects: [],
      selectedObjectId: null,

      // Settings
      settings: {
        cameraResolution: '1280x720',
        cameraDeviceId: '',
        inferenceFps: 15,
        confidenceThreshold: 0.45,
        enhancementStrength: 0.70,
        enableTracking: true,
        showBoundingLabels: true,
        showConfidence: true,
        showIlluminationOverlay: false,
        demoMode: true
      },

      // Session Analytics Store
      session: {
        totalFrames: 142,
        totalObjects: 388,
        avgConfidence: 87.6,
        avgFps: 25.4,
        avgLatencyMs: 39.3,
        avgIllumination: 23,
        history: [
          { t: '11:40', objects: 2, illum: 22, fps: 24.5, latency: 40.8, conf: 84.0 },
          { t: '11:41', objects: 4, illum: 26, fps: 26.2, latency: 38.1, conf: 89.2 },
          { t: '11:42', objects: 3, illum: 19, fps: 25.1, latency: 39.8, conf: 82.5 },
          { t: '11:43', objects: 5, illum: 31, fps: 27.0, latency: 37.0, conf: 91.0 },
          { t: '11:44', objects: 3, illum: 24, fps: 25.8, latency: 38.7, conf: 87.4 },
          { t: '11:45', objects: 6, illum: 28, fps: 24.9, latency: 40.1, conf: 90.3 }
        ],
        confidenceDistribution: [4, 12, 35, 98, 239] // 0-20, 20-40, 40-60, 60-80, 80-100
      },

      // Recent Activity Log
      recentActivity: [
        { id: 1, text: 'ExDark night street sample analyzed', time: '2 mins ago', badge: 'Image' },
        { id: 2, text: 'Illumination map generated (Score: 24/100)', time: '4 mins ago', badge: 'Illumination' },
        { id: 3, text: '5 objects detected via RT-DETR', time: '7 mins ago', badge: 'Detection' },
        { id: 4, text: 'Live camera session completed (25.4 avg FPS)', time: '12 mins ago', badge: 'Camera' }
      ],

      // UI Layout
      sidebarCollapsed: false,

      // Frozen frame from Live Camera for Image Analysis
      frozenAnalysis: null
    };
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.notify(key, value);
  }

  updateMetrics(newMetrics) {
    this.state.metrics = { ...this.state.metrics, ...newMetrics };
    this.notify('metrics', this.state.metrics);
  }

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.notify('settings', this.state.settings);
  }

  recordSessionFrame(frameData) {
    const s = this.state.session;
    s.totalFrames += 1;
    s.totalObjects += frameData.objects || 0;
    
    // Add to history (keep last 30)
    s.history.push({
      t: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      objects: frameData.objects || 0,
      illum: frameData.illumination || 20,
      fps: frameData.fps || 25,
      latency: frameData.latency || 40,
      conf: frameData.confidence || 85
    });
    if (s.history.length > 30) s.history.shift();

    // Update distribution
    if (frameData.confidence) {
      const idx = Math.min(Math.floor(frameData.confidence / 20), 4);
      s.confidenceDistribution[idx] += 1;
    }

    this.notify('session', s);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(key, value) {
    for (const listener of this.listeners) {
      try {
        listener(key, value, this.state);
      } catch (err) {
        console.error('State listener error:', err);
      }
    }
  }
}

export const appState = new AppState();
