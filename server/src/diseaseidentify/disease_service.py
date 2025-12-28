from inference_sdk import InferenceHTTPClient
import os
import numpy as np
import cv2
import base64

from .service import calculate_severity, _return_error

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = "corn-leaf-disease-hgosu-jvjwb/1"

if not ROBOFLOW_API_KEY:
    raise RuntimeError("ROBOFLOW_API_KEY not set")

client = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=ROBOFLOW_API_KEY
)

# 🔁 Map Roboflow → frontend-safe class names
CLASS_MAP = {
    "gray leaf spot": "gray_spot",
    "common rust": "common_rust",
    "leaf blight": "blight",
    "blight": "blight",
    "healthy": "health",
}

DISEASE_CLASSES = {"gray_spot", "common_rust", "blight"}


def normalize_class(name: str) -> str:
    return CLASS_MAP.get(name.strip().lower(), name.strip().lower())


def predict_disease_with_roboflow(image_bytes: bytes, conf=0.6):
    # ---- Decode image ----
    img_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # ✅ FIX


    if img is None:
        return _return_error("invalid_image", "Invalid image")

    # ---- Encode base64 for Roboflow ----
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    # ---- Roboflow inference ----
    try:
        result = client.infer(image_b64, model_id=MODEL_ID)
    except Exception as e:
        return _return_error("roboflow_error", str(e))

    raw_preds = result.get("predictions", [])

    # ✅ APPLY CONFIDENCE FILTER (matches Preview UI)
    filtered_preds = [
        p for p in raw_preds
        if float(p.get("confidence", 0)) >= conf
    ]

    # ❌ No valid detections
    if not filtered_preds:
        return _return_error(
            "invalid_leaf",
            "No maize leaf or disease detected"
        )

    # ---- Normalize predictions ----
    formatted = []

    for p in filtered_preds:
        class_name = normalize_class(p.get("class", ""))

        formatted.append({
            "class_id": -1,
            "class_name": class_name,
            "confidence": float(p.get("confidence", 0)),
            "box_xyxy": [
                p["x"] - p["width"] / 2,
                p["y"] - p["height"] / 2,
                p["x"] + p["width"] / 2,
                p["y"] + p["height"] / 2,
            ]
        })

    # ---- HEALTH CASE ----
    health_preds = [p for p in formatted if p["class_name"] == "health"]

    if health_preds:
        return {
            "success": True,
            "predictions": [{
                "class_id": -2,
                "class_name": "health",
                "confidence": max(p["confidence"] for p in health_preds),
            }],
            "validation_passed": True,
            "severity_score": 0.0,
            "severity_label": "None",
            "total_detections": 0,
            "annotated_image_b64": None
        }

    # ---- DISEASE CASE ----
    disease_preds = [
        p for p in formatted
        if p["class_name"] in DISEASE_CLASSES
    ]

    if not disease_preds:
        return _return_error(
            "invalid_leaf",
            "No recognizable maize disease found"
        )

    sev, label = calculate_severity(disease_preds, img)


    return {
        "success": True,
        "predictions": disease_preds,
        "validation_passed": True,
        "severity_score": round(sev, 3),
        "severity_label": label,
        "total_detections": len(disease_preds),
        "annotated_image_b64": None
    }
