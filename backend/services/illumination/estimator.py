"""
Illumination Estimation Service
Analyzes spatial illumination distribution, luminance statistics, and noise characteristics.
"""

import io
import base64
import numpy as np
from PIL import Image

try:
    import cv2
    HAS_OPENCV = True
except ImportError:
    HAS_OPENCV = False


class IlluminationEstimator:
    """
    Estimates spatial illumination, scene condition, and noise metrics.
    Acts as the frontend to IlluminationNet.
    """

    def __init__(self):
        self.model_name = "IlluminationNet-Estimator"
        self.is_demo = True

    def analyze(self, image_input) -> dict:
        """
        Analyze an input image. Accepts PIL Image, numpy array, or bytes.
        """
        if isinstance(image_input, bytes):
            image = Image.open(io.BytesIO(image_input)).convert("RGB")
            img_arr = np.array(image, dtype=np.float32) / 255.0
        elif isinstance(image_input, Image.Image):
            image = image_input.convert("RGB")
            img_arr = np.array(image, dtype=np.float32) / 255.0
        elif isinstance(image_input, np.ndarray):
            if image_input.dtype == np.uint8:
                img_arr = image_input.astype(np.float32) / 255.0
            else:
                img_arr = image_input.copy()
            if img_arr.shape[-1] == 4:
                img_arr = img_arr[:, :, :3]
        else:
            raise ValueError("Unsupported image input format")

        h, w, c = img_arr.shape

        # Compute perceptual luminance: L = 0.299*R + 0.587*G + 0.114*B
        luminance = 0.299 * img_arr[:, :, 0] + 0.587 * img_arr[:, :, 1] + 0.114 * img_arr[:, :, 2]

        # Illumination Score (0 to 100)
        mean_lum = float(np.mean(luminance))
        p10 = float(np.percentile(luminance, 10))
        p90 = float(np.percentile(luminance, 90))
        
        # Non-linear scaling to represent perceived visibility
        illumination_score = int(round(np.clip(mean_lum * 100 * 1.1, 0, 100)))

        # Categorize scene condition
        if illumination_score < 28:
            scene_condition = "NIGHT"
            condition_badge = "🌙 Night"
        elif illumination_score < 55:
            scene_condition = "LOW_LIGHT"
            condition_badge = "🌘 Low Light"
        else:
            scene_condition = "MODERATE"
            condition_badge = "🌗 Moderate Light"

        # Dark and bright region percentages
        dark_ratio = float(np.mean(luminance < 0.20) * 100)
        bright_ratio = float(np.mean(luminance > 0.75) * 100)
        mid_ratio = float(100.0 - dark_ratio - bright_ratio)

        # Contrast estimate (std dev of luminance)
        contrast_score = float(np.std(luminance) * 100)

        # Noise estimation via discrete Laplacian kernel approximation
        lum_u8 = (luminance * 255).astype(np.float32)
        # Discrete Laplacian: L[i,j] * 4 - (L[i-1,j] + L[i+1,j] + L[i,j-1] + L[i,j+1])
        kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
        
        # Simple convolution for noise estimate
        if HAS_OPENCV:
            laplacian = cv2.Laplacian(lum_u8, cv2.CV_32F)
            noise_variance = float(laplacian.var())
        else:
            # Sliced numpy approximation
            padded = np.pad(lum_u8, 1, mode='edge')
            lap = (
                padded[:-2, 1:-1] + padded[2:, 1:-1] +
                padded[1:-1, :-2] + padded[1:-1, 2:] -
                4.0 * padded[1:-1, 1:-1]
            )
            noise_variance = float(np.var(lap))

        # Normalized noise level: 0 to 100
        noise_level = float(np.clip(noise_variance / 25.0, 0.0, 100.0))

        # Generate downscaled spatial illumination map for visualization
        # Target thumbnail dimension 160x120
        ds_h, ds_w = min(120, h), min(160, w)
        lum_pil = Image.fromarray((luminance * 255).astype(np.uint8))
        lum_resized = lum_pil.resize((ds_w, ds_h), Image.Resampling.BILINEAR)
        lum_map_arr = np.array(lum_resized, dtype=np.float32) / 255.0

        # Apply false-color colormap (Turbo/Jet approximation)
        heatmap_rgb = self._apply_colormap(lum_map_arr)
        heatmap_pil = Image.fromarray(heatmap_rgb)
        
        buffer = io.BytesIO()
        heatmap_pil.save(buffer, format="JPEG", quality=85)
        heatmap_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

        return {
            "status": "success",
            "model": self.model_name,
            "is_demo": self.is_demo,
            "metrics": {
                "illumination_score": illumination_score,
                "scene_condition": scene_condition,
                "condition_badge": condition_badge,
                "mean_luminance": round(mean_lum, 4),
                "dark_region_pct": round(dark_ratio, 1),
                "bright_region_pct": round(bright_ratio, 1),
                "mid_region_pct": round(mid_ratio, 1),
                "contrast_index": round(contrast_score, 1),
                "noise_level": round(noise_level, 1),
                "p10_luminance": round(p10, 3),
                "p90_luminance": round(p90, 3)
            },
            "heatmap_preview": heatmap_b64,
            "resolution": {"width": w, "height": h}
        }

    @staticmethod
    def _apply_colormap(lum: np.ndarray) -> np.ndarray:
        """
        Applies a smooth turbo-like scientific false color map to normalized luminance (0-1).
        Blue (deep dark) -> Teal -> Green -> Yellow -> Orange -> Crimson (bright).
        """
        r = np.clip(1.5 - np.abs(lum * 4.0 - 3.0), 0.0, 1.0)
        g = np.clip(1.5 - np.abs(lum * 4.0 - 2.0), 0.0, 1.0)
        b = np.clip(1.5 - np.abs(lum * 4.0 - 1.0), 0.0, 1.0)

        # Enhance deep shadows to navy
        shadow_mask = lum < 0.25
        b[shadow_mask] = np.maximum(b[shadow_mask], 0.4 + lum[shadow_mask])

        rgb = np.stack([r, g, b], axis=-1)
        return (rgb * 255).astype(np.uint8)


# Singleton instance
illumination_service = IlluminationEstimator()
