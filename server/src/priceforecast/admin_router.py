from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from src.priceforecast.weather_service import weather_predictor
import pandas as pd
import numpy as np

# 🔥 NEW: Supabase client import
from src.database.supabase_client import supabase

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ============================================================
# 1) GET LATEST PRICE CONFIG  (Now using Supabase)
# ============================================================
@router.get("/price-data")
def get_price_data():
    try:
        result = (
            supabase
            .from_("price_config")
            .select("*")
            .order("updated_at", desc=True)
            .limit(1)
            .execute()
        )

        if result.data and len(result.data) > 0:
            row = result.data[0]

            # Convert snake_case → camelCase for frontend
            formatted = {
                "fuelPrice": row["fuel_price"],
                "importTax": row["import_tax"],
                "farmGatePrice": row["farm_gate_price"],
                "lastUpdated": row["updated_at"],
            }

            return {"success": True, "data": formatted}

        # Default if table empty
        return {
            "success": True,
            "data": {
                "fuelPrice": 380.0,
                "importTax": 25.0,
                "farmGatePrice": 115.0,
                "lastUpdated": None
            }
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# ============================================================
# 2) INSERT NEW PRICE CONFIG (Now using Supabase)
# ============================================================
@router.post("/price-data")
def update_price_data(req: dict):
    required = ["fuelPrice", "importTax", "farmGatePrice"]
    if not all(k in req for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields")

    try:
        timestamp = datetime.utcnow().isoformat()

        insert_data = {
            "fuel_price": req["fuelPrice"],
            "import_tax": req["importTax"],
            "farm_gate_price": req["farmGatePrice"],
            "updated_at": timestamp,
        }

        supabase.from_("price_config").insert(insert_data).execute()

        # 🔥 IMPORTANT: return camelCase so frontend updates properly
        return {
            "success": True,
            "message": "Saved!",
            "data": {
                "fuelPrice": req["fuelPrice"],
                "importTax": req["importTax"],
                "farmGatePrice": req["farmGatePrice"],
                "lastUpdated": timestamp,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# 3) WEATHER PREDICTION – NEXT 7 DAYS  (UNCHANGED)
# ============================================================
@router.post("/weather/predict")
def predict_weather(body: dict):
    """
    Body:
    {
        "city": "Colombo",
        "historical_data": [...]  // optional
    }
    """
    try:
        city = body.get("city", "Colombo")

        # If frontend sends historical data manually
        if "historical_data" in body:
            df = pd.DataFrame(body["historical_data"])
        else:
            # Generate sample data temporarily (replace with real DB weather data)
            df = generate_sample_weather_data(city)

        # Predict next week
        result = weather_predictor.predict_next_week(city, df)

        # Add farming advice
        if result.get("success"):
            result["advice"] = weather_predictor.get_weather_advice(
                result.get("predictions", [])
            )

        # Return structured response
        return {
            "success": True,
            "city": result.get("city", city),
            "predictions": result.get("predictions", []),
            "last_actual_temp": result.get("last_actual_temp", 0),
            "last_date": result.get("last_date", datetime.now().isoformat()),
            "advice": result.get("advice", []),
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


# ============================================================
# 5) SAMPLE DATA GENERATOR  (UNCHANGED)
# ============================================================
def generate_sample_weather_data(city: str, days: int = 30):
    """Generate random realistic weather data"""
    dates = pd.date_range(end=datetime.now(), periods=days, freq="D")
    base_temp = 27
    temps = base_temp + np.random.randn(days) * 3

    df = pd.DataFrame({
        "time": dates,
        "city": city,
        "temperature_mean": temps,
        "temperature_max": temps + 3,
        "temperature_min": temps - 2,
        "precipitation_sum": np.random.rand(days) * 10,
        "rain_sum": np.random.rand(days) * 8,
        "windspeed_10m_max": 10 + np.random.rand(days) * 5,
    })

    return df
