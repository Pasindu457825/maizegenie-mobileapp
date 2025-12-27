from io import BytesIO
from typing import List, Dict, Tuple
import base64
import numpy as np
import cv2
from PIL import Image

from .model import get_model

# =============================================================================
# IMAGE HELPERS
# =============================================================================
def _read_image_bytes(image_bytes: bytes) -> np.ndarray:
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(img)


def _encode_img_b64(img_bgr: np.ndarray) -> str:
    ok, buffer = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise ValueError("Failed to encode image")
    return base64.b64encode(buffer).decode("utf-8")


# =============================================================================
# IMAGE QUALITY VALIDATION
# =============================================================================
def validate_image_quality(image: np.ndarray) -> Tuple[bool, str]:
    h, w = image.shape[:2]
    if h < 200 or w < 200:
        return False, "Image too small"

    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
    blur = cv2.Laplacian(gray, cv2.CV_64F).var()
    if blur < 30:
        return False, "Image too blurry"

    if np.std(image) < 10:
        return False, "Low image detail"

    return True, "OK"


# =============================================================================
# CONFIDENCE FILTERING
# =============================================================================
def apply_confidence_filtering(predictions: List[Dict]) -> List[Dict]:
    thresholds = {
        "blight": 0.25,
        "gray_spot": 0.20,
        "common_rust": 0.30,
    }

    return [
        p for p in predictions
        if p["class_name"].lower() in thresholds
        and p["confidence"] >= thresholds[p["class_name"].lower()]
    ]


# =============================================================================
# DUPLICATE REMOVAL
# =============================================================================
def boxes_overlap(b1, b2, thr=0.6):
    x1, y1, x2, y2 = b1
    x3, y3, x4, y4 = b2

    xi1, yi1 = max(x1, x3), max(y1, y3)
    xi2, yi2 = min(x2, x4), min(y2, y4)

    inter = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    a1 = max(1, (x2 - x1) * (y2 - y1))
    a2 = max(1, (x4 - x3) * (y4 - y3))

    return inter / min(a1, a2) > thr


def remove_duplicate_detections(preds: List[Dict]) -> List[Dict]:
    preds.sort(key=lambda x: x["confidence"], reverse=True)
    final = []

    for p in preds:
        if not any(
            p["class_name"] == q["class_name"]
            and boxes_overlap(p["box_xyxy"], q["box_xyxy"])
            for q in final
        ):
            final.append(p)

    return final


# =============================================================================
# SEVERITY
# =============================================================================

def calculate_severity(preds, image):
    """
    FINAL calibrated severity:
    rust_pixels / actual leaf pixels
    (aligned with maize-leaf validation)
    """

    if image is None or image.size == 0:
        return 0.0, "None"

    lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB)
    L, A, B = cv2.split(lab)

    # --------------------------------------------------
    # 1️⃣ LEAF MASK — MATCH VALIDATION LOGIC
    # --------------------------------------------------
    # Include green, yellow, and rusted leaf tissue
    leaf_mask = (
        (L > 25) &
        (B > 95) &          # allow dark yellow / brown leaf
        (A < 210)           # allow severe rust tissue
    )

    leaf_mask = leaf_mask.astype(np.uint8) * 255
    leaf_mask = cv2.medianBlur(leaf_mask, 7)
    leaf_mask = cv2.morphologyEx(
        leaf_mask,
        cv2.MORPH_CLOSE,
        np.ones((13, 13), np.uint8)
    )
    leaf_mask = leaf_mask > 0

    leaf_pixels = int(np.sum(leaf_mask))
    if leaf_pixels == 0:
        return 0.0, "None"

    # --------------------------------------------------
    # 2️⃣ RUST / BROWN MASK — WIDE & REALISTIC
    # --------------------------------------------------
    rust_mask = (
        (A > 125) &          # reddish/brown
        (B > 95) &           # include dark brown rust
        (L > 30)             # allow shaded rust
    )

    rust_pixels = int(np.sum(rust_mask & leaf_mask))

    # --------------------------------------------------
    # 3️⃣ SEVERITY (NO ARTIFICIAL DAMPENING)
    # --------------------------------------------------
    severity = rust_pixels / leaf_pixels
    severity = float(np.clip(severity, 0.0, 1.0))

    if severity < 0.10:
        label = "Low"
    elif severity < 0.30:
        label = "Medium"
    else:
        label = "High"

    return round(severity, 3), label

