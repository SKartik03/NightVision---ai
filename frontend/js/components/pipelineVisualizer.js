/**
 * NightVision AI - AI Pipeline Visualization Component
 * Permanent 7-stage visual pipeline showing real-time execution flow.
 */

import { appState } from '../state.js';

export class PipelineVisualizerComponent {
  constructor(container) {
    this.container = container;
    this.stages = [
      { id: 'input', label: 'Input', icon: '📷' },
      { id: 'illumination', label: 'Illumination', icon: '🌙' },
      { id: 'enhancement', label: 'IlluminationNet', icon: '✨' },
      { id: 'fusion', label: 'Feature Fusion', icon: '🔥' },
      { id: 'rtdetr', label: 'RT-DETR', icon: '🎯' },
      { id: 'detection', label: 'Detection', icon: '📦' },
      { id: 'explain', label: 'Explanation', icon: '👁️' }
    ];

    appState.subscribe((key) => {
      if (key === 'activePipelineStage' || key === 'currentInputType') {
        this.render();
      }
    });
  }

  render() {
    const activeStage = appState.get('activePipelineStage');
    const inputType = appState.get('currentInputType');
    const activeIdx = this.stages.findIndex(s => s.id === activeStage);

    this.container.innerHTML = `
      <div class="pipeline-visualizer-card">
        <div class="pipeline-header">
          <div class="pipeline-title">
            <span>⚡ Vision Pipeline Architecture</span>
            <span style="font-weight: normal; color: var(--text-muted);">(FiLM-Conditioned RT-DETR)</span>
          </div>
          <span class="pipeline-badge">
            Active: ${this.stages[activeIdx]?.label || 'Ready'}
          </span>
        </div>

        <div class="pipeline-track">
          ${this.stages.map((stage, idx) => {
            const isCompleted = idx < activeIdx;
            const isActive = idx === activeIdx;
            return `
              <div class="pipeline-node ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" id="p-node-${stage.id}">
                <span class="node-icon">${stage.icon}</span>
                <span class="node-label">${stage.label}</span>
              </div>
              ${idx < this.stages.length - 1 ? '<span class="pipeline-arrow">→</span>' : ''}
            `;
          }).join('')}
        </div>
      </div>
    `;
  }
}
