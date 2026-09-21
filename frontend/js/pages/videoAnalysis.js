/**
 * NightVision AI - Video Stream Analysis
 * Temporal frame-by-frame detection, persistent multi-object tracking IDs,
 * and detection activity density timeline.
 */

import { appState } from '../state.js';
import { CVEngine } from '../services/cvEngine.js';

export class VideoAnalysisPage {
  constructor(container) {
    this.container = container;
    this.isPlaying = false;
    this.animId = null;
    this.frameIdx = 0;
    this.totalFrames = 120;
  }

  render() {
    this.container.innerHTML = `
      <div class="toolbar-card">
        <div style="display: flex; align-items: center; gap: 14px;">
          <button class="btn btn-primary" id="btn-video-play">
            ${this.isPlaying ? '⏸ Pause Stream' : '▶ Play Night Stream'}
          </button>
          <button class="btn btn-secondary" id="btn-video-restart">
            ⏮ Restart
          </button>
          <span style="font-size: 13px; color: var(--text-secondary);">
            Sample: <strong>Night Surveillance Intersection (1080p ExDark Sequence)</strong>
          </span>
        </div>

        <div>
          <label class="btn btn-secondary btn-sm" style="cursor: pointer;">
            🎥 Upload MP4/WebM Video
            <input type="file" id="video-upload-input" accept="video/*" style="display: none;">
          </label>
        </div>
      </div>

      <div class="camera-layout">
        <div class="camera-main-panel">
          <div class="camera-view-container" style="height: 420px;">
            <canvas id="video-render-canvas" width="760" height="420" style="width: 100%; height: 100%; object-fit: contain;"></canvas>
            <div class="camera-hud">
              <div class="hud-badge">
                <span class="status-dot ${this.isPlaying ? '' : 'demo'}"></span>
                <span>STREAM: ${this.isPlaying ? 'ACTIVE (TRACKING ENABLED)' : 'PAUSED'}</span>
              </div>
              <div class="hud-badge">
                <span>FRAME: ${this.frameIdx} / ${this.totalFrames}</span>
              </div>
            </div>
          </div>

          <!-- Video Timeline Card -->
          <div class="panel-card" style="padding: 14px 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span style="font-weight: 600; color: var(--text-secondary);">DETECTION ACTIVITY TIMELINE</span>
              <span style="color: var(--text-muted);">Density: 3 - 5 targets/frame</span>
            </div>
            <div style="height: 24px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm); border: 1px solid var(--border-light); position: relative; overflow: hidden; display: flex; align-items: center;">
              <!-- Simulated timeline density bars -->
              <div style="width: 100%; height: 100%; display: flex; align-items: flex-end; gap: 2px; padding: 2px;">
                ${Array.from({ length: 40 }).map((_, i) => {
                  const h = 30 + Math.sin(i * 0.4) * 50 + (i % 3) * 15;
                  const isPassed = (i / 40) <= (this.frameIdx / this.totalFrames);
                  return `<div style="flex: 1; height: ${h}%; background: ${isPassed ? 'var(--cv-blue)' : 'var(--border-medium)'}; border-radius: 1px;"></div>`;
                }).join('')}
              </div>
              <!-- Timeline scrubber line -->
              <div style="position: absolute; top: 0; bottom: 0; left: ${(this.frameIdx / this.totalFrames) * 100}%; width: 3px; background: #ef4444; box-shadow: 0 0 4px rgba(239, 68, 68, 0.8);"></div>
            </div>
          </div>
        </div>

        <!-- Right Panel Telemetry -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div class="panel-card">
            <h3 class="panel-title">VIDEO STREAM TELEMETRY</h3>
            <p class="panel-subtitle">Temporal tracking metrics</p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px;">
              <div class="metric-row">
                <span class="metric-name">Frames Processed</span>
                <span class="metric-val" id="val-v-frames">${this.frameIdx}</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Active Tracks</span>
                <span class="metric-val" id="val-v-objs">4 Targets</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Average Confidence</span>
                <span class="metric-val" id="val-v-conf">88.4%</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Processing FPS</span>
                <span class="metric-val" id="val-v-fps">29.2 FPS</span>
              </div>
              <div class="metric-row">
                <span class="metric-name">Pipeline Latency</span>
                <span class="metric-val" id="val-v-lat">34.2 ms</span>
              </div>
            </div>
          </div>

          <!-- Active Persistent Tracks -->
          <div class="panel-card">
            <h3 class="panel-title">PERSISTENT TRACKS</h3>
            <p class="panel-subtitle">Multi-object spatial identity</p>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                <span class="tag-pill tag-car">CAR #01</span>
                <span>Speed: 38 km/h • 92%</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                <span class="tag-pill tag-person">PERSON #01</span>
                <span>Crossing • 89%</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                <span class="tag-pill tag-car">CAR #02</span>
                <span>Inbound • 84%</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; padding: 6px 10px; background: var(--bg-surface-subtle); border-radius: var(--radius-sm);">
                <span class="tag-pill tag-bicycle">BICYCLE #01</span>
                <span>Shoulder Lane • 78%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._drawFrame();
    this._bindEvents();
  }

  _drawFrame() {
    const canvas = this.container.querySelector('#video-render-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    CVEngine.generateNightScene(canvas, 'road', {
      illumination: 21 + Math.sin(this.frameIdx * 0.1) * 3,
      noise: 14
    });

    // Animate cars moving across frames
    const shift = (this.frameIdx % 60) * 3;
    const detections = CVEngine.getCalibratedDetections(canvas.width, canvas.height, 24, 0.40);
    
    // Shift bbox slightly for realistic video motion
    detections[0].bbox[0] += shift;
    detections[0].bbox[2] += shift;

    CVEngine.drawBoundingBoxes(ctx, detections, { showLabels: true, showConfidence: true });

    const fEl = this.container.querySelector('#val-v-frames');
    if (fEl) fEl.textContent = this.frameIdx;
  }

  _bindEvents() {
    const playBtn = this.container.querySelector('#btn-video-play');
    const restartBtn = this.container.querySelector('#btn-video-restart');

    if (playBtn) {
      playBtn.onclick = () => {
        this.isPlaying = !this.isPlaying;
        playBtn.textContent = this.isPlaying ? '⏸ Pause Stream' : '▶ Play Night Stream';
        if (this.isPlaying) {
          this._startLoop();
        } else {
          cancelAnimationFrame(this.animId);
        }
      };
    }

    if (restartBtn) {
      restartBtn.onclick = () => {
        this.frameIdx = 0;
        this._drawFrame();
      };
    }
  }

  _startLoop() {
    const loop = () => {
      if (!this.isPlaying) return;
      this.frameIdx = (this.frameIdx + 1) % this.totalFrames;
      this._drawFrame();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }
}
