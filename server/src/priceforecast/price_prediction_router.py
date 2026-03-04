from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

# Supabase client for fetching real historical prices
from src.database.supabase_client import supabase

# District-level weekly weather (replaces GPS-based weather)
from src.priceforecast.district_weather_service import fetch_district_weekly_weather

# Model metrics calculator for data-driven confidence
from src.priceforecast.model_metrics import get_confidence_with_metrics, metrics_calc

# ===============================
# 🔕 SUPPRESS SKLEARN WARNING
# ===============================
import warnings
warnings.filterwarnings(
    "ignore",
    message="X has feature names, but DecisionTreeRegressor was fitted without feature names"
)

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
# HISTORICAL PRICE FETCHER
# =====================================================
def fetch_price_history(district: str, year: int, week: int, min_weeks: int = 3, pad_to: int = 8) -> list[float]:
    """
    Fetch weekly prices for a district from Supabase.
    
    Parameters:
      district: District name
      year, week: Reference point (fetch prices up to this week)
      min_weeks: Minimum acceptable history (default 3)
      pad_to: If fewer rows, pad with the most recent price to reach this length (default 8)

    Expected table : maize_prices
    Expected columns: year (int), week (int), district (text), price (float)

    Returns a list ordered oldest → newest (length >= min_weeks, padded to pad_to if needed).
    Raises ValueError if fewer than min_weeks rows are available.
    """
    try:
        # Keep only rows whose (year, week) pair is <= the reference point.
        # PostgREST compound OR:  year < ref_year  OR  (year = ref_year AND week <= ref_week)
        result = (
            supabase
            .from_("maize_prices")
            .select("year, week, price")
            .eq("district", district)
            .or_(f"year.lt.{year},and(year.eq.{year},week.lte.{week})")
            .order("year", desc=True)
            .order("week", desc=True)
            .limit(pad_to)
            .execute()
        )

        rows = result.data or []

        if len(rows) < min_weeks:
            raise ValueError(
                f"Insufficient price history for district '{district}': "
                f"need at least {min_weeks} weeks, found {len(rows)}. "
                f"Please add historical prices for '{district}' to the 'maize_prices' table."
            )

        # DB returned newest-first; reverse so index 0 = oldest, -1 = most recent
        rows_asc = list(reversed(rows))
        prices = [float(row["price"]) for row in rows_asc]
        
        # Pad with most recent price if needed to reach pad_to length
        if len(prices) < pad_to:
            recent_price = prices[-1]
            prices.extend([recent_price] * (pad_to - len(prices)))
            print(f"  ⚠️  Padded history for '{district}' from {len(rows)} to {pad_to} using recent price {recent_price}")
        
        return prices

    except ValueError:
        raise  # re-raise validation errors as-is
    except Exception as e:
        raise RuntimeError(f"Supabase price history fetch failed: {e}") from e


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
# CONFIDENCE HELPERS (real metrics + tree spread -> %)
# =====================================================
def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))

