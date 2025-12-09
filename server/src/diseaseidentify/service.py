from io import BytesIO
from typing import List, Dict, Any, Tuple
import base64
import numpy as np
import cv2
from PIL import Image

from .model import get_model


# =========================================================================================
# IMAGE HELPERS
# =========================================================================================
def _read_image_bytes(image_bytes: bytes) -> np.ndarray:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(img)


def _encode_img_b64(img_bgr: np.ndarray) -> str:
    ok, buffer = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise ValueError("Failed to encode image to JPEG")
    return base64.b64encode(buffer).decode("utf-8")


# =========================================================================================
# IMAGE QUALITY + LEAF CHECK
# =========================================================================================
def validate_image_quality(image: np.ndarray) -> Tuple[bool, str]:
    try:
        h, w = image.shape[:2]
        if h < 200 or w < 200:
            return False, "Image too small. Please upload a higher resolution image."

        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        blur_value = cv2.Laplacian(gray, cv2.CV_64F).var()
        if blur_value < 30:
            return False, "Image is too blurry. Please upload a clearer image."

        if np.std(image) < 10:
            return False, "Image lacks detail. Please upload a proper plant image."

        return True, "Image quality acceptable"
    except Exception as e:
        return False, f"Image validation error: {str(e)}"


def _estimate_green_ratio(image: np.ndarray) -> float:
    img_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)

    lower_green = np.array([35, 40, 40])
    upper_green = np.array([85, 255, 255])
    mask = cv2.inRange(hsv, lower_green, upper_green)

    green_pixels = np.count_nonzero(mask)
    total_pixels = image.shape[0] * image.shape[1]
    return green_pixels / total_pixels if total_pixels else 0.0


def validate_maize_leaf(image: np.ndarray) -> Tuple[bool, str]:
    green_ratio = _estimate_green_ratio(image)

    if green_ratio < 0.18:
        return (
            False,
            "Image does not look like a maize leaf. Please upload a close-up of a green maize leaf."
        )

    return True, "Looks like a maize leaf"


# =========================================================================================
# CONFIDENCE FILTERING
# =========================================================================================
def apply_confidence_filtering(predictions: List[Dict]) -> List[Dict]:
    class_thresholds = {
        "blight": 0.25,
        "gray_spot": 0.20,
        "common_rust": 0.30,
        "health": 0.70,
    }

    filtered = []
    for pred in predictions:
        cname = pred["class_name"].lower()
        threshold = class_thresholds.get(cname, 0.50)
        if pred["confidence"] >= threshold:
            filtered.append(pred)

    return filtered


# =========================================================================================
# DUPLICATE BOX REMOVAL
# =========================================================================================
def boxes_overlap(box1, box2, threshold=0.6):
    if len(box1) != 4 or len(box2) != 4:
        return False

    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2

    xi1, yi1 = max(x1_1, x1_2), max(y1_1, y1_2)
    xi2, yi2 = min(x2_1, x2_2), min(y2_1, y2_2)

    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    area1 = max(1, (x2_1 - x1_1) * (y2_1 - y1_1))
    area2 = max(1, (x2_2 - x1_2) * (y2_2 - y1_2))

    return inter_area / min(area1, area2) > threshold


def remove_duplicate_detections(predictions: List[Dict]) -> List[Dict]:
    if len(predictions) <= 1:
        return predictions

    predictions.sort(key=lambda x: x["confidence"], reverse=True)
    filtered = []

    for p in predictions:
        if not any(
            p["class_name"] == kept["class_name"] and
            boxes_overlap(p["box_xyxy"], kept["box_xyxy"])
            for kept in filtered
        ):
            filtered.append(p)

    return filtered


