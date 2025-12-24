from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# =====================================================
# LOAD RANDOM FOREST MODEL + SCALERS
# =====================================================
try:
    rf_model = joblib.load(os.path.join(BASE_DIR, "random_forest_price_model.pkl"))
    scaler_X = joblib.load(os.path.join(BASE_DIR, "feature_scaler.pkl"))
    scaler_y = joblib.load(os.path.join(BASE_DIR, "target_scaler.pkl"))

    # 🔥 ONLY TRUST FEATURES LEARNED BY MODEL
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
# AUTO DEMAND COMPONENTS
# =====================================================
def compute_demand_components(req: PriceForecastRequest):
    # festival / seasonal demand
    demand_festival = 0.8 if req.season.lower() == "maha" else 0.6

    # fuel pressure
    demand_fuel = min(req.fuel_price / 400.0, 1.0)

    # season demand
    if req.season.lower() == "maha":
        demand_season = 0.8
    elif req.season.lower() == "yala":
        demand_season = 0.7
    else:
        demand_season = 0.6

    return demand_festival, demand_fuel, demand_season


# =====================================================
# FEATURE BUILDER (MODEL-ALIGNED)
# =====================================================
def build_features(req: PriceForecastRequest, step: int):
    demand_festival, demand_fuel, demand_season = compute_demand_components(req)

    # master feature pool
    feature_pool = {
        # lag & rolling (used by model)
        "lag_1": req.last_price,
        "lag_2": req.last_price,
        "lag_4": req.last_price,
        "roll_4": req.last_price,
        "roll_8": req.last_price,

        # time
        "weekofyear": ((req.week + step - 1) % 52) + 1,

        # demand
        "demand_index": req.demand_index,
        "demand_Festival": demand_festival,
        "demand_fuel": demand_fuel,
        "demand_season": demand_season,

        # macro / weather
        "Fuel_price_Rs_per_L": req.fuel_price,
        "Import_tax_Rs_per_kg": req.import_tax,
        "Rainfall_mm": req.rainfall,
        "Temp_C": req.temperature,
    }

    # 🔥 return ONLY features model was trained on
    return {k: feature_pool.get(k, 0.0) for k in FEATURE_COLS}


# =====================================================
# RF FORECAST FUNCTION (ROLLING)
# =====================================================
def forecast_weeks_rf(req: PriceForecastRequest):
    results = []

    for i in range(req.weeks_ahead):
        features = build_features(req, i + 1)

        # keep feature names to avoid sklearn warning
        X = pd.DataFrame([features], columns=FEATURE_COLS)
        X_scaled = pd.DataFrame(
            scaler_X.transform(X),
            columns=FEATURE_COLS
        )

        pred_scaled = rf_model.predict(X_scaled)
        pred_price = scaler_y.inverse_transform(
            pred_scaled.reshape(-1, 1)
        )[0][0]

        pred_price = round(float(pred_price), 2)

        results.append({
            "week": i + 1,
            "rf_price": pred_price
        })

        # rolling update
        req.last_price = pred_price

    return results


# =====================================================
# API ROUTE
# =====================================================
@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    print("🔥 RF BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        weeks = forecast_weeks_rf(req)
        return PriceForecastResponse(success=True, weeks=weeks)

    except Exception as e:
        print("❌ RF Forecast API Error:", e)
        raise HTTPException(status_code=500, detail="RF forecast failed")
