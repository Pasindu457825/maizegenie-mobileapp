from inference_sdk import InferenceHTTPClient
import os
import numpy as np
import cv2

from .service import calculate_severity, _return_error, attach_impact_boxes

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")
MODEL_ID = os.getenv("DISEASE_ROBOFLOW_MODEL_ID", "corn-leaf-disease-hgosu-jvjwb/1")
ROBOFLOW_API_URL = os.getenv("ROBOFLOW_API_URL", "https://serverless.roboflow.com")

if not ROBOFLOW_API_KEY:
    raise RuntimeError("ROBOFLOW_API_KEY not set")

client = InferenceHTTPClient(
    api_url=ROBOFLOW_API_URL,
    api_key=ROBOFLOW_API_KEY
)

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


def predict_disease_with_roboflow(image_bytes: bytes, conf=0.5):
    img_array = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img_bgr is None:
        return _return_error("invalid_image", "Invalid image")

    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)

    try:
        result = client.infer(img_bgr, model_id=MODEL_ID)
    except Exception as e:
        return {
            "success": False,
            "predictions": [],
            "annotated_image_b64": None,
            "validation_passed": False,
            "severity_score": 0.0,
            "severity_label": "None",
            "total_detections": 0,
            "message": f"Roboflow request failed: {e}",
        }

    raw_preds = result.get("predictions", [])

    filtered_preds = [
        p for p in raw_preds
        if float(p.get("confidence", 0)) >= conf
    ]

    if not filtered_preds:
        return _return_error(
            "invalid_leaf",
            "No maize leaf or disease detected"
        )

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
            ],
        })

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
            "annotated_image_b64": None,
        }

    disease_preds = [
        p for p in formatted
        if p["class_name"] in DISEASE_CLASSES
    ]

    if not disease_preds:
        return _return_error(
            "invalid_leaf",
            "No recognizable maize disease found"
        )

    disease_preds = attach_impact_boxes(disease_preds, img_rgb)
    sev, label = calculate_severity(disease_preds, img_rgb)

    return {
        "success": True,
        "predictions": disease_preds,
        "validation_passed": True,
        "severity_score": round(sev, 3),
        "severity_label": label,
        "total_detections": len(disease_preds),
        "annotated_image_b64": None,
    }
