from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .weather_service1 import predict_farming_condition, RECOMMENDATIONS, DEFAULT

router = APIRouter(prefix="/api/weather", tags=["Weather"])


class WeatherRequest(BaseModel):
    temperature: float
    temperature_max: float
    temperature_min: float
    rainfall: float
    windspeed: float
    radiation: float
    language: str = "si"


@router.post("/recommend")
def recommend_weather(data: WeatherRequest):

    try:
        # ---------------------------------------
        # CLEAN ALL VALUES (prevent NaN → 422)
        # ---------------------------------------
        clean = {
            "temperature": float(data.temperature or 0),
            "temperature_max": float(data.temperature_max or data.temperature or 0),
            "temperature_min": float(data.temperature_min or data.temperature or 0),
            "rainfall": float(data.rainfall or 0),
            "windspeed": float(data.windspeed or 0),
            "radiation": float(data.radiation or 200),
            "language": data.language,
        }

        # ---------------------------------------
        # ML Prediction
        # ---------------------------------------
        condition, confidence = predict_farming_condition(clean)
        rec = RECOMMENDATIONS.get(condition, RECOMMENDATIONS[DEFAULT])

        # ---------------------------------------
        # BUILD RESPONSE
        # ---------------------------------------
        return {
            "success": True,
            "condition": condition,
            "confidence": round(confidence * 100, 1),

            "weather_data": {
                "temperature": clean["temperature"],
                "rainfall": clean["rainfall"],
                "windspeed": clean["windspeed"],
            },

            "recommendation": {
                "status": rec["status"] if clean["language"] == "si" else rec["status_en"],
                "action": rec["action"] if clean["language"] == "si" else rec["action_en"],
                "irrigation": rec["irrigation"] if clean["language"] == "si" else rec["irrigation_en"],
                "fertilizer": rec["fertilizer"] if clean["language"] == "si" else rec["fertilizer_en"],
                "activities": rec["activities"] if clean["language"] == "si" else rec["activities_en"],
                "risk_level": rec["risk_level"] if clean["language"] == "si" else rec["risk_level_en"],
                "color": rec["color"]
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
