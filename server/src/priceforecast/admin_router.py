from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from src.priceforecast.weather_service import weather_predictor
import pandas as pd
import numpy as np

# Supabase client import
from src.database.supabase_client import supabase

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ============================================================
# NOTE: Price endpoints have been converted to district-specific
# The /price-data endpoints that handled global prices have been
# removed. All price data is now stored directly in the maize_prices
# table with fuel_price and import_tax fields, managed through
# the mobile app's Supabase integration.
# ============================================================


# ============================================================
# WEATHER PREDICTION – NEXT 7 DAYS
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
