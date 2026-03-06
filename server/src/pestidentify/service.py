from io import BytesIO
from typing import List, Dict, Any, Optional
import base64
import numpy as np
import cv2
from PIL import Image

from .model import PestModelName, get_model

# Set confidence threshold
CONFIDENCE_THRESHOLD = 0.8

def _read_image_bytes(image_bytes: bytes) -> np.ndarray:
    """Read uploaded bytes → RGB numpy array."""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    return np.array(img)

def _encode_img_b64(img_bgr: np.ndarray) -> str:
    """Encode BGR numpy image → base64 JPEG string."""
    ok, buf = cv2.imencode(".jpg", img_bgr)
    if not ok:
        raise ValueError("Failed to encode annotated image.")
    return base64.b64encode(buf.tobytes()).decode("utf-8")

def predict_pest(
    image_bytes: bytes,
    conf: float = 0.4,
    return_image: bool = False,
    model_name: PestModelName = "local",
) -> Dict[str, Any]:
    model = get_model(model_name)
    img_rgb = _read_image_bytes(image_bytes)

    results = model.predict(source=img_rgb, conf=conf, verbose=False, save=False)

    preds: List[Dict[str, Any]] = []
    annotated_b64: Optional[str] = None

    for r in results:
        names = r.names
        for b in r.boxes:
            cls_id = int(b.cls[0])
            confv = float(b.conf[0])

            # Skip weak detections
            if confv < CONFIDENCE_THRESHOLD:
                continue

            name = names[cls_id]
            xyxy = b.xyxy[0].tolist()

            preds.append({
                "class_id": cls_id,
                "class_name": name,
                "confidence": round(confv, 3),
                "box_xyxy": [round(float(v), 2) for v in xyxy],
            })

            # ✅ DEBUG PRINT — shows detections in terminal
            print(f"[DEBUG] Detected: {name} (conf={confv:.3f}) at {xyxy}")

        if return_image:
            annotated_bgr = r.plot()
            annotated_b64 = _encode_img_b64(annotated_bgr)

    # If nothing passes threshold
    if not preds:
        preds = [{"class_id": -1, "class_name": "No pest detected", "confidence": 0.0, "box_xyxy": []}]
        print("[DEBUG] No pest detected (all predictions below threshold).")

    return {"predictions": preds, "annotated_image_b64": annotated_b64}
