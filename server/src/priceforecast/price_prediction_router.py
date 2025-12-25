from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_YEAR = 2020  # MUST match retraining

# =====================================================
# LOAD DELTA MODEL
# =====================================================
try:
    rf_model = joblib.load(os.path.join(BASE_DIR, "rf_price_delta_model.pkl"))
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
    confidence_pct: float
    confidence_tag: str  # "High" | "Medium"

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
# CONFIDENCE HELPERS (tree spread -> %)
# =====================================================
def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))

def delta_confidence(delta_std: float) -> tuple[float, str]:
    """
    Convert RF delta std-dev into confidence percent and tag.
    Tune thresholds based on your dataset volatility.
    """

    # If std <= 0.6 => very stable => ~95%
    # If std >= 2.5 => uncertain => ~55%
    best = 0.6
    worst = 2.5

    if delta_std <= best:
        pct = 95.0
    elif delta_std >= worst:
        pct = 55.0
    else:
        # linear map [best..worst] -> [95..55]
        t = (delta_std - best) / (worst - best)
        pct = 95.0 - (40.0 * t)

    pct = clamp(pct, 50.0, 98.0)
    tag = "High" if pct >= 75.0 else "Medium"
    return round(float(pct), 1), tag

def predict_delta_with_uncertainty(X: pd.DataFrame) -> tuple[float, float]:
    """
    Returns (delta_mean, delta_std) using individual trees outputs.
    """
    # Collect per-tree predictions
    tree_preds = np.array([est.predict(X)[0] for est in rf_model.estimators_], dtype=float)
    return float(tree_preds.mean()), float(tree_preds.std(ddof=0))

# =====================================================
# RF DELTA WALK-FORWARD FORECAST (with confidence)
# =====================================================
def forecast_weeks_rf_delta(req: PriceForecastRequest):
    results = []
    price_history = [req.last_price] * 8

    for i in range(req.weeks_ahead):
        week = ((req.week + i - 1) % 52) + 1
        year = req.year + ((req.week + i - 1) // 52)
        year_trend = year - BASE_YEAR

        lag_1 = price_history[-1]
        lag_2 = price_history[-2]
        lag_4 = price_history[-4]
        roll_4 = float(np.mean(price_history[-4:]))
        roll_8 = float(np.mean(price_history[-8:]))

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

        # district one-hot (safe)
        for col in FEATURE_COLS:
            if col.startswith("dist_"):
                row[col] = 1 if col == f"dist_{req.district}" else 0

        # build X in correct order
        X = pd.DataFrame([row]).reindex(columns=FEATURE_COLS, fill_value=0)

        # predict delta + uncertainty
        delta_mean, delta_std = predict_delta_with_uncertainty(X)
        conf_pct, conf_tag = delta_confidence(delta_std)

        next_price = round(float(lag_1 + delta_mean), 2)

        results.append({
            "week": i + 1,
            "rf_price": next_price,
            "confidence_pct": conf_pct,
            "confidence_tag": conf_tag,
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
