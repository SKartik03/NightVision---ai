/**
 * NightVision AI - Low-Light Condition Simulator
 * Interactive stress testing with environmental presets (Normal, Dusk, Night, Rain, Fog)
 * and manual sliders (Illumination, Noise, Blur, Contrast).
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class SimulatorPage {
  constructor(container) {
    this.container = container;
    this.presets = {
      normal: { name: '☀️ Normal', illumination: 85, noise: 5, blur: 0, contrast: 75 },
      dusk: { name: '🌆 Dusk', illumination: 45, noise: 15, blur: 5, contrast: 55 },
      night: { name: '🌙 Night', illumination: 18, noise: 35, blur: 10, contrast: 35 },
      rain: { name: '🌧️ Rainy Night', illumination: 14, noise: 55, blur: 25, contrast: 40 },
      fog: { name: '🌫️ Foggy Night', illumination: 22, noise: 30, blur: 45, contrast: 20 }
    };
    this.currentPreset = 'night';
    this.params = { ...this.presets.night };
  }

  render() {
    this.container.innerHTML = `
      <div class="panel-card" style="margin-bottom: 20px;">
        <h3 class="panel-title">ENVIRONMENTAL STRESS TEST SIMULATOR</h3>
        <p class="panel-subtitle">
          Simulate challenging low-light physics and weather conditions to evaluate detector robustness.
        </p>

        <!-- Presets Row -->
        <div class="sample-presets-bar" style="margin-top: 10px;">
          ${Object.entries(this.presets).map(([k, v]) => `
            <button class="preset-chip ${this.currentPreset === k ? 'active' : ''}" data-preset="${k}">
              ${v.name}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- 3-Step Live Preview: BEFORE -> AFTER -> DETECTION -->
      <div class="simulator-preview-grid">
        <!-- 1. Before -->
        <div class="panel-card" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted);">1. BEFORE (ENVIRONMENT)</span>
            <span class="tag-pill" style="background: var(--bg-surface-subtle); color: var(--text-muted);">Simulated</span>
          </div>
          <div class="analysis-viewport" style="height: 240px;">
            <canvas id="sim-canvas-before" width="480" height="260"></canvas>
            <div class="viewport-label">BEFORE</div>
          </div>
        </div>

        <!-- 2. After -->
        <div class="panel-card" style="padding: 14px; border-color: var(--cv-teal-border);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--cv-teal);">2. AFTER (ENHANCED)</span>
            <span class="tag-pill" style="background: var(--cv-teal-subtle); color: var(--cv-teal);">Zero-DCE</span>
          </div>
          <div class="analysis-viewport" style="height: 240px;">
            <canvas id="sim-canvas-after" width="480" height="260"></canvas>
            <div class="viewport-label">AFTER</div>
          </div>
        </div>

        <!-- 3. Detection -->
        <div class="panel-card" style="padding: 14px; border-color: var(--cv-blue-border);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--cv-blue);">3. DETECTION (RT-DETR)</span>
            <span class="tag-pill" style="background: var(--cv-blue-subtle); color: var(--cv-blue);">Inference</span>
          </div>
          <div class="analysis-viewport" style="height: 240px;">
            <canvas id="sim-canvas-det" width="480" height="260"></canvas>
            <div class="viewport-label">DETECTION</div>
          </div>
        </div>
      </div>

      <!-- Manual Controls Card -->
      <div class="panel-card">
        <h3 class="panel-title" style="margin-bottom: 14px;">MANUAL OPTICAL PARAMETERS</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px;">
          <!-- Illumination Slider -->
          <div class="control-group">
            <div class="control-label">
              <span>Ambient Illumination:</span>
              <span id="lbl-param-illum" style="font-weight: 700; color: var(--cv-blue);">${this.params.illumination} / 100</span>
            </div>
            <input type="range" class="range-slider" min="5" max="95" value="${this.params.illumination}" id="sl-param-illum">
          </div>

          <!-- Noise Slider -->
          <div class="control-group">
            <div class="control-label">
              <span>Sensor ISO Noise:</span>
              <span id="lbl-param-noise" style="font-weight: 700; color: var(--cv-blue);">${this.params.noise} / 100</span>
            </div>
            <input type="range" class="range-slider" min="0" max="80" value="${this.params.noise}" id="sl-param-noise">
          </div>

          <!-- Blur Slider -->
          <div class="control-group">
            <div class="control-label">
              <span>Atmospheric Blur / Fog:</span>
              <span id="lbl-param-blur" style="font-weight: 700; color: var(--cv-blue);">${this.params.blur} / 100</span>
            </div>
            <input type="range" class="range-slider" min="0" max="70" value="${this.params.blur}" id="sl-param-blur">
          </div>

          <!-- Contrast Slider -->
          <div class="control-group">
            <div class="control-label">
              <span>Scene Dynamic Contrast:</span>
              <span id="lbl-param-contrast" style="font-weight: 700; color: var(--cv-blue);">${this.params.contrast} / 100</span>
            </div>
            <input type="range" class="range-slider" min="10" max="90" value="${this.params.contrast}" id="sl-param-contrast">
          </div>
        </div>
      </div>
    `;

    this._updateSimulation();
    this._bindEvents();
  }

  _updateSimulation() {
    const beforeCanvas = this.container.querySelector('#sim-canvas-before');
    const afterCanvas = this.container.querySelector('#sim-canvas-after');
    const detCanvas = this.container.querySelector('#sim-canvas-det');

    if (!beforeCanvas || !afterCanvas || !detCanvas) return;

    // 1. Generate before scene with simulated environmental parameters
    CVEngine.generateNightScene(beforeCanvas, 'road', {
      illumination: this.params.illumination,
      noise: this.params.noise,
      blur: this.params.blur
    });

    // 2. Generate After (Zero-DCE enhanced)
    CVEngine.enhanceZeroDCE(beforeCanvas, afterCanvas, 0.80);

    // 3. Generate Detections on top of Enhanced
    detCanvas.width = afterCanvas.width;
    detCanvas.height = afterCanvas.height;
    const ctx = detCanvas.getContext('2d');
    ctx.drawImage(afterCanvas, 0, 0);

    // Detectability degrades as noise and blur increase
    const penalty = (this.params.noise * 0.3 + this.params.blur * 0.4) / 100;
    const effectiveIllum = Math.max(5, this.params.illumination * (1.0 - penalty));
    const detections = CVEngine.getCalibratedDetections(detCanvas.width, detCanvas.height, effectiveIllum, 0.45);
    CVEngine.drawBoundingBoxes(ctx, detections, { showLabels: true, showConfidence: true });
  }

  _bindEvents() {
    const chips = this.container.querySelectorAll('.preset-chip');
    chips.forEach(c => {
      c.onclick = () => {
        const pk = c.getAttribute('data-preset');
        this.currentPreset = pk;
        this.params = { ...this.presets[pk] };
        this.render();
      };
    });

    const bindSlider = (id, paramKey, labelId) => {
      const sl = this.container.querySelector(id);
      const lbl = this.container.querySelector(labelId);
      if (sl) {
        sl.oninput = (e) => {
          this.params[paramKey] = parseInt(e.target.value, 10);
          if (lbl) lbl.textContent = `${this.params[paramKey]} / 100`;
          this._updateSimulation();
        };
      }
    };

    bindSlider('#sl-param-illum', 'illumination', '#lbl-param-illum');
    bindSlider('#sl-param-noise', 'noise', '#lbl-param-noise');
    bindSlider('#sl-param-blur', 'blur', '#lbl-param-blur');
    bindSlider('#sl-param-contrast', 'contrast', '#lbl-param-contrast');
  }
}
