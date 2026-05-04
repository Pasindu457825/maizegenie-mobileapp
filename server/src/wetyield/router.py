from fastapi import APIRouter, HTTPException
from .models import WetWeightPredictionRequest, WetWeightPredictionResponse
from .service import predict_wet_weight, MODEL_LOADED, load_model
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/wet-yield", tags=["Wet Weight Yield Prediction"])


@router.post("/predict", response_model=WetWeightPredictionResponse)
async def predict_wet_weight_endpoint(request: WetWeightPredictionRequest):
    """
    Predict controlled wet weight yield in field (Kg/m²) using XGBoost model.
    
    **Input Parameters:**
    - seed_variety: Maize variety (Jet 999, GT 709, GT 200, Pacific 808, Commando)
    - cob_height_cm: Height of cob from ground (cm)
    - plant_height_cm: Total plant height (cm)
    - cob_wet_weight_g: Weight of wet cob (grams)
    - cob_length_cm: Length of cob (cm)
    - num_seed_rows: Number of seed rows on cob
    
    **Returns:**
    - predicted_wet_weight_field: Predicted wet weight in Kg/m²
    - confidence_score: Prediction confidence (0-100)
    - input_summary: Summary of inputs and engineered features
    - feature_importance: Most important features for prediction
    - recommendations: Actionable recommendations
    """
    try:
        result = predict_wet_weight(request.dict())
        return WetWeightPredictionResponse(**result)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint for wet weight prediction service"""
    try:
        if not MODEL_LOADED:
            load_model()
        
        return {
            "status": "ok" if MODEL_LOADED else "error",
            "service": "wet-weight-yield-prediction",
            "model_loaded": MODEL_LOADED,
            "model_type": "XGBoost Regressor",
            "supported_varieties": ["Jet 999", "GT 709", "GT 200", "Pacific 808", "Commando"]
        }
    except Exception as e:
        return {
            "status": "error",
            "service": "wet-weight-yield-prediction",
            "model_loaded": False,
            "error": str(e)
        }


@router.get("/varieties")
async def get_supported_varieties():
    """Get list of supported seed varieties"""
    return {
        "varieties": [
            {"id": "jet999", "name": "Jet 999", "description": "High-yielding hybrid variety"},
            {"id": "gt709", "name": "GT 709", "description": "Disease-resistant variety"},
            {"id": "gt200", "name": "GT 200", "description": "Early maturing variety"},
            {"id": "pacific808", "name": "Pacific 808", "description": "Drought-tolerant variety"},
            {"id": "commando", "name": "Commando", "description": "Baseline reference variety"}
        ]
    }
