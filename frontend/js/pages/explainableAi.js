/**
 * NightVision AI - Explainable AI (Grad-CAM & Transformer Attention)
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class ExplainableAiPage {
  constructor(container) {
    this.container = container;
    this.detections = CVEngine.getCalibratedDetections(760, 420, 24, 0.40);
    this.selectedId = appState.get('selectedObjectId') || this.detections[0].id;
  }

  render() {
    const selectedObj = this.detections.find(d => d.id === this.selectedId) || this.detections[0];

    this.container.innerHTML = `
      <div class="notice-banner">
        <span>👁️ <strong>Explainability Engine:</strong> Grad-CAM and Multi-Head Cross-Attention Attribution for RT-DETR.</span>
        <span class="tag-pill" style="margin-left: auto; background: var(--status-amber-bg); color: #92400e;">
          DEMO VISUALIZATION
        </span>
      </div>

      <div class="explain-container">
        <!-- Main Attention Heatmap Viewport -->
        <div class="panel-card" style="padding: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 class="panel-title" style="margin-bottom: 2px;">ATTENTION / GRAD-CAM RECEPTIVE FIELD</h3>
              <p class="panel-subtitle" style="margin-bottom: 0;">Feature attribution heatmap for target proposal</p>
            </div>
            <span class="tag-pill tag-${selectedObj.class}">
              Target: ${selectedObj.trackingId || selectedObj.class.toUpperCase()} (${selectedObj.confidencePct}%)
            </span>
          </div>

          <div class="canvas-container" style="height: 400px;">
            <canvas id="xai-canvas" width="760" height="400" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
            <div class="canvas-badge">GRAD-CAM ATTENTION LAYER #06</div>
          </div>

          <!-- Explanation text card -->
          <div style="margin-top: 16px; padding: 14px 18px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border-left: 4px solid var(--cv-blue); font-size: 13.5px; line-height: 1.6; color: var(--text-secondary);">
            <strong style="color: var(--text-primary); display: block; margin-bottom: 4px;">Why did AI detect this?</strong>
            The visualization highlights the image regions that contributed to the model's prediction of <strong>${selectedObj.class.toUpperCase()}</strong>.
            Warm red and amber contours reveal strong transformer gradient response along illuminated edge contours (headlamps, windshield roofline, and pedestrian torso),
            while surrounding dark road noise is effectively ignored due to illumination-aware FiLM conditioning.
          </div>
        </div>

        <!-- Right Side Object Selection & Focus Region Metrics -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Target Selector -->
          <div class="panel-card">
            <h3 class="panel-title">SELECT TARGET OBJECT</h3>
            <p class="panel-subtitle">Choose a detection to inspect its attribution</p>

            <div class="object-select-list">
              ${this.detections.map(d => `
                <div class="object-select-item ${d.id === this.selectedId ? 'selected' : ''}" data-id="${d.id}">
                  <div>
                    <div style="font-weight: 600; font-size: 13px;">${d.trackingId || d.class.toUpperCase()}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${d.focusArea}</div>
                  </div>
                  <span class="tag-pill tag-${d.class}">
                    ${d.confidencePct}%
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Spatial Focus Details -->
          <div class="panel-card">
            <h3 class="panel-title">FOCUS REGION METRICS</h3>
            <p class="panel-subtitle">Bounding coordinate attributes</p>

            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div class="metric-row">
                <span class="metric-name">Class Label</span>
                <span class="metric-val" style="text-transform: capitalize;">${selectedObj.class}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Detection Confidence</span>
                <span class="metric-val">${selectedObj.confidencePct}%</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Bounding Box [X1, Y1, X2, Y2]</span>
                <span class="metric-val" style="font-family: monospace; font-size: 11px;">[${selectedObj.bbox.join(', ')}]</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Frame Coverage</span>
                <span class="metric-val">${selectedObj.focusArea}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Attribution Peak</span>
                <span class="metric-val">Receptive Field Center</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._drawAttention(selectedObj);
    this._bindEvents();
  }

  _drawAttention(obj) {
    const canvas = this.container.querySelector('#xai-canvas');
    if (!canvas) return;

    // First generate base night scene on a temp canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    CVEngine.generateNightScene(tempCanvas, 'road', { illumination: 24, noise: 10 });

    // Render Grad-CAM blend
    CVEngine.renderGradCAM(tempCanvas, canvas, obj.bbox);
  }

  _bindEvents() {
    const items = this.container.querySelectorAll('.object-select-item');
    items.forEach(item => {
      item.onclick = () => {
        this.selectedId = item.getAttribute('data-id');
        appState.set('selectedObjectId', this.selectedId);
        this.render();
      };
    });
  }
}
