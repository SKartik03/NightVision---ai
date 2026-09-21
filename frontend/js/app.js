/**
 * NightVision AI - Main Application Orchestrator & Router
 */

import { appState } from './state.js';
import { SidebarComponent } from './components/sidebar.js';
import { HeaderComponent } from './components/header.js';
import { PipelineVisualizerComponent } from './components/pipelineVisualizer.js';
import { apiService } from './services/apiService.js';

// Page Modules
import { IntroductionPage } from './pages/introduction.js';
import { DashboardPage } from './pages/dashboard.js';
import { LiveCameraPage } from './pages/liveCamera.js';
import { ImageAnalysisPage } from './pages/imageAnalysis.js';
import { VideoAnalysisPage } from './pages/videoAnalysis.js';
import { IlluminationMapPage } from './pages/illuminationMap.js';
import { ObjectDetectionPage } from './pages/objectDetection.js';
import { ExplainableAiPage } from './pages/explainableAi.js';
import { ModelComparisonPage } from './pages/modelComparison.js';
import { SimulatorPage } from './pages/simulator.js';
import { AnalyticsPage } from './pages/analytics.js';
import { AboutPage } from './pages/about.js';
import { SettingsPage } from './pages/settings.js';

class Application {
  constructor() {
    this.sidebarEl = document.getElementById('app-sidebar-mount');
    this.headerEl = document.getElementById('app-header-mount');
    this.pipelineEl = document.getElementById('app-pipeline-mount');
    this.pageEl = document.getElementById('app-page-mount');

    this.pages = {
      introduction: new IntroductionPage(this.pageEl),
      dashboard: new DashboardPage(this.pageEl),
      camera: new LiveCameraPage(this.pageEl),
      image_analysis: new ImageAnalysisPage(this.pageEl),
      video_analysis: new VideoAnalysisPage(this.pageEl),
      illumination_map: new IlluminationMapPage(this.pageEl),
      object_detection: new ObjectDetectionPage(this.pageEl),
      explainable_ai: new ExplainableAiPage(this.pageEl),
      model_comparison: new ModelComparisonPage(this.pageEl),
      simulator: new SimulatorPage(this.pageEl),
      analytics: new AnalyticsPage(this.pageEl),
      about: new AboutPage(this.pageEl),
      settings: new SettingsPage(this.pageEl)
    };
  }

  async init() {
    // 1. Initialize Components
    this.sidebar = new SidebarComponent(this.sidebarEl);
    this.sidebar.render();

    this.header = new HeaderComponent(this.headerEl);
    this.header.render();

    this.pipeline = new PipelineVisualizerComponent(this.pipelineEl);
    this.pipeline.render();

    // 2. Hash routing & state listener
    window.addEventListener('hashchange', () => this._handleHashChange());
    appState.subscribe((key, val) => {
      if (key === 'currentPage') {
        window.location.hash = val;
        this._renderCurrentPage();
      }
    });

    // Check initial hash or default to introduction
    const hash = window.location.hash.replace('#', '');
    if (hash && this.pages[hash]) {
      appState.set('currentPage', hash);
    } else {
      appState.set('currentPage', 'introduction');
    }

    this._renderCurrentPage();

    // 3. Ping backend health check in background
    apiService.checkHealth().then(status => {
      if (status) {
        console.log('FastAPI backend connected:', status);
      } else {
        console.log('Running on in-browser client-side CV engine.');
      }
    });
  }

  _handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash && this.pages[hash] && hash !== appState.get('currentPage')) {
      appState.set('currentPage', hash);
    }
  }

  _renderCurrentPage() {
    const pageId = appState.get('currentPage');
    const pageInstance = this.pages[pageId] || this.pages.dashboard;

    // Show/hide pipeline visualizer: hide on introduction, show on platform pages
    if (pageId === 'introduction') {
      this.pipelineEl.style.display = 'none';
    } else {
      this.pipelineEl.style.display = 'block';
    }

    // Update active pipeline stage based on page
    const stageMap = {
      dashboard: 'input',
      camera: 'detection',
      image_analysis: 'enhancement',
      video_analysis: 'detection',
      illumination_map: 'illumination',
      object_detection: 'rtdetr',
      explainable_ai: 'explain',
      model_comparison: 'enhancement',
      simulator: 'illumination',
      analytics: 'detection'
    };
    if (stageMap[pageId]) {
      appState.set('activePipelineStage', stageMap[pageId]);
    }

    // Render active page
    pageInstance.render();

    // Scroll to top of workspace
    window.scrollTo(0, 0);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new Application();
  app.init();
});
