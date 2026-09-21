"""
NightVision AI - Main FastAPI Application
Entrypoint for serving backend computer vision services and static frontend.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.api.routes import router as api_router
from backend.config.settings import settings

app = FastAPI(
    title="NightVision AI Platform",
    description="Intelligent Low-Light Object Detection & Illumination Enhancement Research Platform",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes first so they take precedence
app.include_router(api_router)

# Mount frontend directory at root with html=True
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend")
if os.path.exists(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.api.main:app", host="0.0.0.0", port=port, reload=False)
