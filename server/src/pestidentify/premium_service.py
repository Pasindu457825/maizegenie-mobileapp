import os
from typing import Any, Dict, List

import cv2
import numpy as np
from inference_sdk import InferenceHTTPClient

_client: InferenceHTTPClient | None = None
PREMIUM_MIN_CONFIDENCE = 0.65


class PremiumPestServiceError(RuntimeError):
    def __init__(self, message: str, status_code: int = 503, code: str | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code


def _get_client() -> InferenceHTTPClient:
    global _client
    if _client is not None:
        return _client

    api_key = os.getenv("PEST_ROBOFLOW_API_KEY") or os.getenv("ROBOFLOW_API_KEY")
    if not api_key:
        raise RuntimeError("PEST_ROBOFLOW_API_KEY (or ROBOFLOW_API_KEY) is not set")

    _client = InferenceHTTPClient(
        api_url="https://serverless.roboflow.com",
        api_key=api_key,
    )
    return _client


def _get_model_id() -> str:
    model_id = os.getenv("PEST_ROBOFLOW_MODEL_ID")
    if not model_id:
        raise RuntimeError("PEST_ROBOFLOW_MODEL_ID is not set")
    return model_id


def _map_prediction(pred: Dict[str, Any], idx: int) -> Dict[str, Any]:
    class_name = str(pred.get("class", "unknown")).strip()
    confidence = float(pred.get("confidence", 0.0))
    x = float(pred.get("x", 0.0))
    y = float(pred.get("y", 0.0))
    w = float(pred.get("width", 0.0))
    h = float(pred.get("height", 0.0))

    return {
        "class_id": idx,
        "class_name": class_name,
        "confidence": round(confidence, 3),
        "box_xyxy": [
            round(x - (w / 2), 2),
            round(y - (h / 2), 2),
            round(x + (w / 2), 2),
            round(y + (h / 2), 2),
        ],
    }


def predict_pest_premium(
    image_bytes: bytes,
    conf: float = 0.4,
    return_image: bool = False,
) -> Dict[str, Any]:
    client = _get_client()
    model_id = _get_model_id()
    img_array = np.frombuffer(image_bytes, np.uint8)
    img_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Invalid image")

    result = client.infer(img_bgr, model_id=model_id)
    raw_preds: List[Dict[str, Any]] = result.get("predictions", []) or []

    effective_conf = max(conf, PREMIUM_MIN_CONFIDENCE)
    filtered = [p for p in raw_preds if float(p.get("confidence", 0.0)) >= effective_conf]
    preds = [_map_prediction(p, idx) for idx, p in enumerate(filtered)]

    if not preds:
        preds = [
            {
                "class_id": -1,
                "class_name": "No pest detected",
                "confidence": 0.0,
                "box_xyxy": [],
            }
        ]

    # Roboflow response does not include annotated image in our current flow.
    return {"predictions": preds, "annotated_image_b64": None}
