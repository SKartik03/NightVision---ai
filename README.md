# NIGHTVISION AI
### Intelligent Low-Light Object Detection & Illumination Enhancement Research Platform

> **"See Beyond the Darkness."**  
> *Illumination-aware AI for reliable object detection in challenging low-light and nocturnal environments.*

---

## 🌙 Research & Engineering Overview

Standard deep learning computer vision systems (e.g., standard YOLO, Faster-RCNN, DINO) degrade catastrophically when operating under nocturnal conditions. The degradation stems from three fundamental physical factors:
1. **Severe Signal-to-Noise Ratio (SNR):** Low photon counts submerge structural object silhouettes below detector activation thresholds.
2. **Noise Amplification:** Naive image brightening (e.g. gamma correction or unconstrained neural enhancement) severely amplifies sensor ISO noise and chromatic artifacts.
3. **Blooming Glare:** Oncoming vehicle headlamps and street illumination create extreme dynamic range gaps, causing local sensor clipping that blinds standard detectors.

**NightVision AI** solves this by coupling:
- **Spatial Illumination Estimation (`IlluminationNet`):** Computes continuous spatial luminance distributions, dark-region ratios ($L < 0.20$), and Laplacian noise variances.
- **Detection-Oriented Zero-DCE Enhancement:** Uses iterative quadratic light-curve mappings ($LE_n(x) = LE_{n-1}(x) + \mathcal{A}_n(x) \cdot LE_{n-1}(x)(1 - LE_{n-1}(x))$) conditioned on the illumination map, boosting shadow edges without blowing out high-intensity light sources.
- **Illumination-Aware Feature Fusion (FiLM):** Directly conditions RT-DETR transformer feature channels using affine modulation parameters $(\gamma, \beta)$ generated from the illumination embedding.
- **Real-Time DEtection TRansformer (RT-DETR):** Fast, end-to-end transformer detection with intra-scale interaction and cross-scale fusion.
- **Grad-CAM Explainability:** Spatial attention attribution inspector explaining why specific detections were activated.

---

## 🏛️ Platform Architecture

```
nightvision-ai/
├── backend/
│   ├── api/
│   │   ├── main.py                  # FastAPI server with CORS & static mount
│   │   └── routes.py                # REST endpoints for all CV services
│   ├── services/
│   │   ├── illumination/            # IlluminationNet spatial luminance & noise estimation
│   │   ├── enhancement/             # Detection-oriented Zero-DCE & CLAHE comparison
│   │   ├── fusion/                  # FiLM feature conditioning module
│   │   ├── detection/               # RT-DETR detection & calibrated proposal generator
│   │   ├── tracking/                # Multi-object spatial-temporal IoU tracker
│   │   ├── explainability/          # Grad-CAM attention visualizer
│   │   └── analytics/               # Session metrics & latency telemetry
│   ├── config/                      # Settings & model mode declarations
│   └── requirements.txt
├── frontend/
│   ├── index.html                   # Semantic HTML layout
│   ├── css/
│   │   ├── main.css                 # Clean light theme design system
│   │   └── components.css           # Cards, viewports, HUD overlays, charts
│   └── js/
│       ├── app.js                   # Application router & orchestrator
│       ├── state.js                 # Global reactive state & session store
│       ├── components/              # Sidebar, Header, 7-Stage Pipeline Visualizer
│       ├── pages/                   # All 12 platform views & landing page
│       └── services/                # Camera manager (WebRTC), Client CV Engine, API bridge
└── README.md
```

---

## 🚀 How to Run

### Option 1: Standalone Client-Side (Instant, Zero Setup)
Run a local web server serving the `frontend` folder:
```powershell
python -m http.server 8080 --directory frontend
```
Then open `http://localhost:8080` in your web browser.

### Option 2: Fullstack with FastAPI Backend
Start the modular Python FastAPI backend:
```powershell
uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend serves both the REST API at `http://localhost:8000/api` and the frontend at `http://localhost:8000/`.

---

## 📋 Features Checklist (All 31 Requirements Verified)
- [x] **Introduction / Landing Page:** Professional hero with realistic night-time computer vision visual, problem explanation, 3 core feature cards, and CTAs.
- [x] **Vision Control Center (Dashboard):** Real-time metrics (Input, Illumination, Objects, Avg Confidence, FPS), Live Vision Preview (Raw vs Detection), Scene Condition indicator (🌙 Night / 🌘 Low Light / 🌗 Moderate), Recent activity log.
- [x] **Live Camera Feed:** WebRTC `getUserMedia` with graceful permission error handling, real-time canvas detection overlays, live scene analysis, real-time FPS & latency, pause/resume, frame capture, and fullscreen.
- [x] **Image Analysis Lab:** 4-panel synchronized view (Original | Illumination Map | Enhanced | Detected), Zero-DCE depth slider, confidence threshold slider, sample ExDark environments, and export.
- [x] **Video Stream Analysis:** Video canvas playback, persistent tracking IDs (`PERSON #01`, `CAR #02`), and detection activity timeline.
- [x] **Illumination Intelligence:** False-color Turbo heatmap, interactive Dark $\leftrightarrow$ Bright slider, dark region %, bright region %, and noise level.
- [x] **Object Detection Workspace:** Dedicated detection canvas, bounding proposal inspection, and confidence filter.
- [x] **Explainable AI (XAI):** "Why did AI detect this?", interactive object target selector, and Grad-CAM attention heatmap overlay.
- [x] **Model Comparison Lab:** 3 columns side-by-side (RAW vs CLAHE vs NIGHTVISION AI) with quantitative comparison table.
- [x] **Low-Light Condition Simulator:** 5 weather presets (Normal, Dusk, Night, Rain, Fog) + manual sliders (Illumination, Noise, Blur, Contrast) with 3-step live preview (Before $\to$ After $\to$ Detection).
- [x] **Vision Analytics:** Responsive SVG charts for detection counts over time, confidence distribution histogram, illumination level history, and FPS throughput.
- [x] **Permanent AI Pipeline Visualizer:** 7-stage animated component displaying active stage.
- [x] **Settings:** Camera resolution, inference rate throttle, detection threshold, persistent tracking toggle, and demo mode.
- [x] **Light Research Theme:** Clean white/slate `#f8fafc` background, professional CV blue and teal accents, modern typography, generous whitespace.
