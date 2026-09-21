/**
 * NightVision AI - Sidebar Navigation Component
 */

import { appState } from '../state.js';

export class SidebarComponent {
  constructor(container) {
    this.container = container;
    this.navItems = [
      { id: 'introduction', label: 'Home', icon: '🌙', separator: false },
      { id: 'dashboard', label: 'Dashboard', icon: '🏠', separator: false },
      { id: 'camera', label: 'Live Camera', icon: '📷', separator: false },
      { id: 'image_analysis', label: 'Image Analysis', icon: '🖼️', separator: false },
      { id: 'video_analysis', label: 'Video Analysis', icon: '🎥', separator: false },
      { id: 'illumination_map', label: 'Illumination Map', icon: '🌡️', separator: false },
      { id: 'object_detection', label: 'Object Detection', icon: '🎯', separator: false },
      { id: 'explainable_ai', label: 'Explainable AI', icon: '👁️', separator: false },
      { id: 'model_comparison', label: 'Model Comparison', icon: '⚖️', separator: false },
      { id: 'simulator', label: 'Condition Simulator', icon: '🎛️', separator: false },
      { id: 'analytics', label: 'Analytics', icon: '📊', separator: true },
      { id: 'settings', label: 'Settings', icon: '⚙️', separator: false },
      { id: 'about', label: 'About Project', icon: 'ℹ️', separator: false }
    ];

    appState.subscribe((key, val) => {
      if (key === 'currentPage' || key === 'sidebarCollapsed' || key === 'modelMode' || key === 'backendStatus') {
        this.render();
      }
    });
  }

  render() {
    const activePage = appState.get('currentPage');
    const isCollapsed = appState.get('sidebarCollapsed');
    const modelMode = appState.get('modelMode');
    const backendStatus = appState.get('backendStatus');

    this.container.className = `app-sidebar ${isCollapsed ? 'collapsed' : ''}`;

    this.container.innerHTML = `
      <div class="sidebar-header">
        <a href="#dashboard" class="sidebar-brand" id="brand-link">
          <div class="brand-icon">NV</div>
          <div class="brand-text">
            <span class="brand-name">NIGHTVISION AI</span>
            <span class="brand-badge">CV PLATFORM</span>
          </div>
        </a>
        <button class="sidebar-toggle-btn" id="btn-sidebar-toggle" title="${isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
          ${isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav class="sidebar-nav">
        ${this.navItems.map(item => `
          <a class="nav-item ${activePage === item.id ? 'active' : ''}" 
             data-page="${item.id}"
             id="nav-${item.id}"
             title="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="system-status-badge">
          <span class="status-dot ${modelMode === 'DEMO' ? 'demo' : ''}"></span>
          <span>● System Status: ${modelMode === 'DEMO' ? 'Demo Mode' : 'Model Ready'}</span>
        </div>
      </div>
    `;

    // Attach click listeners
    const toggleBtn = this.container.querySelector('#btn-sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        appState.set('sidebarCollapsed', !appState.get('sidebarCollapsed'));
      };
    }

    const brandLink = this.container.querySelector('#brand-link');
    if (brandLink) {
      brandLink.onclick = (e) => {
        e.preventDefault();
        appState.set('currentPage', 'dashboard');
      };
    }

    const navLinks = this.container.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
      link.onclick = (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        appState.set('currentPage', pageId);
      };
    });
  }
}
