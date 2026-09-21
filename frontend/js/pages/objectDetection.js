/**
 * NightVision AI - Object Detection Workspace
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class ObjectDetectionPage {
  constructor(container) {
    this.container = container;
    this.threshold = appState.get('settings').confidenceThreshold || 0.45;
  }

  render() {
    const detections = CVEngine.getCalibratedDetections(720, 420, 24, this.threshold);
    const modelMode = appState.get('modelMode');

    this.container.innerHTML = `
      <div class="notice-banner">
        <span>🎯 <strong>Detection Architecture:</strong> RT-DETR (Real-Time DEtection TRansformer with Intra-Scale Interaction & Cross-Scale Fusion).</span>
        <span class="tag-pill" style="margin-left: auto; background: var(--status-amber-bg); color: #92400e;">
          ${modelMode === 'DEMO' ? 'DEMO DETECTION MODE (Calibrated ExDark Baseline)' : 'ONNX Weights Active'}
        </span>
      </div>

      <div class="camera-layout">
        <!-- Main Detection Stage -->
        <div class="camera-main-panel">
          <div class="camera-view-container" style="height: 440px;">
            <canvas id="det-workspace-canvas" width="760" height="440" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
            <div class="canvas-badge">RT-DETR INFERENCE OVERLAY</div>
          </div>

          <!-- Threshold Control Bar -->
          <div class="camera-controls-bar">
            <div class="control-group" style="flex: 1; max-width: 480px;">
              <div class="control-label">
                <span>Confidence Threshold Filter:</span>
                <span id="label-det-thresh" style="font-weight: 700; color: var(--cv-blue);">${Math.round(this.threshold * 100)}%</span>
              </div>
              <input type="range" class="range-slider" min="20" max="95" value="${Math.round(this.threshold * 100)}" id="slider-det-thresh">
            </div>

            <div style="display: flex; gap: 10px;">
              <button class="btn btn-primary" id="btn-apply-thresh">
                Apply Filter
              </button>
              <button class="btn btn-secondary" id="btn-inspect-xai">
                Explain in XAI →
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side Detection Table -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="panel-card" style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 class="panel-title" style="margin-bottom: 0;">DETECTED TARGETS</h3>
              <span class="pipeline-badge" id="badge-target-count">${detections.length} Objects</span>
            </div>

            <table class="data-table">
              <thead>
                <tr>
                  <th>Object</th>
                  <th>Confidence</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody id="det-table-body">
                ${detections.map(d => `
                  <tr>
                    <td>
                      <div style="font-weight: 600; color: var(--text-primary);">${d.trackingId || d.class.toUpperCase()}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${d.focusArea}</div>
                    </td>
                    <td>
                      <span class="tag-pill tag-${d.class === 'person' ? 'person' : d.class === 'car' ? 'car' : 'bicycle'}">
                        ${d.confidencePct}%
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-secondary btn-sm btn-xai-select" data-id="${d.id}">
                        Explain
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    this._drawCanvas(detections);
    this._bindEvents();
  }

  _drawCanvas(detections) {
    const canvas = this.container.querySelector('#det-workspace-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    CVEngine.generateNightScene(canvas, 'road', { illumination: 24, noise: 12 });
    CVEngine.drawBoundingBoxes(ctx, detections, {
      showLabels: true,
      showConfidence: true,
      selectedId: appState.get('selectedObjectId')
    });
  }

  _bindEvents() {
    const slider = this.container.querySelector('#slider-det-thresh');
    const label = this.container.querySelector('#label-det-thresh');
    const applyBtn = this.container.querySelector('#btn-apply-thresh');
    const xaiBtn = this.container.querySelector('#btn-inspect-xai');

    if (slider) {
      slider.oninput = (e) => {
        this.threshold = parseInt(e.target.value, 10) / 100;
        if (label) label.textContent = `${Math.round(this.threshold * 100)}%`;
      };
    }

    if (applyBtn) {
      applyBtn.onclick = () => {
        appState.updateSettings({ confidenceThreshold: this.threshold });
        this.render();
      };
    }

    if (xaiBtn) {
      xaiBtn.onclick = () => {
        appState.set('currentPage', 'explainable_ai');
      };
    }

    const selectBtns = this.container.querySelectorAll('.btn-xai-select');
    selectBtns.forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        appState.set('selectedObjectId', id);
        appState.set('currentPage', 'explainable_ai');
      };
    });
  }
}
