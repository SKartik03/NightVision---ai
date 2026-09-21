"""
NightVision AI Configuration
Configuration layer separating model definition, modes, and runtime thresholds.
"""

import os
from pydantic import BaseModel

class SystemConfig(BaseModel):
    # Model mode: "REAL" or "DEMO"
    MODEL_MODE: str = os.getenv("MODEL_MODE", "DEMO")
    
    # Model Architecture Identifiers
    DETECTION_MODEL: str = "RT-DETR-ResNet50"
    ENHANCEMENT_MODEL: str = "IlluminationNet-ZeroDCE"
    EXPLAINABILITY_MODEL: str = "Grad-CAM"
    DATASET_BENCHMARK: str = "ExDark"
    
    # Inference parameters
    DEFAULT_CONFIDENCE_THRESHOLD: float = 0.45
    DEFAULT_NMS_IOU_THRESHOLD: float = 0.50
    DEFAULT_ENHANCEMENT_STRENGTH: float = 0.70
    
    # Camera and streaming
    DEFAULT_INFERENCE_FPS: int = 15
    MAX_FRAME_DIMENSION: int = 1280
    
    # Storage & Privacy
    LOCAL_PROCESSING_ONLY: bool = True
    ALLOW_CLOUD_STORAGE: bool = False

settings = SystemConfig()