# =============================================================================
# ERROR RESPONSE
# =============================================================================
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

# =============================================================================
# MAIZE LEAF VALIDATION (CRITICAL FIX)
# =============================================================================
def validate_maize_leaf(image: np.ndarray) -> bool:
    """
    Returns True only if the image likely contains a maize leaf.
    Prevents landscapes, buildings, hands, etc.
    """
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)
    h, s, v = cv2.split(hsv)

    # Green color dominance (maize leaves)
    green_mask = (h > 25) & (h < 95) & (s > 40) & (v > 40)
    green_ratio = np.sum(green_mask) / green_mask.size

    # Maize leaves are strongly green
    return green_ratio > 0.15

# =============================================================================
# MAIN — FINAL & CLEAN
# =============================================================================
def predict_disease_enhanced(image_bytes: bytes, conf=0.4, return_image=False):
    model = get_model()
    img = _read_image_bytes(image_bytes)

    # 1️⃣ Image quality check
    ok, msg = validate_image_quality(img)
    if not ok:
        return _return_error("invalid_image", msg)

    # 2️⃣ 🚫 MAIZE LEAF VALIDATION (HARD GATE)
    if not validate_maize_leaf(img):
        return _return_error(
            "invalid_image",
            "This image is not a maize leaf. Please upload a damaged maize leaf with visible disease symptoms."
        )

    # 3️⃣ YOLO inference (ONLY after validation)
    results = model.predict(
        source=img,
        imgsz=640,
        conf=conf,
        verbose=False
    )

    raw_preds = []
    annotated = None

    for r in results:
        names = r.names
        for b in r.boxes:
            cid = int(b.cls[0])
            raw_preds.append({
                "class_id": cid,
                "class_name": names[cid],
                "confidence": float(b.conf[0]),
                "box_xyxy": [float(v) for v in b.xyxy[0]]
            })

        if return_image:
            annotated = _encode_img_b64(r.plot())

    # 🚫 NOTHING detected → INVALID (NO DISEASE / NO HEALTH)
    if not raw_preds:
        return _return_error(
            "invalid_image",
            "No visible disease symptoms detected. Please upload a damaged maize leaf."
        )

    disease_classes = {"gray_spot", "blight", "common_rust"}

    disease_preds = [
        p for p in raw_preds
        if p["class_name"].lower() in disease_classes
    ]

    health_preds = [
        p for p in raw_preds
        if p["class_name"].lower() == "health"
    ]

    # 4️⃣ DISEASE HAS HIGHEST PRIORITY
    if disease_preds:
        filtered = apply_confidence_filtering(disease_preds)
        filtered = remove_duplicate_detections(filtered)
        if not filtered:
            filtered = disease_preds

        sev, label = calculate_severity(filtered, img)   # ✅ not img.shape


        return {
            "success": True,
            "predictions": filtered,
            "annotated_image_b64": annotated,
            "validation_passed": True,
            "severity_score": round(sev, 3),
            "severity_label": label,
            "total_detections": len(filtered),
        }

    # 5️⃣ HEALTH ONLY IF YOLO EXPLICITLY SAYS HEALTH
    if health_preds:
        return {
            "success": True,
            "predictions": [{
                "class_id": -2,
                "class_name": "health",
                "confidence": max(p["confidence"] for p in health_preds),
            }],
            "annotated_image_b64": None,
            "validation_passed": True,
            "severity_score": 0.0,
            "severity_label": "None",
            "total_detections": 0
        }

    # 6️⃣ EVERYTHING ELSE → INVALID
    return _return_error(
        "invalid_image",
        "Unclear image. Please upload a damaged maize leaf with visible disease symptoms."
    )
