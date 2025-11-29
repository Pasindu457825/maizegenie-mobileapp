from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import random

router = APIRouter(prefix="/api/yield", tags=["Yield Prediction"])


# ============================================================
# REQUEST / RESPONSE MODELS
# ============================================================
class YieldPredictionRequest(BaseModel):
    district: str
    location: str
    gps_lat: Optional[float] = None
    gps_lng: Optional[float] = None
    season: str
    planting_date: str
    land_size_value: float
    land_size_unit: str
    soil_condition: str
    irrigation_type: str
    variety: str
    rainfall_condition: str


class HarvestWindow(BaseModel):
    start: str
    end: str
    target: str


class CalendarEvent(BaseModel):
    title: str
    date: str


class ImpactFactor(BaseModel):
    name: str
    impact: str  # "Low", "Medium", "High"
    value: float  # 0.0 to 1.0


class YieldPredictionResponse(BaseModel):
    yield_prediction_t_ha: float
    confidence: str
    harvest_window: HarvestWindow
    calendar_event: CalendarEvent
    factors: List[ImpactFactor]


# ============================================================
# YIELD PREDICTION ENDPOINT
# ============================================================
@router.post("/predict", response_model=YieldPredictionResponse)
async def predict_yield(request: YieldPredictionRequest):
    """
    Predict maize yield based on farm conditions
    
    This endpoint uses ML models to predict yield. Currently uses simplified logic.
    TODO: Replace with actual ML model inference (XGBoost, Random Forest, etc.)
    """
    try:
        # Parse planting date
        planting_date = datetime.fromisoformat(request.planting_date.replace('Z', '+00:00'))
        
        # Calculate harvest window (typically 110-120 days for maize)
        harvest_start = planting_date + timedelta(days=110)
        harvest_end = planting_date + timedelta(days=120)
        harvest_target = planting_date + timedelta(days=115)
        
        # Base yield calculation (simplified model)
        # TODO: Replace with actual ML model prediction
        base_yield = 4.5  # tons per hectare
        
        # Variety impact
        variety_multipliers = {
            "Jet 999": 1.1,
            "Pacific 808": 1.05,
            "GT 709": 0.95,
            "GT200": 1.0,
            "Commando": 1.08,
        }
        variety_multiplier = variety_multipliers.get(request.variety, 1.0)
        
        # Soil condition impact
        soil_multipliers = {
            "Well-Drained Loamy": 1.15,
            "Clay Loam": 1.0,
            "Sandy Loam": 0.95,
            "Heavy Clay": 0.85,
            "Sandy": 0.8,
        }
        soil_multiplier = soil_multipliers.get(request.soil_condition, 1.0)
        
        # Irrigation impact
        irrigation_multipliers = {
            "Drip Irrigation": 1.2,
            "Sprinkler": 1.1,
            "Flood Irrigation": 1.05,
            "Rainfed": 0.85,
        }
        irrigation_multiplier = irrigation_multipliers.get(request.irrigation_type, 1.0)
        
        # Rainfall impact
        rainfall_multipliers = {
            "Adequate": 1.1,
            "Moderate": 1.0,
            "Low": 0.8,
            "Excessive": 0.9,
        }
        rainfall_multiplier = rainfall_multipliers.get(request.rainfall_condition, 1.0)
        
        # Season impact
        season_multipliers = {
            "Maha": 1.05,
            "Yala": 0.95,
        }
        season_multiplier = season_multipliers.get(request.season, 1.0)
        
        # Calculate final yield
        predicted_yield = (
            base_yield
            * variety_multiplier
            * soil_multiplier
            * irrigation_multiplier
            * rainfall_multiplier
            * season_multiplier
        )
        
        # Add some randomness to simulate ML model variance
        predicted_yield *= (0.95 + random.random() * 0.1)  # ±5% variance
        
        # Determine confidence based on data completeness
        confidence_score = 0.8
        if request.gps_lat and request.gps_lng:
            confidence_score += 0.1
        
        if confidence_score >= 0.85:
            confidence = "High"
        elif confidence_score >= 0.7:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Build impact factors
        factors = [
            ImpactFactor(
                name="Rainfall Condition",
                impact="High" if rainfall_multiplier >= 1.05 else "Medium" if rainfall_multiplier >= 0.9 else "Low",
                value=rainfall_multiplier
            ),
            ImpactFactor(
                name="Soil Condition",
                impact="High" if soil_multiplier >= 1.1 else "Medium" if soil_multiplier >= 0.95 else "Low",
                value=soil_multiplier
            ),
            ImpactFactor(
                name="Variety",
                impact="High" if variety_multiplier >= 1.05 else "Medium" if variety_multiplier >= 0.98 else "Low",
                value=variety_multiplier
            ),
            ImpactFactor(
                name="Irrigation Type",
                impact="High" if irrigation_multiplier >= 1.1 else "Medium" if irrigation_multiplier >= 0.95 else "Low",
                value=irrigation_multiplier
            ),
            ImpactFactor(
                name="Season",
                impact="Medium",
                value=season_multiplier
            ),
        ]
        
        # Build response
        response = YieldPredictionResponse(
            yield_prediction_t_ha=round(predicted_yield, 2),
            confidence=confidence,
            harvest_window=HarvestWindow(
                start=harvest_start.strftime("%Y-%m-%d"),
                end=harvest_end.strftime("%Y-%m-%d"),
                target=harvest_target.strftime("%Y-%m-%d"),
            ),
            calendar_event=CalendarEvent(
                title="Maize Harvest Reminder",
                date=harvest_target.strftime("%Y-%m-%d"),
            ),
            factors=factors,
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check for yield prediction service"""
    return {
        "status": "ok",
        "service": "yield-prediction",
        "model_loaded": False,  # TODO: Update when ML model is loaded
    }
