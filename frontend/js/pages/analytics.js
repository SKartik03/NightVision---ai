/**
 * NightVision AI - Vision Analytics Dashboard
 * Real session telemetry with responsive SVG charts:
 * 1. Detection Count Over Time
 * 2. Confidence Distribution Histogram
 * 3. Illumination Level History
 * 4. Processing FPS & Latency
 */

import { appState } from '../state.js';

export class AnalyticsPage {
  constructor(container) {
    this.container = container;
  }

  render() {
    const session = appState.get('session');
    const history = session.history || [];

    this.container.innerHTML = `
      <div class="notice-banner">
        <span>📊 <strong>Session Telemetry:</strong> Aggregated statistics from active live camera, image, and video runs.</span>
        <span class="tag-pill" style="margin-left: auto; background: var(--status-amber-bg); color: #92400e;">
          DEMO SESSION
        </span>
      </div>

      <!-- Top Analytics Metrics Grid -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">
            <span>Total Frames</span>
            <span>🎞️</span>
          </div>
          <div class="metric-value">${session.totalFrames}</div>
          <div class="metric-subtext">Processed Ingests</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Objects Detected</span>
            <span>🎯</span>
          </div>
          <div class="metric-value">${session.totalObjects}</div>
          <div class="metric-subtext">RT-DETR Bounding Boxes</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Avg Confidence</span>
            <span>📈</span>
          </div>
          <div class="metric-value">${session.avgConfidence}%</div>
          <div class="metric-subtext">Mean Classification Score</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Mean Illumination</span>
            <span>🌙</span>
          </div>
          <div class="metric-value">${session.avgIllumination} / 100</div>
          <div class="metric-subtext">Low-Light Exposure Avg</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">
            <span>Average Throughput</span>
            <span>⚡</span>
          </div>
          <div class="metric-value">${session.avgFps} FPS</div>
          <div class="metric-subtext">Latency: ${session.avgLatencyMs} ms</div>
        </div>
      </div>

      <!-- 4 SVG Charts Grid -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
        <!-- Chart 1: Detection Count Over Time -->
        <div class="chart-container">
          <div class="chart-header">
            <span class="chart-title">1. Detection Count Over Time</span>
            <span style="font-size: 11px; color: var(--cv-blue); font-weight: 600;">● Targets</span>
          </div>
          <svg class="chart-svg" id="chart-detections" viewBox="0 0 460 160"></svg>
        </div>

        <!-- Chart 2: Confidence Distribution (Histogram) -->
        <div class="chart-container">
          <div class="chart-header">
            <span class="chart-title">2. Confidence Distribution Histogram</span>
            <span style="font-size: 11px; color: var(--cv-teal); font-weight: 600;">● Frequency</span>
          </div>
          <svg class="chart-svg" id="chart-confidence" viewBox="0 0 460 160"></svg>
        </div>

        <!-- Chart 3: Illumination Level Over Time -->
        <div class="chart-container">
          <div class="chart-header">
            <span class="chart-title">3. Illumination Level Over Time (0 - 100)</span>
            <span style="font-size: 11px; color: #f59e0b; font-weight: 600;">● Luminance Score</span>
          </div>
          <svg class="chart-svg" id="chart-illumination" viewBox="0 0 460 160"></svg>
        </div>

        <!-- Chart 4: FPS & Latency History -->
        <div class="chart-container">
          <div class="chart-header">
            <span class="chart-title">4. Real-Time Inference FPS</span>
            <span style="font-size: 11px; color: #10b981; font-weight: 600;">● Frames / Second</span>
          </div>
          <svg class="chart-svg" id="chart-fps" viewBox="0 0 460 160"></svg>
        </div>
      </div>
    `;

    this._renderCharts(history, session.confidenceDistribution);
  }

  _renderCharts(history, confDist) {
    this._renderLineChart('#chart-detections', history, 'objects', '#2563eb', 0, 8);
    this._renderHistogram('#chart-confidence', confDist, '#0d9488');
    this._renderAreaChart('#chart-illumination', history, 'illum', '#f59e0b', 0, 60);
    this._renderLineChart('#chart-fps', history, 'fps', '#10b981', 15, 35);
  }

