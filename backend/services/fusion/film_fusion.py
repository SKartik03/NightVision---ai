"""
Illumination-Aware Feature Fusion Service (FiLM Conditioning)
Provides feature-wise linear modulation for conditioning RT-DETR multi-scale features
based on spatial and global illumination representations.
"""

import numpy as np
from typing import Dict, Any, Tuple


class FiLMFusionModule:
    """
    Feature-wise Linear Modulation (FiLM) Layer Interface.
    
    Given an illumination feature embedding E_illum in R^d:
    gamma, beta = MLP(E_illum)
    F_conditioned = gamma * F_detector + beta
    
    This modulates detector feature activation maps before the hybrid encoder in RT-DETR,
    allowing the transformer to attend to feature channels that are salient under current lighting.
    """

    def __init__(self, feature_dim: int = 256, embedding_dim: int = 64):
        self.feature_dim = feature_dim
        self.embedding_dim = embedding_dim
        self.is_demo = True

        # Initialize synthetic projection weights for the FiLM MLP
        rng = np.random.RandomState(42)
        self.w_gamma = rng.randn(embedding_dim, feature_dim).astype(np.float32) * 0.02
        self.b_gamma = np.ones(feature_dim, dtype=np.float32)  # Scale initialized to 1.0
        self.w_beta = rng.randn(embedding_dim, feature_dim).astype(np.float32) * 0.02
        self.b_beta = np.zeros(feature_dim, dtype=np.float32)  # Shift initialized to 0.0

    def compute_illumination_embedding(self, illumination_metrics: Dict[str, Any]) -> np.ndarray:
        """
        Maps scalar and spatial illumination metrics into an embedding vector E_illum.
        """
        score = illumination_metrics.get("illumination_score", 30) / 100.0
        dark_pct = illumination_metrics.get("dark_region_pct", 50.0) / 100.0
        bright_pct = illumination_metrics.get("bright_region_pct", 5.0) / 100.0
        contrast = illumination_metrics.get("contrast_index", 20.0) / 100.0
        noise = illumination_metrics.get("noise_level", 10.0) / 100.0

        raw_vec = np.array([score, dark_pct, bright_pct, contrast, noise], dtype=np.float32)
        
        # Positional frequency expansion into embedding_dim
        freqs = np.linspace(1.0, 16.0, self.embedding_dim // 5)
        sin_components = np.concatenate([np.sin(raw_vec * f) for f in freqs])
        
        # Pad or trim to embedding_dim
        embedding = np.zeros(self.embedding_dim, dtype=np.float32)
        embedding[:min(len(sin_components), self.embedding_dim)] = sin_components[:self.embedding_dim]
        return embedding

    def generate_film_parameters(self, embedding: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Produces gamma (scale) and beta (shift) vectors for feature modulation.
        gamma = W_gamma @ embedding + b_gamma
        beta = W_beta @ embedding + b_beta
        """
        gamma = np.dot(embedding, self.w_gamma) + self.b_gamma
        beta = np.dot(embedding, self.w_beta) + self.b_beta
        return gamma, beta

    def modulate_features(self, detector_features: np.ndarray, illumination_metrics: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes FiLM modulation on input features:
        F_mod = gamma * F + beta
        """
        embedding = self.compute_illumination_embedding(illumination_metrics)
        gamma, beta = self.generate_film_parameters(embedding)

        # Apply modulation
        if detector_features is not None and len(detector_features) > 0:
            modulated = gamma * detector_features + beta
        else:
            modulated = None

        return {
            "status": "success",
            "is_demo": self.is_demo,
            "film_stats": {
                "gamma_mean": float(np.mean(gamma)),
                "gamma_std": float(np.std(gamma)),
                "beta_mean": float(np.mean(beta)),
                "beta_std": float(np.std(beta)),
                "embedding_norm": float(np.linalg.norm(embedding))
            },
            "conditioning_status": "Active (Illumination-Conditioned Feature Modulation)"
        }


# Singleton instance
film_fusion_service = FiLMFusionModule()
