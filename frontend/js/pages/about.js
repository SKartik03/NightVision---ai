/**
 * NightVision AI - About Project Page
 */

export class AboutPage {
  constructor(container) {
    this.container = container;
  }

  render() {
    this.container.innerHTML = `
      <div class="panel-card" style="margin-bottom: 24px;">
        <div class="hero-pill" style="margin-bottom: 8px;">RESEARCH METHODOLOGY</div>
        <h2 class="hero-title" style="font-size: 28px; margin-bottom: 8px;">NIGHTVISION AI</h2>
        <div class="hero-tagline" style="font-size: 16px; margin-bottom: 16px;">
          "Enhancement is optimized for detectability, not merely visual appearance."
        </div>
        <p class="hero-subtitle" style="max-width: 100%; margin: 0; line-height: 1.65;">
          Standard computer vision systems fail in nocturnal and low-illumination scenarios. Rather than relying on simple,
          unconstrained image enhancement that amplifies sensor noise and causes extreme glare from vehicle headlights,
          NightVision AI pioneers a unified illumination-aware feature conditioning architecture built for real-time transformers.
        </p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 24px;">
        <!-- Problem -->
        <div class="panel-card">
          <h3 class="panel-title" style="color: #ef4444;">THE PROBLEM</h3>
          <p class="panel-subtitle">Why standard CV models fail at night</p>
          <ul style="padding-left: 20px; font-size: 13.5px; line-height: 1.65; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li>
              <strong>Severe Photon Deficiency:</strong> Low-light scenes present extreme signal attenuation, causing edge gradients of pedestrians and distant vehicles to sink below standard detection thresholds.
            </li>
            <li>
              <strong>Sensor ISO Noise Amplification:</strong> Conventional enhancement techniques (like histogram equalization or unconstrained neural enhancement) severely amplify noise grain, confusing feature backbones.
            </li>
            <li>
              <strong>Light Blooming & Dynamic Range:</strong> Streetlights and vehicle high-beams cause localized sensor saturation, blinding detectors to surrounding obstacles.
            </li>
          </ul>
        </div>

        <!-- Solution -->
        <div class="panel-card">
          <h3 class="panel-title" style="color: var(--cv-blue);">THE NIGHTVISION AI SOLUTION</h3>
          <p class="panel-subtitle">Illumination-Aware Detection Pipeline</p>
          <ul style="padding-left: 20px; font-size: 13.5px; line-height: 1.65; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
            <li>
              <strong>IlluminationNet Spatial Estimation:</strong> Decomposes incoming frames into spatial luminance maps, noise variance metrics, and dark/bright region distributions.
            </li>
            <li>
              <strong>Detection-Oriented Zero-DCE Curves:</strong> Iterative non-linear curve mappings enhance underexposed detail while clamping saturated light sources.
            </li>
            <li>
              <strong>FiLM Feature Conditioning:</strong> Modulates multi-scale RT-DETR feature channels with affine transformation parameters (gamma, beta) conditioned directly on the illumination embedding.
            </li>
          </ul>
        </div>
      </div>

      <!-- Real-World Deployment Applications -->
      <div class="panel-card" style="margin-bottom: 24px;">
        <h3 class="panel-title">PRIMARY REAL-WORLD APPLICATIONS</h3>
        <p class="panel-subtitle">Where NightVision AI makes a critical impact</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 14px;">
          <div style="padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div style="font-size: 24px; margin-bottom: 6px;">🚗</div>
            <strong style="font-size: 13.5px; display: block; color: var(--text-primary); margin-bottom: 4px;">Traffic & Road Safety</strong>
            <span style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">Reliable vehicle and pedestrian detection in unlit intersections and rural highways.</span>
          </div>

          <div style="padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div style="font-size: 24px; margin-bottom: 6px;">📹</div>
            <strong style="font-size: 13.5px; display: block; color: var(--text-primary); margin-bottom: 4px;">Night Surveillance</strong>
            <span style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">Autonomous perimeter monitoring and intrusion detection without relying on costly thermal optics.</span>
          </div>

          <div style="padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div style="font-size: 24px; margin-bottom: 6px;">🧭</div>
            <strong style="font-size: 13.5px; display: block; color: var(--text-primary); margin-bottom: 4px;">Autonomous Navigation</strong>
            <span style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">Real-time low-light obstacle avoidance for delivery drones, mobile robots, and self-driving shuttles.</span>
          </div>

          <div style="padding: 14px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
            <div style="font-size: 24px; margin-bottom: 6px;">🛡️</div>
            <strong style="font-size: 13.5px; display: block; color: var(--text-primary); margin-bottom: 4px;">Critical Infrastructure</strong>
            <span style="font-size: 12px; color: var(--text-muted); line-height: 1.5;">Port, railway, and energy grid visual inspection during night shifts and adverse weather.</span>
          </div>
        </div>
      </div>
    `;
  }
}
