/**
 * NightVision AI - Introduction / Landing Page
 * Flagship hero with animated demo, full pipeline walkthrough, and feature navigation.
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class IntroductionPage {
  constructor(container) {
    this.container = container;
    this._animInterval = null;
  }

  render() {
    this.container.innerHTML = `
      <!-- Hero Section -->
      <div class="landing-hero">
        <div class="hero-pill">🔬 Research Prototype &nbsp;&middot;&nbsp; ExDark Benchmark &nbsp;&middot;&nbsp; v1.0</div>
        <h1 class="hero-title">NIGHTVISION AI</h1>
        <div class="hero-tagline">"See Beyond the Darkness"</div>
        <p class="hero-subtitle">
          Illumination-aware AI system for reliable, real-time object detection in low-light and nocturnal environments &mdash;
          powered by IlluminationNet estimation, Zero-DCE enhancement, FiLM conditioning, and RT-DETR transformer detection.
        </p>

        <div class="hero-ctas">
          <button class="btn btn-primary btn-lg" id="btn-explore-platform">
            Explore Platform &rarr;
          </button>
          <button class="btn btn-teal btn-lg" id="btn-start-camera">
            📷 Start Live Detection
          </button>
          <button class="btn btn-secondary btn-lg" id="btn-view-analysis">
            🖼️ Image Analysis
          </button>
        </div>

        <!-- Interactive Night Scene Canvas -->
        <div class="hero-visual-card">
          <div style="position: relative;">
            <canvas id="hero-interactive-canvas" class="hero-canvas" width="900" height="400"></canvas>
            <div style="position: absolute; top: 12px; left: 14px; display: flex; gap: 8px; pointer-events: none;">
              <div style="background: rgba(15,23,42,0.85); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.12); color: #ef4444; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">● REC DEMO</div>
              <div style="background: rgba(15,23,42,0.85); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.12); color: #38bdf8; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.05em;">RT-DETR ACTIVE</div>
            </div>
            <div style="position: absolute; bottom: 12px; right: 14px; background: rgba(15,23,42,0.85); backdrop-filter: blur(6px); border: 1px solid rgba(255,255,255,0.12); color: #94a3b8; padding: 5px 12px; border-radius: 4px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
              <span style="color: #38bdf8;">&#9728; 22 / 100</span>
              <span>|</span>
              <span style="color: #4ade80;">5 objects</span>
              <span>|</span>
              <span>~30 FPS</span>
            </div>
          </div>
          <div class="hero-visual-caption">
            <span>&#9679; Synthetic ExDark Night Road Scene &mdash; Real-time Bounding Boxes + Spatial Illumination Cones</span>
            <span style="color: #38bdf8; font-weight: 700;">🌙 NIGHT CONDITION &middot; Illumination Score: 22/100</span>
          </div>
        </div>
      </div>

      <!-- Problem Statement -->
      <div class="panel-card" style="margin-bottom: 32px; border-left: 4px solid var(--cv-blue);">
        <h3 class="panel-title" style="font-size: 18px; margin-bottom: 8px;">Why Low-Light Computer Vision Is Hard</h3>
        <p class="panel-subtitle">Standard object detectors trained on daytime datasets degrade catastrophically at night, missing critical targets or generating false positives.</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 16px;">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: #fee2e2; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">📡</div>
            <div>
              <strong style="color: var(--text-primary); display: block; margin-bottom: 4px; font-size: 14px;">Severe Signal-to-Noise Ratio</strong>
              <span style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">Photon scarcity causes exposure gain to amplify sensor noise rather than salient structural edges.</span>
            </div>
          </div>
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: #fef3c7; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">💡</div>
            <div>
              <strong style="color: var(--text-primary); display: block; margin-bottom: 4px; font-size: 14px;">Over-Exposure Blooming</strong>
              <span style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">Headlamps and neon displays bloom into glare that blinds traditional histogram equalizers like CLAHE.</span>
            </div>
          </div>
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            <div style="width: 38px; height: 38px; border-radius: 8px; background: var(--cv-blue-subtle); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0;">🧠</div>
            <div>
              <strong style="color: var(--text-primary); display: block; margin-bottom: 4px; font-size: 14px;">Distribution Shift</strong>
              <span style="font-size: 13px; color: var(--text-secondary); line-height: 1.55;">Models trained on COCO (daytime) fail on ExDark night distributions &mdash; causing accuracy collapse.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 7-Stage Pipeline -->
      <div class="panel-card" style="margin-bottom: 32px;">
        <h3 class="panel-title" style="font-size: 18px; margin-bottom: 4px;">The NightVision AI Pipeline</h3>
        <p class="panel-subtitle">A 7-stage modular pipeline transforms raw night-time input into reliable, explainable object detections.</p>

        <div style="display: flex; flex-direction: column; gap: 0; margin-top: 20px;">
          ${[
            { icon: '📥', stage: 'Input', color: '#dbeafe', border: '#93c5fd', desc: 'Raw low-light frame from camera, image upload, or video stream. Supports JPEG, PNG, MP4, WebM, and WebRTC.' },
            { icon: '🌡️', stage: 'Illumination Estimation', color: '#fef3c7', border: '#fcd34d', desc: 'IlluminationNet computes per-pixel luminance maps, scene condition (Night / Low-Light / Moderate), and noise variance estimates.' },
            { icon: '✨', stage: 'Zero-DCE Enhancement', color: '#d1fae5', border: '#6ee7b7', desc: 'Detection-oriented curve iteration L(x) = L(x) + A·L(x)·(1−L(x)), conditioned on local illumination scores. Preserves dynamic range.' },
            { icon: '🔗', stage: 'FiLM Conditioning', color: '#ede9fe', border: '#c4b5fd', desc: 'Feature-wise Linear Modulation applies illumination-derived γ and β scale/shift to transformer feature maps for scene-aware inference.' },
            { icon: '🎯', stage: 'RT-DETR Detection', color: '#fee2e2', border: '#fca5a5', desc: 'Real-Time DEtection TRansformer with cross-attention queries on illumination-aware, conditioned feature maps. No NMS required.' },
            { icon: '👁️', stage: 'Explainability (Grad-CAM)', color: '#fce7f3', border: '#f9a8d4', desc: 'Gradient-weighted Class Activation Maps and transformer attention weights reveal why each object was or was not detected.' },
            { icon: '📊', stage: 'Analytics & Telemetry', color: '#f0fdf4', border: '#86efac', desc: 'Continuous session telemetry: FPS, latency, confidence distributions, and illumination-vs-accuracy correlation charts.' }
          ].map((s, i) => `
            <div style="display: flex; gap: 16px; align-items: flex-start; padding: 14px 0; ${i < 6 ? 'border-bottom: 1px solid var(--border-light);' : ''}">
              <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
                <div style="width: 42px; height: 42px; border-radius: 10px; background: ${s.color}; border: 1.5px solid ${s.border}; display: flex; align-items: center; justify-content: center; font-size: 19px; flex-shrink: 0; z-index: 1;">${s.icon}</div>
                ${i < 6 ? '<div style="width: 2px; height: 22px; background: var(--border-light); margin-top: 2px;"></div>' : ''}
              </div>
              <div style="flex: 1; padding-top: 5px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-muted);">STAGE ${i + 1}</span>
                  <strong style="font-size: 14px; color: var(--text-primary);">${s.stage}</strong>
                </div>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.55; margin: 0;">${s.desc}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Feature Cards -->
      <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 16px;">Platform Sections</h3>
      <div class="features-grid" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
        <div class="feature-card" id="feat-camera" style="cursor: pointer;">
          <div class="feature-icon-wrapper feature-icon-1">📷</div>
          <h3 class="feature-title">LIVE CAMERA</h3>
          <p class="feature-desc">Real WebRTC camera feed with live neural inference. Every frame processed through the full 7-stage pipeline in browser.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: var(--cv-blue-subtle); color: var(--cv-blue);">&rarr; Open Live Camera</span></div>
        </div>
        <div class="feature-card" id="feat-image" style="cursor: pointer;">
          <div class="feature-icon-wrapper feature-icon-2">🖼️</div>
          <h3 class="feature-title">IMAGE ANALYSIS</h3>
          <p class="feature-desc">Upload your own image or use ExDark night presets. View synchronized 4-panel: Original, Illumination Map, Enhanced, Detected.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: var(--cv-teal-subtle); color: var(--cv-teal);">&rarr; Analyze Image</span></div>
        </div>
        <div class="feature-card" id="feat-compare" style="cursor: pointer;">
          <div class="feature-icon-wrapper feature-icon-3">⚖️</div>
          <h3 class="feature-title">MODEL COMPARISON</h3>
          <p class="feature-desc">Side-by-side benchmark: RAW Baseline vs CLAHE vs NightVision AI. Compare detection count, confidence, and FPS.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: var(--cv-violet-subtle); color: var(--cv-violet);">&rarr; Compare Models</span></div>
        </div>
        <div class="feature-card" id="feat-explainable" style="cursor: pointer;">
          <div class="feature-icon-wrapper" style="background: #fee2e2; color: #dc2626;">🔍</div>
          <h3 class="feature-title">EXPLAINABLE AI</h3>
          <p class="feature-desc">Grad-CAM attention heatmaps show exactly which regions activated detection. Understand the why behind every prediction.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: #fee2e2; color: #991b1b;">&rarr; Inspect Attention</span></div>
        </div>
        <div class="feature-card" id="feat-simulator" style="cursor: pointer;">
          <div class="feature-icon-wrapper" style="background: #fef3c7; color: #d97706;">🎛️</div>
          <h3 class="feature-title">CONDITION SIMULATOR</h3>
          <p class="feature-desc">Simulate Night, Foggy Night, Rainy Night, and Dusk presets. Adjust illumination, noise, and blur in real-time to stress-test the pipeline.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: #fef3c7; color: #92400e;">&rarr; Open Simulator</span></div>
        </div>
        <div class="feature-card" id="feat-analytics" style="cursor: pointer;">
          <div class="feature-icon-wrapper" style="background: #f0fdf4; color: #059669;">📊</div>
          <h3 class="feature-title">ANALYTICS</h3>
          <p class="feature-desc">Session performance telemetry with FPS trends, confidence histograms, and illumination vs accuracy correlation charts.</p>
          <div style="margin-top: auto; padding-top: 16px;"><span class="tag-pill" style="background: #f0fdf4; color: #166534;">&rarr; View Analytics</span></div>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div class="notice-banner" style="margin-top: 8px;">
        <span style="font-size: 16px;">🔒</span>
        <span>
          <strong>Privacy-First Architecture:</strong> All computer vision inference runs entirely in your browser using TensorFlow.js (COCO-SSD).
          Camera frames, images, and videos never leave your device. The optional FastAPI backend handles preprocessing and analytics only.
        </span>
      </div>
    `;

    // Render hero canvas
    const canvas = this.container.querySelector('#hero-interactive-canvas');
    if (canvas) {
      CVEngine.generateNightScene(canvas, 'road', { illumination: 22, noise: 12 });
      const ctx = canvas.getContext('2d');
      const detections = CVEngine.getCalibratedDetections(canvas.width, canvas.height, 22, 0.40);
      CVEngine.drawBoundingBoxes(ctx, detections, { showLabels: true, showConfidence: true });
    }

    // Attach CTA events
    this.container.querySelector('#btn-explore-platform').onclick = () => appState.set('currentPage', 'dashboard');
    this.container.querySelector('#btn-start-camera').onclick = () => appState.set('currentPage', 'camera');
    this.container.querySelector('#btn-view-analysis').onclick = () => appState.set('currentPage', 'image_analysis');
    this.container.querySelector('#feat-camera').onclick = () => appState.set('currentPage', 'camera');
    this.container.querySelector('#feat-image').onclick = () => appState.set('currentPage', 'image_analysis');
    this.container.querySelector('#feat-compare').onclick = () => appState.set('currentPage', 'model_comparison');
    this.container.querySelector('#feat-explainable').onclick = () => appState.set('currentPage', 'explainable_ai');
    this.container.querySelector('#feat-simulator').onclick = () => appState.set('currentPage', 'simulator');
    this.container.querySelector('#feat-analytics').onclick = () => appState.set('currentPage', 'analytics');
  }
}
