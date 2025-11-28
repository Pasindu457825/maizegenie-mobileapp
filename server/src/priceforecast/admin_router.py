from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from src.database.db import get_connection
from src.priceforecast.weather_service import weather_predictor
import pandas as pd
import numpy as np

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ============================================================
# 1) GET LATEST PRICE CONFIG
# ============================================================
@router.get("/price-data")
def get_price_data():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM price_config ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    conn.close()

    if row:
        return {
            "success": True,
            "data": {
                "fuelPrice": row["fuel_price"],
                "importTax": row["import_tax"],
                "farmGatePrice": row["farm_gate_price"],
                "lastUpdated": row["updated_at"],
            },
        }

    # Default if DB empty
    return {
        "success": True,
        "data": {
            "fuelPrice": 380.0,
            "importTax": 25.0,
            "farmGatePrice": 115.0,
            "lastUpdated": None,
        },
    }


# ============================================================
# 2) INSERT NEW PRICE CONFIG
# ============================================================
@router.post("/price-data")
def update_price_data(req: dict):
    required = ["fuelPrice", "importTax", "farmGatePrice"]
    if not all(k in req for k in required):
        raise HTTPException(status_code=400, detail="Missing required fields")

    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """INSERT INTO price_config (fuel_price, import_tax, farm_gate_price, updated_at)
           VALUES (?, ?, ?, ?)""",
        (
            req["fuelPrice"],
            req["importTax"],
            req["farmGatePrice"],
            datetime.now().isoformat(),
        ),
    )

    conn.commit()
    conn.close()

    return {"success": True, "message": "Saved!", "data": req}


# ============================================================
# 3) WEATHER PREDICTION – NEXT 7 DAYS
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

        # Return safe structured response
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
# 5) SAMPLE DATA GENERATOR (TEMPORARY)
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