# =========================================================================================
# SEVERITY CALCULATION
# =========================================================================================
def calculate_severity(predictions, image_shape):
    if not predictions:
        return 0.0, "None"

    if any(p["class_name"].lower() == "health" for p in predictions):
        return 0.0, "None"

    img_h, img_w = image_shape[:2]
    leaf_area = img_h * img_w
    infected_area = 0

    for p in predictions:
        x1, y1, x2, y2 = p.get("box_xyxy", [0, 0, 0, 0])
        infected_area += max(0, x2 - x1) * max(0, y2 - y1)

    if leaf_area == 0:
        return 0.0, "None"

    severity_score = infected_area / leaf_area
    severity_score = min(max(severity_score, 0.0), 1.0)

    if severity_score < 0.10:
        label = "Low"
    elif severity_score < 0.30:
        label = "Medium"
    else:
        label = "High"

    return severity_score, label


# =========================================================================================
# HEALTH RESPONSE
# =========================================================================================
def _return_health(img_rgb):
    return {
        "success": True,
        "predictions": [{
            "class_id": 3,
            "class_name": "health",
            "confidence": 1.0,
            "box_xyxy": [0, 0, 0, 0],
            "message": "No disease detected"
        }],
        "annotated_image_b64": None,
        "validation_passed": True,
        "severity_score": 0.0,
        "severity_label": "None",
        "total_detections": 1
    }


# =========================================================================================
# MAIN PREDICT FUNCTION — FIXED
# =========================================================================================
def predict_disease_enhanced(image_bytes: bytes, conf=0.4, return_image=False):
    model = get_model()
    img_rgb = _read_image_bytes(image_bytes)

    # Validate
    ok, msg = validate_image_quality(img_rgb)
    if not ok:
        return _return_error("invalid_image", msg)

    ok_leaf, msg_leaf = validate_maize_leaf(img_rgb)
    if not ok_leaf:
        return _return_error("invalid_leaf", msg_leaf)

    # YOLO inference
    results = model.predict(source=img_rgb, conf=conf, verbose=False, save=False)
    if results is None or len(results) == 0:
        return _return_health(img_rgb)

    raw_predictions = []
    annotated_b64 = None

    for result in results:
        names_map = getattr(result, "names", {})
        if not hasattr(result, "boxes"):
            continue

        for box in result.boxes:
            cid = int(box.cls[0])
            cname = names_map.get(cid, f"class_{cid}")
            conf_val = float(box.conf[0])
            bbox = [float(v) for v in box.xyxy[0].tolist()]

            raw_predictions.append({
                "class_id": cid,
                "class_name": cname,
                "confidence": round(conf_val, 3),
                "box_xyxy": [round(v, 2) for v in bbox],
            })

    if return_image:
        annotated_b64 = _encode_img_b64(result.plot())

    # FILTERING
    filtered = apply_confidence_filtering(raw_predictions)
    filtered = remove_duplicate_detections(filtered)

    DISEASES = ["blight", "gray_spot", "common_rust"]

    # Check RAW YOLO disease before filtering
    raw_has_disease = any(
        p["class_name"].lower() in DISEASES for p in raw_predictions
    )

    # No disease detected at all → Healthy
    if not raw_has_disease:
        return _return_health(img_rgb)

    # Texture fallback only if filtered empty
    if len(filtered) == 0:
        std_val = np.std(img_rgb)
        if std_val > 28:
            filtered = [{
                "class_id": 0,
                "class_name": "blight",
                "confidence": 0.25,
                "box_xyxy": [0, 0, 0, 0],
                "message": "Texture pattern suggests disease"
            }]

    # STILL empty? return healthy
    if len(filtered) == 0:
        return _return_health(img_rgb)

    # Severity calculation
    sev_score, sev_label = calculate_severity(filtered, img_rgb.shape)

    return {
        "success": True,
        "predictions": filtered,
        "annotated_image_b64": annotated_b64,
        "validation_passed": True,
        "severity_score": round(sev_score, 3),
        "severity_label": sev_label,
        "total_detections": len(filtered),
    }


# =========================================================================================
# ERROR RESPONSE BUILDER
# =========================================================================================
def _return_error(code, msg):
    return {
        "success": True,
        "predictions": [{
            "class_id": -1,
            "class_name": code,
            "confidence": 0.0,
            "message": msg
        }],
        "annotated_image_b64": None,
        "validation_passed": False,
        "severity_score": 0.0,
        "severity_label": "None",
        "total_detections": 0
    }
