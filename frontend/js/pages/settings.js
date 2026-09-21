/**
 * NightVision AI - Settings Page
 */

import { appState } from '../state.js';
import { cameraService } from '../services/cameraService.js';

export class SettingsPage {
  constructor(container) {
    this.container = container;
  }

  render() {
    const settings = appState.get('settings');
    const modelMode = appState.get('modelMode');
    const backendStatus = appState.get('backendStatus');
    const backendUrl = appState.get('backendUrl');

    this.container.innerHTML = `
      <div style="max-width: 840px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
        <!-- Camera Settings -->
        <div class="panel-card">
          <h3 class="panel-title">CAMERA HARDWARE CONFIGURATION</h3>
          <p class="panel-subtitle">WebRTC stream and acquisition parameters</p>

          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Camera Resolution Preference</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Ideal frame capture dimensions</div>
              </div>
              <select id="setting-cam-res" style="padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); font-size: 13px;">
                <option value="1920x1080" ${settings.cameraResolution === '1920x1080' ? 'selected' : ''}>1080p (1920x1080)</option>
                <option value="1280x720" ${settings.cameraResolution === '1280x720' ? 'selected' : ''}>720p HD (1280x720)</option>
                <option value="640x480" ${settings.cameraResolution === '640x480' ? 'selected' : ''}>480p SD (640x480)</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Inference Rate Throttle</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Decouples inference from 60fps video rendering</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="range" class="range-slider" min="5" max="30" step="5" value="${settings.inferenceFps}" id="setting-inf-fps" style="width: 140px;">
                <span id="lbl-setting-fps" style="font-size: 12.5px; font-weight: 600; min-width: 45px;">${settings.inferenceFps} FPS</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Detection Settings -->
        <div class="panel-card">
          <h3 class="panel-title">DETECTION & TRACKING</h3>
          <p class="panel-subtitle">RT-DETR transformer inference thresholds</p>

          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Default Confidence Threshold</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Minimum probability required to output bounding proposal</div>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <input type="range" class="range-slider" min="20" max="90" value="${Math.round(settings.confidenceThreshold * 100)}" id="setting-conf-thresh" style="width: 140px;">
                <span id="lbl-setting-conf" style="font-size: 12.5px; font-weight: 600; min-width: 45px;">${Math.round(settings.confidenceThreshold * 100)}%</span>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Persistent Spatial-Temporal Tracking</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Assign consistent IDs (e.g. CAR #01, PERSON #02) across frames</div>
              </div>
              <input type="checkbox" id="setting-enable-tracking" ${settings.enableTracking ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--cv-blue); cursor: pointer;">
            </div>
          </div>
        </div>

        <!-- Visualization Settings -->
        <div class="panel-card">
          <h3 class="panel-title">VISUALIZATION & OVERLAYS</h3>
          <p class="panel-subtitle">HUD overlays and bounding box styles</p>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Render Class Labels</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Display class tags above bounding rectangles</div>
              </div>
              <input type="checkbox" id="setting-show-labels" ${settings.showBoundingLabels ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--cv-blue); cursor: pointer;">
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Render Confidence Percentage</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Include calculated confidence scores in box pills</div>
              </div>
              <input type="checkbox" id="setting-show-conf" ${settings.showConfidence ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--cv-blue); cursor: pointer;">
            </div>
          </div>
        </div>

        <!-- System & Model Mode -->
        <div class="panel-card">
          <h3 class="panel-title">SYSTEM & RUNTIME</h3>
          <p class="panel-subtitle">Model weights, execution environment, and backend connectivity</p>

          <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Execution Mode</strong>
                <div style="font-size: 12px; color: var(--text-muted);">Toggle between Demo Mode (calibrated baseline) and Active Weights</div>
              </div>
              <select id="setting-model-mode" style="padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-medium); font-size: 13px;">
                <option value="DEMO" ${modelMode === 'DEMO' ? 'selected' : ''}>Demo Mode (Calibrated)</option>
                <option value="REAL" ${modelMode === 'REAL' ? 'selected' : ''}>Active Model Weights</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="font-size: 13.5px; color: var(--text-primary);">Backend API Status</strong>
                <div style="font-size: 12px; color: var(--text-muted);">FastAPI Service URL: ${backendUrl}</div>
              </div>
              <span class="tag-pill" style="${backendStatus === 'connected' ? 'background: #dcfce7; color: #166534;' : 'background: #e2e8f0; color: #475569;'}">
                ${backendStatus === 'connected' ? '🟢 Connected' : '🔵 Local Engine Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const fpsSlider = this.container.querySelector('#setting-inf-fps');
    const confSlider = this.container.querySelector('#setting-conf-thresh');
    const trackingCheck = this.container.querySelector('#setting-enable-tracking');
    const labelsCheck = this.container.querySelector('#setting-show-labels');
    const confCheck = this.container.querySelector('#setting-show-conf');
    const modeSelect = this.container.querySelector('#setting-model-mode');

    if (fpsSlider) {
      fpsSlider.oninput = (e) => {
        const val = parseInt(e.target.value, 10);
        appState.updateSettings({ inferenceFps: val });
        this.container.querySelector('#lbl-setting-fps').textContent = `${val} FPS`;
      };
    }

    if (confSlider) {
      confSlider.oninput = (e) => {
        const val = parseInt(e.target.value, 10) / 100;
        appState.updateSettings({ confidenceThreshold: val });
        this.container.querySelector('#lbl-setting-conf').textContent = `${Math.round(val * 100)}%`;
      };
    }

    if (trackingCheck) {
      trackingCheck.onchange = (e) => {
        appState.updateSettings({ enableTracking: e.target.checked });
      };
    }

    if (labelsCheck) {
      labelsCheck.onchange = (e) => {
        appState.updateSettings({ showBoundingLabels: e.target.checked });
      };
    }

    if (confCheck) {
      confCheck.onchange = (e) => {
        appState.updateSettings({ showConfidence: e.target.checked });
      };
    }

    if (modeSelect) {
      modeSelect.onchange = (e) => {
        appState.set('modelMode', e.target.value);
      };
    }
  }
}
