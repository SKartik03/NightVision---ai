"""
Session Analytics Service
Tracks real-time runtime metrics, inference throughput, confidence histograms,
and illumination distribution for the current vision session.
"""

import time
from typing import Dict, Any, List


class VisionAnalyticsEngine:
    """
    In-memory session analytics engine.
    Maintains time-series metrics from live camera, video, and image inference runs.
    """

    def __init__(self):
        self.session_id = f"session_{int(time.time())}"
        self.start_time = time.time()
        self.is_demo = True
        
        # Aggregated counters
        self.total_frames_processed = 0
        self.total_objects_detected = 0
        self.confidence_sum = 0.0
        self.latency_sum = 0.0
        
        # Time-series history (capped to last 100 entries for efficiency)
        self.max_history = 100
        self.time_series = []
        
        # Confidence bins for distribution histogram: 0-20, 20-40, 40-60, 60-80, 80-100
        self.confidence_bins = [0, 0, 0, 0, 0]
        
        # Illumination condition counts
        self.condition_counts = {"NIGHT": 0, "LOW_LIGHT": 0, "MODERATE": 0}

        # Initialize with baseline demo session data so analytics displays initial context
        self._init_baseline_session()

    def _init_baseline_session(self):
        """Initializes a labeled baseline session representing ExDark low-light benchmark runs."""
        demo_points = [
            {"t": "11:40", "objects": 2, "illum": 22, "fps": 24.5, "latency": 40.8, "conf": 84.0},
            {"t": "11:41", "objects": 4, "illum": 26, "fps": 26.2, "latency": 38.1, "conf": 89.2},
            {"t": "11:42", "objects": 3, "illum": 19, "fps": 25.1, "latency": 39.8, "conf": 82.5},
            {"t": "11:43", "objects": 5, "illum": 31, "fps": 27.0, "latency": 37.0, "conf": 91.0},
            {"t": "11:44", "objects": 3, "illum": 24, "fps": 25.8, "latency": 38.7, "conf": 87.4},
            {"t": "11:45", "objects": 6, "illum": 28, "fps": 24.9, "latency": 40.1, "conf": 90.3}
        ]
        for pt in demo_points:
            self.record_frame(
                objects_count=pt["objects"],
                avg_confidence=pt["conf"],
                illumination_score=pt["illum"],
                latency_ms=pt["latency"],
                scene_condition="NIGHT" if pt["illum"] < 28 else "LOW_LIGHT"
            )

    def record_frame(
        self,
        objects_count: int,
        avg_confidence: float,
        illumination_score: int,
        latency_ms: float,
        scene_condition: str = "NIGHT"
    ):
        """Records a single inference event from camera, image, or video analysis."""
        self.total_frames_processed += 1
        self.total_objects_detected += objects_count
        self.confidence_sum += avg_confidence
        self.latency_sum += latency_ms

        fps = round(1000.0 / max(latency_ms, 1.0), 1)

        # Update confidence bins
        if avg_confidence > 0:
            bin_idx = min(int(avg_confidence / 20.0), 4)
            self.confidence_bins[bin_idx] += 1

        # Update condition counts
        cond_key = scene_condition.upper()
        if cond_key in self.condition_counts:
            self.condition_counts[cond_key] += 1

        # Add to time series
        ts_entry = {
            "index": self.total_frames_processed,
            "timestamp": time.strftime("%H:%M:%S"),
            "objects": objects_count,
            "confidence": round(avg_confidence, 1),
            "illumination": illumination_score,
            "latency_ms": round(latency_ms, 1),
            "fps": fps
        }
        self.time_series.append(ts_entry)
        if len(self.time_series) > self.max_history:
            self.time_series.pop(0)

    def get_summary(self) -> Dict[str, Any]:
        """Returns consolidated metrics and distributions for the Analytics dashboard."""
        n_frames = max(self.total_frames_processed, 1)
        avg_conf = round(self.confidence_sum / n_frames, 1)
        avg_latency = round(self.latency_sum / n_frames, 1)
        avg_fps = round(1000.0 / max(avg_latency, 1.0), 1)
        
        # Calculate average illumination from recent time series
        if self.time_series:
            avg_illum = round(sum(p["illumination"] for p in self.time_series) / len(self.time_series), 1)
        else:
            avg_illum = 0.0

        return {
            "session_id": self.session_id,
            "session_badge": "DEMO SESSION" if self.is_demo else "LIVE SESSION",
            "uptime_seconds": int(time.time() - self.start_time),
            "total_frames": self.total_frames_processed,
            "total_objects": self.total_objects_detected,
            "average_confidence": avg_conf,
            "average_latency_ms": avg_latency,
            "average_fps": avg_fps,
            "average_illumination": avg_illum,
            "confidence_distribution": {
                "0-20%": self.confidence_bins[0],
                "20-40%": self.confidence_bins[1],
                "40-60%": self.confidence_bins[2],
                "60-80%": self.confidence_bins[3],
                "80-100%": self.confidence_bins[4]
            },
            "scene_distribution": self.condition_counts,
            "recent_series": self.time_series[-25:]
        }


# Singleton instance
analytics_service = VisionAnalyticsEngine()
