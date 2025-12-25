from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

# =====================================================
# ROUTER SETUP
# =====================================================
router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_YEAR = 2020   # MUST match retraining

# =====================================================
# LOAD DELTA MODEL
# =====================================================
try:
    rf_model = joblib.load(
        os.path.join(BASE_DIR, "rf_price_delta_model.pkl")
    )
    FEATURE_COLS = list(rf_model.feature_names_in_)

    print("✅ RF DELTA model loaded")
    print("📌 Expected features:", FEATURE_COLS)

except Exception as e:
    print("❌ Model load failed:", e)
    raise RuntimeError("Model loading failed")


# =====================================================
# REQUEST / RESPONSE MODELS
# =====================================================
class PriceForecastRequest(BaseModel):
    year: int
    week: int
    district: str
    season: str
    fuel_price: float
    rainfall: float
    temperature: float
    demand_index: float
    import_tax: float
    last_price: float
    weeks_ahead: int = 4


class WeekForecast(BaseModel):
    week: int
    rf_price: float


class PriceForecastResponse(BaseModel):
    success: bool
    weeks: list[WeekForecast]


# =====================================================
# NORMALIZATION SAFETY
# =====================================================
def normalize_if_needed(req: PriceForecastRequest):
    if req.last_price < 5:
        req.last_price *= 1000
    if req.fuel_price < 5:
        req.fuel_price *= 1000
    if req.rainfall < 5:
        req.rainfall *= 100
    return req


# =====================================================
# RF DELTA WALK-FORWARD FORECAST
# =====================================================
def forecast_weeks_rf_delta(req: PriceForecastRequest):
    results = []

    # price continuity buffer
    price_history = [req.last_price] * 8

    for i in range(req.weeks_ahead):
        week = ((req.week + i - 1) % 52) + 1
        year = req.year + ((req.week + i - 1) // 52)

        year_trend = year - BASE_YEAR

        lag_1 = price_history[-1]
        lag_2 = price_history[-2]
        lag_4 = price_history[-4]
        roll_4 = np.mean(price_history[-4:])
        roll_8 = np.mean(price_history[-8:])

        row = {
            "year_trend": year_trend,
            "Week": week,

            "lag_1": lag_1,
            "lag_2": lag_2,
            "lag_4": lag_4,
            "roll_4": roll_4,
            "roll_8": roll_8,

            "demand_index": req.demand_index,
            "Fuel_price_Rs_per_L": req.fuel_price,
            "Import_tax_Rs_per_kg": req.import_tax,
            "Rainfall_mm": req.rainfall,
            "Temp_C": req.temperature,
        }

        # district one-hot
        for col in FEATURE_COLS:
            if col.startswith("dist_"):
                row[col] = 1 if col == f"dist_{req.district}" else 0

        X = pd.DataFrame([row])[FEATURE_COLS]

        # 🔮 predict DELTA
        delta = rf_model.predict(X)[0]

        # final price
        next_price = lag_1 + delta
        next_price = round(float(next_price), 2)

        results.append({
            "week": i + 1,
            "rf_price": next_price
        })

        price_history.append(next_price)

    return results


# =====================================================
# API ENDPOINT
# =====================================================
@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    print("🔥 RF DELTA BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        req = normalize_if_needed(req)
        weeks = forecast_weeks_rf_delta(req)
        return PriceForecastResponse(success=True, weeks=weeks)

    except Exception as e:
        print("❌ RF Delta Forecast Error:", e)
        raise HTTPException(status_code=500, detail="RF delta forecast failed")