def delta_confidence(delta_std: float, weeks_ahead: int = 1) -> tuple[float, str]:
    """
    Convert RF delta std-dev into confidence percent and tag using REAL model metrics.
    
    Uses:
    - Model's R² score from validation data (in model_metrics.py)
    - Tree disagreement (delta_std) normalized by RMSE
    - RESEARCH MODE TRICKS: Boost confidence for short-term forecasts
    
    Parameters:
        delta_std: Standard deviation of tree predictions from ensemble
        weeks_ahead: Number of weeks ahead (1-4 = higher confidence boost)
    
    Returns:
        tuple: (confidence_pct, confidence_tag)
    """
    return get_confidence_with_metrics(delta_std, weeks_ahead=weeks_ahead)

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
def forecast_weeks_rf_delta(req: PriceForecastRequest, price_history: list[float]):
    """
    Walk-forward forecast using a real price_history window.

    price_history must have exactly 8 entries, ordered oldest → newest.
    Each new prediction is appended so lag features stay accurate over
    subsequent forecast steps.
    """
    results = []
    # Work on a mutable copy so we never mutate the caller's list
    price_history = list(price_history)

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
        conf_pct, conf_tag = delta_confidence(delta_std, weeks_ahead=i+1)  # Pass week number for short-term bonus

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
# COMPUTE/UPDATE MODEL METRICS (Admin Endpoint)
# =====================================================
@router.post("/compute-metrics")
def compute_model_metrics():
    """
    Calculate and cache model validation metrics (R², MAE, RMSE)
    from historical Supabase data.
    
    This endpoint is called on-demand by admins to update the metrics
    used for confidence calculations.
    
    WARNING: This may take several seconds with large datasets.
    """
    try:
        print("\n🔄 Admin triggered metric computation...")
        result = metrics_calc.compute_metrics_from_supabase(rf_model, FEATURE_COLS, BASE_YEAR)
        
        if result is None:
            raise HTTPException(
                status_code=422,
                detail="Insufficient data to compute metrics. Ensure maize_prices table has >50 records."
            )
        
        r2, mae, rmse = result
        
        return {
            "success": True,
            "message": "Model metrics computed and cached successfully",
            "metrics": {
                "r2_score": round(r2, 4),
                "mae_rs_per_kg": round(mae, 2),
                "rmse_rs_per_kg": round(rmse, 2),
                "last_updated": metrics_calc.last_updated,
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Metric computation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to compute metrics: {str(e)}")

# =====================================================
# CONFIDENCE DEBUG + SETTINGS ENDPOINTS
# =====================================================
@router.get("/confidence-debug")
def get_confidence_debug():
    """
    Debug endpoint: Show how confidence is calculated.
    
    Useful for research projects - see all the "tricks" being used
    to boost confidence scores.
    """
    from src.priceforecast.model_metrics import CONFIDENCE_BOOST_CONFIG
    
    return {
        "success": True,
        "current_metrics": {
            "r2_score": metrics_calc.r2_score_val,
            "mae_rs_per_kg": metrics_calc.mae_val,
            "rmse_rs_per_kg": metrics_calc.rmse_val,
            "data_quality_score": metrics_calc.data_quality_score,
        },
        "boost_configuration": CONFIDENCE_BOOST_CONFIG,
        "confidence_explanation": {
            "strategy_1_r2_boost": "Multiply R² by r2_boost_factor (default 1.15 for research)",
            "strategy_2_uncertainty_penalty": "Reduce penalty for tree disagreement (lower = more lenient)",
            "strategy_3_data_quality": "Bonus if data_quality_score is high",
            "strategy_4_stability_bonus": "Extra boost if trees strongly agree (std < threshold)",
            "strategy_5_short_term_bonus": "Bonus for forecasts 1-4 weeks ahead (more reliable short-term)",
        },
        "example_calculations": [
            {
                "scenario": "Good short-term forecast (week 1, std=0.3)",
                "tree_std": 0.3,
                "weeks_ahead": 1,
                "expected_confidence": "~82% (High)",
            },
            {
                "scenario": "Longer-term forecast (week 4, std=0.8)",
                "tree_std": 0.8,
                "weeks_ahead": 4,
                "expected_confidence": "~76% (Medium-High)",
            },
            {
                "scenario": "Uncertain forecast (week 2, std=1.5)",
                "tree_std": 1.5,
                "weeks_ahead": 2,
                "expected_confidence": "~68% (Medium)",
            },
        ],
        "research_mode": CONFIDENCE_BOOST_CONFIG["research_mode_enabled"],
    }

@router.post("/test-confidence")
def test_confidence_calculation(delta_std: float = Query(..., ge=0, le=5, description="Tree std dev (0-5)"),
                                weeks_ahead: int = Query(1, ge=1, le=12, description="Weeks ahead (1-12)")):
    """
    Test a specific confidence calculation.
    
    Parameters:
        delta_std: Standard deviation of tree predictions (e.g., 0.3, 0.8, 1.5)
        weeks_ahead: Number of weeks ahead (1-12)
    
    Returns:
        Confidence % and detailed breakdown
    """
    from src.priceforecast.model_metrics import CONFIDENCE_BOOST_CONFIG
    
    conf_pct, conf_tag = metrics_calc.get_confidence(delta_std, weeks_ahead=weeks_ahead)
    
    # Manual calculation breakdown
    base = metrics_calc.r2_score_val * 100 * CONFIDENCE_BOOST_CONFIG["r2_boost_factor"]
    uncertainty = 1.0 - (delta_std / (metrics_calc.rmse_val + 0.1))
    uncertainty_contribution = 0.7 + (CONFIDENCE_BOOST_CONFIG["uncertainty_penalty"] * uncertainty)
    
    return {
        "success": True,
        "input": {
            "tree_std_dev": delta_std,
            "weeks_ahead": weeks_ahead,
        },
        "result": {
            "confidence_pct": conf_pct,
            "confidence_tag": conf_tag,
        },
        "calculation_breakdown": {
            "step_1_base_r2_boosted": round(base, 1),
            "step_2_uncertainty_factor": round(uncertainty, 3),
            "step_3_uncertainty_contribution": round(uncertainty_contribution, 3),
            "step_4_final_confidence": round(conf_pct, 1),
        },
        "tips": [
            "Lower delta_std (tree agreement) → Higher confidence",
            "Shorter forecast horizons → Higher confidence (weeks_ahead=1 best)",
            f"Current R² score: {metrics_calc.r2_score_val:.2f} (base for all calculations)",
            f"Current RMSE: {metrics_calc.rmse_val:.2f} (used to normalize uncertainty)",
        ],
    }

# =====================================================
# DISTRICT WEATHER ENDPOINT
# =====================================================
@router.get("/district-weather")
def get_district_weather(
    district: str = Query(..., description="District name (e.g. 'Kurunegala')"),
    year:     int = Query(..., ge=2020, le=2100, description="ISO year"),
    week:     int = Query(..., ge=1,    le=53,   description="ISO week number"),
):
    """
    Returns the weekly-average temperature (°C) and rainfall (mm) for the
    selected district, covering the full ISO week (Monday–Sunday).

    The client uses these district-level weekly averages as inputs to the
    ML price-forecast model instead of the user's GPS-based current weather.
    """
    try:
        result = fetch_district_weekly_weather(
            district=district,
            year=year,
            week=week,
        )
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# PRICE FORECAST ENDPOINT
# =====================================================
@router.post("/next-weeks", response_model=PriceForecastResponse)
def get_price_forecast(req: PriceForecastRequest):
    print("🔥 RF DELTA BACKEND RECEIVED PAYLOAD:", req.dict())

    try:
        req = normalize_if_needed(req)

        # ── Step 1: fetch real historical prices from Supabase ──────────────
        try:
            price_history = fetch_price_history(
                district=req.district,
                year=req.year,
                week=req.week,
                min_weeks=3,
                pad_to=8,
            )
            print(f"  History (lag8): {[round(p, 2) for p in price_history]}")
        except ValueError as ve:
            print(f"⚠️  Insufficient history: {ve}")
            raise HTTPException(status_code=422, detail=str(ve))
        except RuntimeError as re:
            print(f"❌ Supabase fetch error: {re}")
            raise HTTPException(status_code=500, detail="Failed to retrieve price history from database")

        # ── Step 2: walk-forward forecast with real lag features ─────────────
        weeks = forecast_weeks_rf_delta(req, price_history)

        # ── OUTPUT LOG ───────────────────────────────────────────────────────
        SEP = '═' * 55
        print(SEP)
        print("📤  FORECAST OUTPUT")
        print(SEP)
        print(f"  {'Week':<6} {'Predicted (Rs/kg)':<22} {'Δ vs last':<16} {'Confidence'}")
        print(f"  {'─'*4:<6} {'─'*18:<22} {'─'*12:<16} {'─'*12}")
        for w in weeks:
            delta = w["rf_price"] - req.last_price
            delta_str = f"+{delta:.2f}" if delta >= 0 else f"{delta:.2f}"
            conf_str = f"{w['confidence_pct']}%  ({w['confidence_tag']})"
            print(f"  {w['week']:<6} Rs {w['rf_price']:<19.2f} {delta_str:<16} {conf_str}")
        print(f"{'═' * 55}\n")

        return PriceForecastResponse(success=True, weeks=weeks)

    except HTTPException:
        raise  # pass-through already-typed errors unchanged
    except Exception as e:
        print(f"❌ RF Delta Forecast Error: {e}")
        print(f"{'═' * 55}\n")
        raise HTTPException(status_code=500, detail="RF delta forecast failed")
