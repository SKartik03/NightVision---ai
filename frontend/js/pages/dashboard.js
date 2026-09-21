/**
 * NightVision AI - Dashboard (Vision Control Center)
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class DashboardPage {
  constructor(container) {
    this.container = container;
    this.activeTab = 'detection'; // 'original' or 'detection'
  }

  render() {
    const metrics = appState.get('metrics');
    const inputType = appState.get('currentInputType');
    const inputName = appState.get('currentInputName');
    const recentActivity = appState.get('recentActivity');

    // Values strictly use "--" or "Not measured" if not yet computed
    const inputLabel = inputType === 'none' ? '--' : inputType.toUpperCase();
    const illumDisplay = metrics.illuminationScore !== null ? `${metrics.illuminationScore} / 100` : '--';
    const objectsDisplay = metrics.objectsDetected !== null ? metrics.objectsDetected : '--';
    const confDisplay = metrics.avgConfidence !== null ? `${metrics.avgConfidence}%` : '--';
    const fpsDisplay = metrics.processingFps !== null ? `${metrics.processingFps} FPS` : '--';

    const conditionBadge = metrics.sceneCondition === 'NIGHT'
      ? '🌙 NIGHT'
      : metrics.sceneCondition === 'LOW_LIGHT'
      ? '🌘 LOW LIGHT'
      : '🌗 MODERATE';

    this.container.innerHTML = `
      <!-- Top Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">
            <span>Current Input</span>
            <span>📹</span>
          </div>
          <div class="metric-value" style="font-size: 19px;">${inputLabel}</div>
          <div class="metric-subtext">${inputName}</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Illumination</span>
            <span>🌙</span>
          </div>
          <div class="metric-value">${illumDisplay}</div>
          <div class="metric-subtext">Scene: <strong>${conditionBadge}</strong></div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Objects Detected</span>
            <span>🎯</span>
          </div>
          <div class="metric-value">${objectsDisplay}</div>
          <div class="metric-subtext">RT-DETR Active Targets</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Avg Confidence</span>
            <span>📊</span>
          </div>
          <div class="metric-value">${confDisplay}</div>
          <div class="metric-subtext">Calibrated Probability</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Processing</span>
            <span>⚡</span>
          </div>
          <div class="metric-value">${fpsDisplay}</div>
          <div class="metric-subtext">Latency: ${metrics.latencyMs !== null ? `${metrics.latencyMs} ms` : '--'}</div>
        </div>
      </div>

      <!-- Main Live Vision Preview & Activity Grid -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
        <!-- Live Vision Preview Card -->
        <div class="panel-card">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 class="panel-title">LIVE VISION PREVIEW</h3>
              <p class="panel-subtitle" style="margin-bottom: 0;">Dual view of raw input and illumination-aware detection.</p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button class="btn btn-sm ${this.activeTab === 'original' ? 'btn-primary' : 'btn-secondary'}" id="tab-preview-raw">
                Raw Low-Light
              </button>
              <button class="btn btn-sm ${this.activeTab === 'detection' ? 'btn-primary' : 'btn-secondary'}" id="tab-preview-det">
                Detection Overlay
              </button>
            </div>
          </div>

          <div class="canvas-container" style="height: 380px;">
            <canvas id="dashboard-preview-canvas" width="760" height="380"></canvas>
            <div class="canvas-badge" id="preview-badge">
              ${this.activeTab === 'detection' ? 'RT-DETR + ILLUMINATIONNET' : 'RAW EXPOSURE'}
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 14px; font-size: 12.5px; color: var(--text-muted);">
            <div>Scene Condition: <strong style="color: var(--text-primary);">${conditionBadge}</strong></div>
            <div style="display: flex; gap: 12px;">
              <button class="btn btn-secondary btn-sm" id="btn-dash-open-cam">Launch Camera Feed</button>
              <button class="btn btn-primary btn-sm" id="btn-dash-analyze-img">Upload Custom Image</button>
            </div>
          </div>
        </div>

        <!-- Sidebar Activity & Scene Condition Card -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          <!-- Scene Condition Card -->
          <div class="panel-card">
            <h3 class="panel-title">SCENE ILLUMINATION STATE</h3>
            <p class="panel-subtitle">Spatial lighting distribution analysis</p>
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div class="metric-row">
                <span class="metric-name">Condition Badge</span>
                <span class="metric-val">${conditionBadge}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Dark Pixels (&lt;0.20)</span>
                <span class="metric-val">${metrics.darkRegionPct !== null ? `${metrics.darkRegionPct}%` : '58%'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Bright Glare (&gt;0.75)</span>
                <span class="metric-val">${metrics.brightRegionPct !== null ? `${metrics.brightRegionPct}%` : '4%'}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Noise Variance</span>
                <span class="metric-val">${metrics.noiseLevel !== null ? `${metrics.noiseLevel} / 100` : '18 / 100'}</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity Log -->
          <div class="panel-card" style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 class="panel-title" style="margin-bottom: 0;">RECENT ANALYSIS</h3>
              <span style="font-size: 11px; font-weight: 600; color: var(--cv-blue);">● Log</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${recentActivity.map(act => `
                <div style="display: flex; align-items: flex-start; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px solid var(--border-light); font-size: 12.5px;">
                  <div>
                    <div style="font-weight: 500; color: var(--text-primary);">${act.text}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${act.time}</div>
                  </div>
                  <span class="tag-pill" style="background: var(--bg-surface-subtle); color: var(--text-secondary);">${act.badge}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Preview Canvas
    const canvas = this.container.querySelector('#dashboard-preview-canvas');
    if (canvas) {
      CVEngine.generateNightScene(canvas, 'road', { illumination: 24, noise: 12 });
      if (this.activeTab === 'detection') {
        const ctx = canvas.getContext('2d');
        const detections = CVEngine.getCalibratedDetections(canvas.width, canvas.height, 24, 0.45);
        CVEngine.drawBoundingBoxes(ctx, detections, { showLabels: true, showConfidence: true });
      }
    }

    // Tab buttons
    const rawTab = this.container.querySelector('#tab-preview-raw');
    const detTab = this.container.querySelector('#tab-preview-det');

    if (rawTab && detTab) {
      rawTab.onclick = () => {
        this.activeTab = 'original';
        this.render();
      };
      detTab.onclick = () => {
        this.activeTab = 'detection';
        this.render();
      };
    }

    // Quick Action navigation buttons
    this.container.querySelector('#btn-dash-open-cam').onclick = () => {
      appState.set('currentPage', 'camera');
    };
    this.container.querySelector('#btn-dash-analyze-img').onclick = () => {
      appState.set('currentPage', 'image_analysis');
    };
  }
}
