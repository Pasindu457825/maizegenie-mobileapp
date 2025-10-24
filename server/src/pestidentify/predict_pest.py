from ultralytics import YOLO
import cv2
import os

# Load model (use your path)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "final_faw_model.pt")
model = YOLO(MODEL_PATH)

def identify_pest(image_path):
    """
    Runs inference on a given image and returns prediction results.
    """
    results = model.predict(source=image_path, conf=0.4)
    
    output = []
    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            name = model.names[cls_id]
            output.append({
                "class": name,
                "confidence": round(conf, 2)
            })
    return output
