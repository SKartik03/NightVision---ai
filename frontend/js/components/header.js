/**
 * NightVision AI - Top Header Component
 */

import { appState } from '../state.js';

export class HeaderComponent {
  constructor(container) {
    this.container = container;
    
    this.pageTitles = {
      introduction: { title: 'NIGHTVISION AI', subtitle: 'Intelligent Low-Light Object Detection & Enhancement' },
      dashboard: { title: 'VISION CONTROL CENTER', subtitle: 'Real-time overview of your low-light vision pipeline.' },
      camera: { title: 'LIVE NIGHTVISION', subtitle: 'Real-time camera feed with illumination-aware inference.' },
      image_analysis: { title: 'IMAGE ANALYSIS LAB', subtitle: 'Four-panel decomposition: Raw, Illumination, Enhanced, and Detected.' },
      video_analysis: { title: 'VIDEO STREAM ANALYSIS', subtitle: 'Multi-frame object tracking and temporal detection density.' },
      illumination_map: { title: 'ILLUMINATION INTELLIGENCE', subtitle: 'Spatial luminance distribution and scene exposure metrics.' },
      object_detection: { title: 'OBJECT DETECTION WORKSPACE', subtitle: 'RT-DETR transformer detection with confidence filtering.' },
      explainable_ai: { title: 'WHY DID AI DETECT THIS?', subtitle: 'Grad-CAM feature attribution and transformer attention inspector.' },
      model_comparison: { title: 'MODEL COMPARISON LAB', subtitle: 'Side-by-side scientific benchmark: RAW vs CLAHE vs NIGHTVISION AI.' },
      simulator: { title: 'LOW-LIGHT CONDITION SIMULATOR', subtitle: 'Simulate and stress-test computer vision under extreme lighting and weather.' },
      analytics: { title: 'VISION ANALYTICS', subtitle: 'Session performance telemetry, confidence histograms, and illumination tracking.' },
      settings: { title: 'PLATFORM SETTINGS', subtitle: 'Configure camera hardware, inference latency thresholds, and model modes.' },
      about: { title: 'ABOUT NIGHTVISION AI', subtitle: 'Research methodology, ExDark benchmark, and architecture overview.' }
    };

    appState.subscribe((key) => {
      if (key === 'currentPage' || key === 'modelMode' || key === 'backendStatus') {
        this.render();
      }
    });
  }

  render() {
    const pageId = appState.get('currentPage');
    const meta = this.pageTitles[pageId] || { title: 'NIGHTVISION AI', subtitle: 'Computer Vision Platform' };
    const modelMode = appState.get('modelMode');
    const backendStatus = appState.get('backendStatus');

    this.container.className = 'app-header';
    this.container.innerHTML = `
      <div class="header-title-group">
        <h1 class="page-title">${meta.title}</h1>
        <span class="page-subtitle">${meta.subtitle}</span>
      </div>

      <div class="header-actions">
        <div class="header-pill ${modelMode === 'DEMO' ? 'mode-demo' : 'mode-real'}" id="pill-model-mode" title="Click to toggle Model Mode">
          <span>●</span>
          <span>${modelMode === 'DEMO' ? 'DEMO MODE' : 'MODEL READY'}</span>
        </div>

        <div class="header-pill" id="pill-backend" title="Backend connectivity">
          <span>${backendStatus === 'connected' ? '🟢 FastAPI Connected' : '🔵 Local Engine (In-Browser)'}</span>
        </div>

        <button class="btn btn-secondary btn-sm" id="btn-quick-cam" title="Open Live Camera">
          📷 Camera
        </button>
      </div>
    `;

    const camBtn = this.container.querySelector('#btn-quick-cam');
    if (camBtn) {
      camBtn.onclick = () => appState.set('currentPage', 'camera');
    }

    const modePill = this.container.querySelector('#pill-model-mode');
    if (modePill) {
      modePill.onclick = () => {
        const next = modelMode === 'DEMO' ? 'REAL' : 'DEMO';
        appState.set('modelMode', next);
      };
    }
  }
}
