"""
Spatial-Temporal Multi-Object Tracker Service
Maintains track state across video frames and live camera streams.
"""

from typing import List, Dict, Any


class MultiObjectTracker:
    """
    IoU-based tracker with spatial continuity and track history for video/camera feeds.
    Assigns persistent IDs (e.g. PERSON #01, CAR #02).
    """

    def __init__(self, iou_threshold: float = 0.35, max_missed: int = 5):
        self.iou_threshold = iou_threshold
        self.max_missed = max_missed
        self.tracks = {}  # track_id -> {"class", "bbox", "missed", "age"}
        self.next_id = 1
        self.class_counters = {}

    def update(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Updates tracks with new detections from the current frame.
        Returns tracked objects with persistent tracking IDs.
        """
        # Increment missed counts on all active tracks
        for tid in list(self.tracks.keys()):
            self.tracks[tid]["missed"] += 1
            if self.tracks[tid]["missed"] > self.max_missed:
                del self.tracks[tid]

        matched_tracks = []

        for det in detections:
            bbox = det["bbox"]
            cls = det["class"]

            # Find highest IoU among existing tracks of same class
            best_iou = 0.0
            best_tid = None

            for tid, track in self.tracks.items():
                if track["class"] == cls:
                    iou = self._compute_iou(bbox, track["bbox"])
                    if iou > best_iou:
                        best_iou = iou
                        best_tid = tid

            if best_iou >= self.iou_threshold and best_tid is not None:
                # Match found
                self.tracks[best_tid]["bbox"] = bbox
                self.tracks[best_tid]["missed"] = 0
                self.tracks[best_tid]["age"] += 1
                assigned_tag = self.tracks[best_tid]["tag"]
            else:
                # Create new track
                cnt = self.class_counters.get(cls, 0) + 1
                self.class_counters[cls] = cnt
                assigned_tag = f"{cls.upper()} #{cnt:02d}"
                
                new_tid = self.next_id
                self.next_id += 1
                self.tracks[new_tid] = {
                    "class": cls,
                    "bbox": bbox,
                    "missed": 0,
                    "age": 1,
                    "tag": assigned_tag
                }

            matched_tracks.append({
                **det,
                "tracking_id": assigned_tag
            })

        return matched_tracks

    def reset(self):
        """Resets tracking state (e.g. on new video upload)."""
        self.tracks.clear()
        self.next_id = 1
        self.class_counters.clear()

    @staticmethod
    def _compute_iou(boxA, boxB):
        xA = max(boxA[0], boxB[0])
        yA = max(boxA[1], boxB[1])
        xB = min(boxA[2], boxB[2])
        yB = min(boxA[3], boxB[3])
        interArea = max(0, xB - xA) * max(0, yB - yA)
        boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
        boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
        return interArea / float(boxAArea + boxBArea - interArea + 1e-6)


# Singleton instance
tracker_service = MultiObjectTracker()
