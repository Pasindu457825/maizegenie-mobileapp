from io import BytesIO
from typing import List, Dict, Any, Tuple
import base64
import numpy as np
import cv2
from PIL import Image

from .model import get_model
from core.supabase_client import supabase
from datetime import datetime
import asyncio

# Minimum confidence level (class-specific thresholds override this)
MIN_CONFIDENCE_THRESHOLD = 0.4


# -------------------------------
# Image Processing Helpers
# -------------------------------

def _read_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Convert uploaded image bytes into an RGB numpy array."""
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        return np.array(img)
    except Exception as e:
        raise ValueError(f"Failed to read image: {e}")


def _encode_img_b64(img_bgr: np.ndarray) -> str:
    """Convert a BGR image into base64 JPEG string."""
    try:
        success, buffer = cv2.imencode(".jpg", img_bgr)
        if not success:
            raise ValueError("Failed to encode image to JPEG")
        return base64.b64encode(buffer).decode("utf-8")
    except Exception as e:
        raise ValueError(f"Failed to encode image: {e}")


# -------------------------------
# Image Quality Validation
# -------------------------------

def validate_image_quality(image: np.ndarray) -> Tuple[bool, str]:
    """Validate resolution, blur level, and detail of uploaded image."""
    try:
        height, width = image.shape[:2]

        if height < 200 or width < 200:
            return False, "Image too small. Upload a higher resolution image."

        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        blur_value = cv2.Laplacian(gray, cv2.CV_64F).var()

        if blur_value < 30:
            return False, "Image too blurry. Please upload a clearer image."

        if np.std(image) < 10:
            return False, "Image lacks detail. Please upload a proper plant image."

        return True, "Image quality acceptable"

    except Exception as e:
        return False, f"Image validation error: {str(e)}"


# -------------------------------
# Confidence Filtering
# -------------------------------

def get_class_confidence_threshold(class_name: str) -> float:
    """Class-specific confidence thresholds."""
    thresholds = {
        "common_rust": 0.5,
        "northern_leaf_blight": 0.5,
        "gray_leaf_spot": 0.5,
        "southern_leaf_blight": 0.5,
        "healthy": 0.6,
        "no_disease": 0.6,
        "default": 0.5,
    }
    return thresholds.get(class_name.lower(), thresholds["default"])


def apply_confidence_filtering(predictions: List[Dict]) -> List[Dict]:
    """Filter predictions by class-specific confidence rules."""
    filtered = []
    for pred in predictions:
        threshold = get_class_confidence_threshold(pred["class_name"])
        if pred["confidence"] >= threshold:
            filtered.append(pred)
    return filtered


# -------------------------------
# Duplicate Removal
# -------------------------------

def boxes_overlap(box1, box2, overlap_threshold=0.6) -> bool:
    """Calculate bounding box overlap ratio."""
    if not box1 or not box2 or len(box1) != 4 or len(box2) != 4:
        return False

    x1, y1, x2, y2 = box1
    a1, b1, a2, b2 = box2

    xi1 = max(x1, a1)
    yi1 = max(y1, b1)
    xi2 = min(x2, a2)
    yi2 = min(y2, b2)

    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)

    area1 = (x2 - x1) * (y2 - y1)
    area2 = (a2 - a1) * (b2 - b1)

    if min(area1, area2) == 0:
        return False

    overlap_ratio = inter_area / min(area1, area2)
    return overlap_ratio > overlap_threshold


def remove_duplicate_detections(predictions: List[Dict]) -> List[Dict]:
    """Remove overlapping duplicate detections (keeps highest confidence)."""
    if len(predictions) <= 1:
        return predictions

    predictions.sort(key=lambda x: x["confidence"], reverse=True)
    filtered = []

    for pred in predictions:
        if not any(
            pred["class_name"] == kept["class_name"]
            and boxes_overlap(pred["box_xyxy"], kept["box_xyxy"])
            for kept in filtered
        ):
            filtered.append(pred)

    return filtered


# -------------------------------
# Main Prediction Function
# -------------------------------

def predict_disease_enhanced(
    image_bytes: bytes,
    conf: float = 0.5,
    return_image: bool = False
) -> Dict[str, Any]:
    """Run YOLOv8 inference with image validation + filtering."""

    model = get_model()
    img_rgb = _read_image_bytes(image_bytes)

    # ---------- IMAGE QUALITY CHECK ----------
    is_valid, msg = validate_image_quality(img_rgb)
    if not is_valid:
        return {
            "predictions": [{
                "class_id": -2,
                "class_name": "invalid_image",
                "confidence": 0.0,
                "message": msg
            }],
            "annotated_image_b64": None,
            "validation_passed": False
        }

    # ---------- YOLO PREDICTION ----------
    results = model.predict(
        source=img_rgb,
        conf=conf,
        verbose=False,
        save=False
    )

    predictions = []
    annotated_b64 = None

    for result in results:
        class_names = result.names

        for box in result.boxes:
            cid = int(box.cls[0])
            confidence = float(box.conf[0])
            cname = class_names.get(cid, f"class_{cid}")
            xyxy = [round(float(v), 2) for v in box.xyxy[0].tolist()]

            predictions.append({
                "class_id": cid,
                "class_name": cname,
                "confidence": round(confidence, 3),
                "box_xyxy": xyxy,
            })

        if return_image:
            try:
                annotated_b64 = _encode_img_b64(result.plot())
            except Exception:
                annotated_b64 = None

    # ---------- POST-PROCESSING ----------
    predictions = apply_confidence_filtering(predictions)
    predictions = remove_duplicate_detections(predictions)

    if not predictions:
        predictions = [{
            "class_id": -1,
            "class_name": "no_disease",
            "confidence": 0.0,
            "message": "No diseases detected"
        }]

    # ---------- SUPABASE LOGGING ----------
    try:
        top = max(predictions, key=lambda x: x.get("confidence", 0))

        log_data = {
            "class_name": top["class_name"],
            "confidence": top["confidence"],
            "user_id": None,
            "image_url": None,
            "annotated_image_url": None,
            "created_at": datetime.utcnow().isoformat()
        }

        asyncio.create_task(
            supabase.table("disease_logs").insert(log_data).execute()
        )

    except Exception as e:
        print("Supabase logging failed:", e)

    # ---------- FINAL RETURN ----------
    return {
        "predictions": predictions,
        "annotated_image_b64": annotated_b64,
        "validation_passed": True,
        "total_detections": len(predictions),
    }
