from io import BytesIO
from typing import List, Dict, Any, Optional
import base64
import numpy as np
import cv2
from PIL import Image

from .model import get_model

# Minimum confidence threshold for valid detections
CONFIDENCE_THRESHOLD = 0.2

def _read_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Convert uploaded image bytes into an RGB numpy array."""
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        return np.array(img)
    except Exception as e:
        raise ValueError(f"Failed to read image bytes: {e}")

def _encode_img_b64(img_bgr: np.ndarray) -> str:
    """Convert a BGR image (with boxes drawn) into a base64 JPEG string."""
    ok, buf = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise ValueError("Failed to encode annotated image.")
    return base64.b64encode(buf.tobytes()).decode("utf-8")

def predict_disease(image_bytes: bytes, conf: float = 0.4, return_image: bool = False) -> Dict[str, Any]:
    """
    Run YOLOv8 model on the uploaded image bytes for disease detection.
    Returns predictions and optionally the annotated image as base64.
    """
    # Load model (cached after first load)
    model = get_model()

    # Convert uploaded bytes to numpy array
    img_rgb = _read_image_bytes(image_bytes)

    # Run YOLOv8 inference
    results = model.predict(source=img_rgb, conf=conf, verbose=False, save=False)

    preds: List[Dict[str, Any]] = []
    annotated_b64: Optional[str] = None

    for r in results:
        names = r.names
        for b in r.boxes:
            cls_id = int(b.cls[0])
            confv = float(b.conf[0])

            # Filter weak predictions
            if confv < CONFIDENCE_THRESHOLD:
                continue

            xyxy = b.xyxy[0].tolist()
            name = names.get(cls_id, f"class_{cls_id}")

            preds.append({
                "class_id": cls_id,
                "class_name": name,
                "confidence": round(confv, 3),
                "box_xyxy": [round(float(v), 2) for v in xyxy],
            })

            print(f"[DISEASE DETECTED] {name} (conf={confv:.3f})")

        # Optionally include annotated image
        if return_image:
            annotated_bgr = r.plot()
            annotated_b64 = _encode_img_b64(annotated_bgr)

    # If no predictions pass threshold
    if not preds:
        preds = [{
            "class_id": -1,
            "class_name": "No disease detected",
            "confidence": 0.0,
            "box_xyxy": []
        }]
        print("[INFO] No disease detected (below confidence threshold).")

    return {
        "predictions": preds,
        "annotated_image_b64": annotated_b64
    }