  _renderLineChart(selector, data, key, color, minVal, maxVal) {
    const svg = this.container.querySelector(selector);
    if (!svg || !data.length) return;

    const w = 460;
    const h = 160;
    const padL = 35;
    const padR = 20;
    const padT = 20;
    const padB = 25;

    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    let points = [];
    data.forEach((d, i) => {
      const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
      const y = padT + chartH - ((d[key] - minVal) / (maxVal - minVal)) * chartH;
      points.push(`${x},${Math.max(padT, Math.min(padT + chartH, y))}`);
    });

    svg.innerHTML = `
      <!-- Grid lines -->
      <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" class="chart-grid-line" />
      <line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${w - padR}" y2="${padT + chartH * 0.5}" class="chart-grid-line" />
      <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border-medium)" />

      <!-- Y Axis Labels -->
      <text x="${padL - 6}" y="${padT + 4}" text-anchor="end" class="chart-axis-text">${maxVal}</text>
      <text x="${padL - 6}" y="${padT + chartH * 0.5 + 4}" text-anchor="end" class="chart-axis-text">${Math.round((maxVal + minVal) / 2)}</text>
      <text x="${padL - 6}" y="${padT + chartH}" text-anchor="end" class="chart-axis-text">${minVal}</text>

      <!-- Data Line -->
      <polyline fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" points="${points.join(' ')}" />

      <!-- Data dots -->
      ${points.map(pt => {
        const [px, py] = pt.split(',');
        return `<circle cx="${px}" cy="${py}" r="4" fill="#ffffff" stroke="${color}" stroke-width="2" />`;
      }).join('')}
    `;
  }

  _renderAreaChart(selector, data, key, color, minVal, maxVal) {
    const svg = this.container.querySelector(selector);
    if (!svg || !data.length) return;

    const w = 460;
    const h = 160;
    const padL = 35;
    const padR = 20;
    const padT = 20;
    const padB = 25;

    const chartW = w - padL - padR;
    const chartH = h - padT - padB;

    let points = [];
    data.forEach((d, i) => {
      const x = padL + (i / Math.max(data.length - 1, 1)) * chartW;
      const y = padT + chartH - ((d[key] - minVal) / (maxVal - minVal)) * chartH;
      points.push(`${x},${Math.max(padT, Math.min(padT + chartH, y))}`);
    });

    const areaPoints = [
      `${padL},${padT + chartH}`,
      ...points,
      `${padL + chartW},${padT + chartH}`
    ].join(' ');

    svg.innerHTML = `
      <defs>
        <linearGradient id="area-grad-${key}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.35"/>
          <stop offset="100%" stop-color="${color}" stop-opacity="0.02"/>
        </linearGradient>
      </defs>

      <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" class="chart-grid-line" />
      <line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${w - padR}" y2="${padT + chartH * 0.5}" class="chart-grid-line" />
      <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border-medium)" />

      <text x="${padL - 6}" y="${padT + 4}" text-anchor="end" class="chart-axis-text">${maxVal}</text>
      <text x="${padL - 6}" y="${padT + chartH}" text-anchor="end" class="chart-axis-text">${minVal}</text>

      <polygon fill="url(#area-grad-${key})" points="${areaPoints}" />
      <polyline fill="none" stroke="${color}" stroke-width="2.5" points="${points.join(' ')}" />
    `;
  }

  _renderHistogram(selector, bins, color) {
    const svg = this.container.querySelector(selector);
    if (!svg) return;

    const w = 460;
    const h = 160;
    const padL = 35;
    const padR = 20;
    const padT = 20;
    const padB = 25;

    const chartW = w - padL - padR;
    const chartH = h - padT - padB;
    const maxVal = Math.max(...bins, 1);
    const binLabels = ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'];
    const barW = chartW / bins.length - 12;

    svg.innerHTML = `
      <line x1="${padL}" y1="${padT + chartH}" x2="${w - padR}" y2="${padT + chartH}" stroke="var(--border-medium)" />

      ${bins.map((val, i) => {
        const x = padL + i * (chartW / bins.length) + 6;
        const barH = (val / maxVal) * chartH;
        const y = padT + chartH - barH;
        return `
          <rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${color}" fill-opacity="0.85" />
          <text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="10" font-weight="600" fill="var(--text-secondary)">${val}</text>
          <text x="${x + barW / 2}" y="${padT + chartH + 15}" text-anchor="middle" class="chart-axis-text">${binLabels[i]}</text>
        `;
      }).join('')}
    `;
  }
}
