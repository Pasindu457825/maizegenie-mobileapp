from typing import List, Optional
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """Bounding box for a detection."""
    x1: float = Field(..., description="Top-left X coordinate")
    y1: float = Field(..., description="Top-left Y coordinate")
    x2: float = Field(..., description="Bottom-right X coordinate")
    y2: float = Field(..., description="Bottom-right Y coordinate")


class DiseasePrediction(BaseModel):
    """Represents the prediction for a single detected class."""
    class_id: int
    class_name: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    box_xyxy: Optional[List[float]] = Field(
        None,
        description="Bounding box in [x1, y1, x2, y2] format"
    )
    message: Optional[str] = None


class DiseaseResponse(BaseModel):
    """Response model for disease detection API."""
    success: bool = True
    validation_passed: bool
    total_detections: int
    predictions: List[DiseasePrediction]
    annotated_image_b64: Optional[str] = Field(
        None,
        description="Base64 encoded annotated image (optional)"
    )

