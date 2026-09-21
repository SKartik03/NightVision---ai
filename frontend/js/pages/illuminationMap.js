/**
 * NightVision AI - Illumination Map & Intelligence
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class IlluminationMapPage {
  constructor(container) {
    this.container = container;
    this.exposureBias = 25; // 0 to 100
  }

  render() {
    this.container.innerHTML = `
      <div class="panel-card" style="margin-bottom: 24px;">
        <h3 class="panel-title">ILLUMINATION INTELLIGENCE</h3>
        <p class="panel-subtitle" style="max-width: 780px;">
          The illumination map provides spatial information about lighting conditions across the scene.
          IlluminationNet maps local pixel energy to predict underexposed shadows vs glare blooming,
          forming the spatial conditioning prior for RT-DETR feature modulation.
        </p>

        <!-- Interactive Dark <-> Bright Exposure Slider -->
        <div class="control-group" style="max-width: 600px; margin-top: 14px;">
          <div class="control-label">
            <span>Dark ←────────────────────────→ Bright (Scene Exposure Simulator):</span>
            <span id="label-exposure-bias" style="font-weight: 700; color: var(--cv-blue);">${this.exposureBias} / 100</span>
          </div>
          <input type="range" class="range-slider" min="5" max="95" value="${this.exposureBias}" id="slider-exposure-bias">
        </div>
      </div>

      <!-- 3 Columns: Original, Illumination Heatmap, Enhanced -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="panel-card" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--text-muted);">1. ORIGINAL LOW-LIGHT</span>
            <span class="tag-pill" style="background: var(--bg-surface-subtle); color: var(--text-muted);">Raw Input</span>
          </div>
          <div class="analysis-viewport" style="height: 250px;">
            <canvas id="illum-canvas-raw" width="480" height="280"></canvas>
            <div class="viewport-label">INPUT</div>
          </div>
        </div>

        <div class="panel-card" style="padding: 14px; border-color: var(--cv-blue-border);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--cv-blue);">2. ILLUMINATIONNET HEATMAP</span>
            <span class="tag-pill" style="background: var(--cv-blue-subtle); color: var(--cv-blue);">Spatial Prior</span>
          </div>
          <div class="analysis-viewport" style="height: 250px;">
            <canvas id="illum-canvas-heat" width="480" height="280"></canvas>
            <div class="viewport-label">HEATMAP</div>
          </div>
        </div>

        <div class="panel-card" style="padding: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-size: 11.5px; font-weight: 700; color: var(--cv-teal);">3. ENHANCED PROJECTION</span>
            <span class="tag-pill" style="background: var(--cv-teal-subtle); color: var(--cv-teal);">Zero-DCE</span>
          </div>
          <div class="analysis-viewport" style="height: 250px;">
            <canvas id="illum-canvas-enh" width="480" height="280"></canvas>
            <div class="viewport-label">ENHANCED</div>
          </div>
        </div>
      </div>

      <!-- Quantitative Spatial Metrics -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">
            <span>Illumination Score</span>
            <span>🌙</span>
          </div>
          <div class="metric-value" id="val-i-score">${this.exposureBias} / 100</div>
          <div class="metric-subtext">Global Normalized Lum</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Dark Region %</span>
            <span>🌑</span>
          </div>
          <div class="metric-value" id="val-i-dark">${Math.max(0, Math.min(100, Math.round(92 - this.exposureBias * 0.9)))}%</div>
          <div class="metric-subtext">Pixels with L &lt; 0.20</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Bright Region %</span>
            <span>💡</span>
          </div>
          <div class="metric-value" id="val-i-bright">${Math.max(1, Math.round(this.exposureBias * 0.12))}%</div>
          <div class="metric-subtext">Pixels with L &gt; 0.75</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Noise Variance</span>
            <span>📈</span>
          </div>
          <div class="metric-value" id="val-i-noise">${Math.round(22 - this.exposureBias * 0.15)} / 100</div>
          <div class="metric-subtext">Laplacian Gradient Spread</div>
        </div>
      </div>
    `;

    this._updateCanvases();
    this._bindEvents();
  }

  _updateCanvases() {
    const rawCanvas = this.container.querySelector('#illum-canvas-raw');
    const heatCanvas = this.container.querySelector('#illum-canvas-heat');
    const enhCanvas = this.container.querySelector('#illum-canvas-enh');

    if (!rawCanvas || !heatCanvas || !enhCanvas) return;

    CVEngine.generateNightScene(rawCanvas, 'road', {
      illumination: this.exposureBias,
      noise: Math.round(30 - this.exposureBias * 0.2)
    });

    CVEngine.renderIlluminationHeatmap(rawCanvas, heatCanvas);
    CVEngine.enhanceZeroDCE(rawCanvas, enhCanvas, 0.75);

    // Update displayed metrics
    const ctx = rawCanvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
    const m = CVEngine.computeLuminance(imgData);

    const sEl = this.container.querySelector('#val-i-score');
    const dEl = this.container.querySelector('#val-i-dark');
    const bEl = this.container.querySelector('#val-i-bright');
    const nEl = this.container.querySelector('#val-i-noise');

    if (sEl) sEl.textContent = `${m.illuminationScore} / 100`;
    if (dEl) dEl.textContent = `${m.darkRegionPct}%`;
    if (bEl) bEl.textContent = `${m.brightRegionPct}%`;
    if (nEl) nEl.textContent = `${m.noiseLevel} / 100`;
  }

  _bindEvents() {
    const slider = this.container.querySelector('#slider-exposure-bias');
    const label = this.container.querySelector('#label-exposure-bias');

    if (slider) {
      slider.oninput = (e) => {
        this.exposureBias = parseInt(e.target.value, 10);
        if (label) label.textContent = `${this.exposureBias} / 100`;
        this._updateCanvases();
      };
    }
  }
}
