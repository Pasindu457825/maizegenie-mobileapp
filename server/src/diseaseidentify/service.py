from io import BytesIO
from typing import List, Dict, Any, Optional, Tuple
import base64
import numpy as np
import cv2
from PIL import Image

from .model import get_model

# Confidence thresholds
MIN_CONFIDENCE_THRESHOLD = 0.4  # Increased minimum confidence

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
        return base64.b64encode(buffer).decode('utf-8')
    except Exception as e:
        raise ValueError(f"Failed to encode image: {e}")

def validate_image_quality(image: np.ndarray) -> Tuple[bool, str]:
    """
    Validate if image is suitable for disease detection
    """
    try:
        # Check image dimensions
        height, width = image.shape[:2]
        if height < 200 or width < 200:
            return False, "Image too small. Please upload a higher resolution image."
        
        # Check if image is too blurry
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        blur_value = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        if blur_value < 30:
            return False, "Image is too blurry. Please upload a clearer image."
        
        # Check if image is mostly one color (could be invalid)
        std_dev = np.std(image)
        if std_dev < 10:
            return False, "Image lacks detail. Please upload a proper plant image."
            
        return True, "Image quality acceptable"
        
    except Exception as e:
        return False, f"Image validation error: {str(e)}"

def get_class_confidence_threshold(class_name: str) -> float:
    """
    Return minimum confidence threshold based on class type
    Higher thresholds for classes that cause false positives
    """
    confidence_map = {
        # Diseases - moderate confidence
        "common_rust": 0.5,
        "northern_leaf_blight": 0.5,
        "gray_leaf_spot": 0.5,
        "southern_leaf_blight": 0.5,
        
        # Healthy - higher confidence to avoid false negatives
        "healthy": 0.6,
        "no_disease": 0.6,
        
        # Default for unknown classes
        "default": 0.5
    }
    return confidence_map.get(class_name, confidence_map["default"])

def apply_confidence_filtering(predictions: List[Dict]) -> List[Dict]:
    """
    Apply class-specific confidence thresholds and filtering
    """
    filtered_predictions = []
    
    for pred in predictions:
        class_name = pred["class_name"].lower()
        confidence = pred["confidence"]
        
        # Get class-specific threshold
        min_confidence = get_class_confidence_threshold(class_name)
        
        # Apply threshold
        if confidence >= min_confidence:
            filtered_predictions.append(pred)
    
    return filtered_predictions

def remove_duplicate_detections(predictions: List[Dict]) -> List[Dict]:
    """
    Remove duplicate detections of the same class with high overlap
    """
    if len(predictions) <= 1:
        return predictions
    
    # Sort by confidence (highest first)
    predictions.sort(key=lambda x: x['confidence'], reverse=True)
    
    filtered = []
    for current_pred in predictions:
        is_duplicate = False
        
        for kept_pred in filtered:
            # If same class and boxes overlap significantly, consider duplicate
            if (current_pred['class_name'] == kept_pred['class_name'] and
                boxes_overlap(current_pred.get('box_xyxy', []), kept_pred.get('box_xyxy', []))):
                is_duplicate = True
                break
        
        if not is_duplicate:
            filtered.append(current_pred)
    
    return filtered

def boxes_overlap(box1: List[float], box2: List[float], overlap_threshold: float = 0.6) -> bool:
    """
    Check if two bounding boxes overlap significantly
    """
    if not box1 or not box2 or len(box1) != 4 or len(box2) != 4:
        return False
    
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Calculate intersection area
    xi1 = max(x1_1, x1_2)
    yi1 = max(y1_1, y1_2)
    xi2 = min(x2_1, x2_2)
    yi2 = min(y2_1, y2_2)
    
    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    
    # Calculate box areas
    box1_area = (x2_1 - x1_1) * (y2_1 - y1_1)
    box2_area = (x2_2 - x1_2) * (y2_2 - y1_2)
    
    # Calculate overlap ratio
    overlap_ratio = inter_area / min(box1_area, box2_area) if min(box1_area, box2_area) > 0 else 0
    
    return overlap_ratio > overlap_threshold

def predict_disease_enhanced(
    image_bytes: bytes, 
    conf: float = 0.5, 
    return_image: bool = False
) -> Dict[str, Any]:
    """
    Enhanced disease detection with validation and filtering
    """
    # Load model (cached)
    model = get_model()

    # Convert uploaded bytes to numpy array
    img_rgb = _read_image_bytes(image_bytes)
    
    # Validate image quality
    is_valid, quality_message = validate_image_quality(img_rgb)
    if not is_valid:
        return {
            "predictions": [{
                "class_id": -2,
                "class_name": "invalid_image",
                "confidence": 0.0,
                "message": quality_message
            }],
            "annotated_image_b64": None,
            "validation_passed": False
        }

    # Run YOLOv8 inference with user-provided confidence
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
        
        # Collect all predictions
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = class_names.get(class_id, f"class_{class_id}")
            
            # Get bounding box coordinates
            bbox = box.xyxy[0].tolist()
            
            predictions.append({
                "class_id": class_id,
                "class_name": class_name,
                "confidence": round(confidence, 3),
                "box_xyxy": [round(float(coord), 2) for coord in bbox],
            })

        # Generate annotated image if requested
        if return_image and hasattr(result, 'plot'):
            try:
                annotated_img = result.plot()
                annotated_b64 = _encode_img_b64(annotated_img)
            except Exception as e:
                print(f"Warning: Could not generate annotated image: {e}")

    # Apply post-processing
    if predictions:
        # Filter by confidence thresholds
        filtered_predictions = apply_confidence_filtering(predictions)
        
        # Remove duplicates
        final_predictions = remove_duplicate_detections(filtered_predictions)
    else:
        final_predictions = []

    # Handle no valid detections
    if not final_predictions:
        final_predictions = [{
            "class_id": -1,
            "class_name": "no_disease",
            "confidence": 0.0,
            "message": "No diseases detected at current confidence level"
        }]

    return {
        "predictions": final_predictions,
        "annotated_image_b64": annotated_b64,
        "validation_passed": True,
        "total_detections": len(final_predictions)
    }