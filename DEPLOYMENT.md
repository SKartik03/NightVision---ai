# 🚀 NightVision AI — Cloud Deployment Guide

This guide provides instructions for deploying **NightVision AI** to free cloud hosting platforms.

---

## 🌟 Option 1: Render (Recommended — 100% Free)

[Render](https://render.com) offers free web service hosting for Python and Docker applications with automatic SSL and continuous deployment from GitHub.

### Step 1: Push your Code to GitHub
Run the following commands in your terminal:
```bash
git init
git add .
git commit -m "feat: initial commit with cloud deployment configuration"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/nightvision-ai.git
git push -u origin main
```

### Step 2: Deploy on Render
1. Go to [render.com](https://render.com) and sign up / log in with your GitHub account.
2. Click **"New +"** in the top navigation and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and select your `nightvision-ai` repository.
4. Render will automatically detect the settings from `render.yaml`:
   - **Name:** `nightvision-ai`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.api.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free`
5. Click **"Create Web Service"**.
6. Within 2–3 minutes, your application will be live at:
   `https://nightvision-ai-xxxx.onrender.com`

---

## 🚂 Option 2: Railway

[Railway](https://railway.app) provides quick zero-config deployment using the included `Procfile`.

### Steps:
1. Push your repository to GitHub (see Step 1 above).
2. Go to [railway.app](https://railway.app) and sign up with GitHub.
3. Click **"New Project"** $\to$ **"Deploy from GitHub repo"**.
4. Select your `nightvision-ai` repository.
5. Railway reads the `Procfile` (`web: uvicorn backend.api.main:app --host 0.0.0.0 --port ${PORT:-8000}`) and automatically builds and deploys.
6. Under your project **Settings** $\to$ **Networking**, click **"Generate Domain"** to get a public `https://*.up.railway.app` URL.

---

## 🤗 Option 3: Hugging Face Spaces (Free AI & CV Hosting)

Hugging Face Spaces is great for hosting computer vision and deep learning demos.

### Steps:
1. Go to [huggingface.co/spaces](https://huggingface.co/spaces) and click **"Create new Space"**.
2. Set:
   - **Space name:** `nightvision-ai`
   - **Space SDK:** **Docker** (Blank)
   - **Space Hardware:** **Free (CPU basic · 2 vCPU · 16 GB)**
3. Clone your Space repository locally or push your existing repository as a new remote:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR_HF_USERNAME>/nightvision-ai
   git push hf main
   ```
4. Hugging Face Spaces will automatically build the `Dockerfile` and launch the app at:
   `https://huggingface.co/spaces/<YOUR_HF_USERNAME>/nightvision-ai`

---

## 🐳 Option 4: Local or Cloud Docker Container

You can run NightVision AI anywhere Docker is installed.

### Build and Run with Docker Compose:
```bash
docker-compose up --build
```
Access at: `http://localhost:8000`

### Or with Docker CLI:
```bash
# Build image
docker build -t nightvision-ai .

# Run container
docker run -p 8000:8000 -e PORT=8000 nightvision-ai
```

---

## 🛠️ Verification Checklist

- [x] **Dynamic Host Resolution:** The frontend automatically detects its host origin on any cloud domain without hardcoded localhost dependencies.
- [x] **Dynamic Port Binding:** The backend respects `$PORT` provided by Render, Railway, and Docker.
- [x] **Unified Static & API Serving:** FastAPI serves both the REST endpoints (`/api/...`) and all frontend assets from the root path.
- [x] **Fallback Engine:** If the backend ever restarts or goes to sleep on free tiers, the client-side CV fallback engine keeps the interface fully functional.
