from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from .service import predict_yield_service

# IMPORTANT: Prefix changed to /api/yield to match frontend
router = APIRouter(prefix="/api/yield", tags=["Yield Prediction"])

class YieldBody(BaseModel):
    district: str
    location: str
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    season: str
    planting_date: str
    land_size_value: float
    land_size_unit: str  # Always "Acres" from frontend
    soil_condition: str
    irrigation_type: str
    variety: str
    rainfall_condition: str


@router.post("/predict")
def predict_yield(body: YieldBody):
    """
    Predict maize yield based on farm conditions.
    Frontend expects specific response format - DO NOT CHANGE!
    """
    try:
        result = predict_yield_service(body.dict())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
def health_check():
    """Health check endpoint"""
    from .ml_model import USE_ML
    return {
        "status": "ok",
        "service": "yield-prediction",
        "ml_model_loaded": USE_ML
    }
