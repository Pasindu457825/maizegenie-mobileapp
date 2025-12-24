from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_YEAR = 2020  # must match training

# =====================================================
# LOAD RANDOM FOREST MODEL + SCALERS
# =====================================================
try:
    rf_model = joblib.load(os.path.join(BASE_DIR, "random_forest_price_model.pkl"))
    scaler_X = joblib.load(os.path.join(BASE_DIR, "feature_scaler.pkl"))
    scaler_y = joblib.load(os.path.join(BASE_DIR, "target_scaler.pkl"))

    FEATURE_COLS = list(rf_model.feature_names_in_)

    print("✅ Random Forest model loaded")
    print("📌 RF expects features:", FEATURE_COLS)

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
# AUTO INPUT NORMALIZATION (SAFE)
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
# DEMAND COMPONENTS
# =====================================================
def compute_demand_components(req: PriceForecastRequest):
    demand_festival = 0.8 if req.season.lower() == "maha" else 0.6
    demand_fuel = min(req.fuel_price / 400.0, 1.0)

    if req.season.lower() == "maha":
        demand_season = 0.8
    elif req.season.lower() == "yala":
        demand_season = 0.7
    else:
        demand_season = 0.6

    return demand_festival, demand_fuel, demand_season


# =====================================================
# RF FORECAST FUNCTION (NO WARNINGS VERSION)
# =====================================================
def forecast_weeks_rf(req: PriceForecastRequest):
    results = []

    # rolling price history (for lag/roll)
    price_history = [req.last_price] * 8

    for i in range(req.weeks_ahead):
        week = ((req.week + i - 1) % 52) + 1
        year = req.year + ((req.week + i - 1) // 52)

        lag_1 = price_history[-1]
        lag_2 = price_history[-2]
        lag_4 = price_history[-4]
        roll_4 = np.mean(price_history[-4:])
        roll_8 = np.mean(price_history[-8:])

        demand_festival, demand_fuel, demand_season = compute_demand_components(req)

        row = {
            "time_idx": (year - BASE_YEAR) * 52 + week,
            "Year": year,
            "Week": week,

            "lag_1": lag_1,
            "lag_2": lag_2,
            "lag_4": lag_4,
            "roll_4": roll_4,
            "roll_8": roll_8,

            "demand_index": req.demand_index,
            "demand_Festival": demand_festival,
            "demand_fuel": demand_fuel,
            "demand_season": demand_season,

            "Fuel_price_Rs_per_L": req.fuel_price,
            "Import_tax_Rs_per_kg": req.import_tax,
            "Rainfall_mm": req.rainfall,
            "Temp_C": req.temperature,
        }

        # district one-hot
        for col in FEATURE_COLS:
            if col.startswith("dist_"):
                row[col] = 1 if col == f"dist_{req.district}" else 0

        # ✅ KEEP DATAFRAME (no .values)
        X = pd.DataFrame([row])[FEATURE_COLS]
        X_scaled = scaler_X.transform(X)
        pred = rf_model.predict(X_scaled)

        pred_price = scaler_y.inverse_transform(
            pred.reshape(-1, 1)
        )[0][0]

        pred_price = round(float(pred_price), 2)

        results.append({
            "week": i + 1,
            "rf_price": pred_price
        })

        price_history.append(pred_price)

    return results


# =====================================================
# API ROUTE
# =====================================================
@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    print("🔥 RF BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        req = normalize_if_needed(req)
        weeks = forecast_weeks_rf(req)
        return PriceForecastResponse(success=True, weeks=weeks)

    except Exception as e:
        print("❌ RF Forecast API Error:", e)
        raise HTTPException(status_code=500, detail="RF forecast failed")
