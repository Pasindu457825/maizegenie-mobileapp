from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
import os
import joblib
import numpy as np
import pandas as pd

# Supabase client for fetching real historical prices
from src.database.supabase_client import supabase

# District-level weekly weather
from src.priceforecast.district_weather_service import fetch_district_weekly_weather

# Model metrics calculator for data-driven confidence
from src.priceforecast.model_metrics import get_confidence_with_metrics, metrics_calc

# ===============================
# SUPPRESS SKLEARN WARNINGS
# ===============================
import warnings
warnings.filterwarnings(
    "ignore",
    message="X has feature names, but.*was fitted without feature names"
)
warnings.filterwarnings(
    "ignore",
    category=UserWarning,
    message=".*Trying to unpickle estimator.*from version.*when using version.*"
)

router = APIRouter(prefix="/api/price-forecast", tags=["Price Forecast"])

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_YEAR = 2020  # MUST match retraining

# =====================================================
# LOAD GB (TUNED) MODEL - NEW VERSION
# =====================================================
try:
    gb_model = joblib.load(os.path.join(BASE_DIR, "GB_tuned_delta_model.pkl"))
    FEATURE_COLS = list(gb_model.feature_names_in_)
    print("✅ GB (TUNED) DELTA model loaded")
    print(f"📌 Model Type: {type(gb_model).__name__}")
    print(f"📌 Expected features: {len(FEATURE_COLS)}")
except Exception as e:
    print("❌ Model load failed:", e)
    raise RuntimeError("Model loading failed")


# =====================================================
# HISTORICAL PRICE FETCHER (Extended for 12-week lags)
# =====================================================
def fetch_price_history(district: str, year: int, week: int, min_weeks: int = 3, pad_to: int = 12) -> list[float]:
    """
    Fetch weekly prices for a district from Supabase.
    
    Now fetches 12 weeks (for lag_12) instead of 8.
    
    Parameters:
      district: District name
      year, week: Reference point (fetch prices up to this week)
      min_weeks: Minimum acceptable history (default 3)
      pad_to: Pad to this length if fewer rows (default 12)

    Returns a list ordered oldest → newest (length >= min_weeks, padded to pad_to if needed).
    """
    try:
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
                f"need at least {min_weeks} weeks, found {len(rows)}."
            )

        rows_asc = list(reversed(rows))
        prices = [float(row["price"]) for row in rows_asc]
        
        if len(prices) < pad_to:
            recent_price = prices[-1]
            prices.extend([recent_price] * (pad_to - len(prices)))
            print(f"  ⚠️  Padded history for '{district}': {len(rows)} → {pad_to}")
        
        return prices

    except ValueError:
        raise
    except Exception as e:
        raise RuntimeError(f"Supabase price history fetch failed: {e}") from e


# =====================================================
# TECHNICAL INDICATOR COMPUTATION (48 FEATURES)
# =====================================================
def compute_technical_indicators(
    price_history: list[float],
    demand_index: float,
    rainfall: float,
    temperature: float,
    fuel_price: float
) -> dict:
    """
    Compute 30+ technical indicators from price history and market data.
    
    Inputs:
      price_history: list of 12 prices (oldest → newest)
      demand_index, rainfall, temperature, fuel_price: market data
    
    Returns:
      dict with all computed features
    """
    indicators = {}
    
    # ====== LAG FEATURES (5) ======
    indicators['lag_1'] = float(price_history[-1])
    indicators['lag_2'] = float(price_history[-2])
    indicators['lag_4'] = float(price_history[-4])
    indicators['lag_8'] = float(price_history[-8])
    indicators['lag_12'] = float(price_history[-12])
    
    # ====== ROLLING MEAN (4) ======
    indicators['roll_mean_4'] = float(np.mean(price_history[-4:]))
    indicators['roll_mean_8'] = float(np.mean(price_history[-8:]))
    indicators['roll_mean_12'] = float(np.mean(price_history[-12:]))
    indicators['roll_mean_26'] = float(np.mean(price_history[-12:]))  # Use 12 as proxy (max available)
    
    # ====== ROLLING STD (4) ======
    indicators['roll_std_4'] = float(np.std(price_history[-4:]))
    indicators['roll_std_8'] = float(np.std(price_history[-8:]))
    indicators['roll_std_12'] = float(np.std(price_history[-12:]))
    indicators['roll_std_26'] = float(np.std(price_history[-12:]))  # Use 12 as proxy
    
    # ====== MOMENTUM (2) ======
    # Price change percentage
    indicators['price_momentum_4w'] = float((price_history[-1] - price_history[-5]) / price_history[-5] * 100 if price_history[-5] != 0 else 0)
    indicators['price_momentum_12w'] = float((price_history[-1] - price_history[-12]) / price_history[-12] * 100 if price_history[-12] != 0 else 0)
    
    # ====== VOLATILITY (1) ======
    indicators['price_volatility_4w'] = float(np.std(price_history[-4:]))
    
    # ====== EXPONENTIAL MOVING AVERAGE (3) ======
    ema_4 = float(np.mean(price_history[-4:]))  # Simplified (proper EMA requires decay)
    ema_8 = float(np.mean(price_history[-8:]))
    ema_12 = float(np.mean(price_history[-12:]))
    indicators['ema_4'] = ema_4
    indicators['ema_8'] = ema_8
    indicators['ema_12'] = ema_12
    
    # ====== PRICE-TO-MA RATIO (2) ======
    indicators['price_to_ma_ratio_4'] = float(price_history[-1] / indicators['roll_mean_4'] if indicators['roll_mean_4'] != 0 else 1.0)
    indicators['price_to_ma_ratio_12'] = float(price_history[-1] / indicators['roll_mean_12'] if indicators['roll_mean_12'] != 0 else 1.0)
    
    # ====== DEMAND DERIVATIVES (7) ======
    # These are derived from demand_index (decomposed features)
    # In production, these would come from full demand model
    indicators['demand_Festival'] = float(demand_index * 0.3)  # 30% seasonal
    indicators['demand_tax'] = float(demand_index * 0.1)       # 10% tax impact
    indicators['demand_season'] = float(demand_index * 0.2)    # 20% seasonal
    indicators['demand_fuel'] = float(demand_index * 0.15)     # 15% fuel related
    indicators['demand_Temp'] = float(demand_index * 0.15)     # 15% temperature
    indicators['demand_rainfall'] = float(demand_index * 0.1)  # 10% rainfall
    indicators['fuel_demand_combined_lag0'] = float(fuel_price * demand_index / 1000)  # Combined term
    
    # ====== DEMAND LAGS (4) ======
    indicators['demand_lag_1'] = float(demand_index)
    indicators['demand_lag_4'] = float(demand_index * 0.95)    # Decay over 4 weeks
    indicators['demand_ma_4'] = float(demand_index)
    indicators['demand_zscore'] = float((demand_index - 75) / 20)  # Normalize around mean 75
    
    # ====== WEATHER INTERACTIONS (3) ======
    indicators['rainfall_temp_interaction'] = float(rainfall * temperature / 1000)
    indicators['rainfall_ma_4'] = float(rainfall)
    indicators['temp_ma_4'] = float(temperature)
    
    return indicators


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
# NORMALIZATION
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
# CONFIDENCE HELPERS
# =====================================================
def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))

def delta_confidence(delta_std: float, weeks_ahead: int = 1) -> tuple[float, str]:
    """Convert GB delta std-dev into confidence percent and tag."""
    return get_confidence_with_metrics(delta_std, weeks_ahead=weeks_ahead)

def predict_delta_with_uncertainty(X: pd.DataFrame) -> tuple[float, float]:
    """
    Returns (delta_mean, delta_std) using individual trees outputs.
    Handles both RandomForest (1D estimators_) and GradientBoosting (2D estimators_).
    """
    try:
        estimators = gb_model.estimators_
        
        # GradientBoosting: estimators_ is 2D (n_estimators, n_classes)
        # Need to flatten or use [:,0] to get individual trees
        if isinstance(estimators, np.ndarray) and len(estimators.shape) == 2:
            # GradientBoosting case: flatten to 1D
            tree_list = estimators.flatten()
        else:
            # RandomForest case: already 1D
            tree_list = estimators
        
        # Collect predictions from each tree
        tree_preds = np.array([est.predict(X)[0] for est in tree_list], dtype=float)
        return float(tree_preds.mean()), float(tree_preds.std(ddof=0))
    
    except Exception as e:
        # Fallback: use direct model prediction
        print(f"⚠️  Tree extraction failed: {e}. Using direct prediction.")
        pred = float(gb_model.predict(X)[0])
        return pred, 0.08  # Conservative uncertainty


# =====================================================
# GB DELTA WALK-FORWARD FORECAST (48 FEATURES)
# =====================================================
def forecast_weeks_gb_delta(req: PriceForecastRequest, price_history: list[float]):
    """
    Walk-forward forecast using GB (Tuned) model with 48 engineered features.
    
    price_history must have 12+ entries, ordered oldest → newest.
    """
    results = []
    price_history = list(price_history[:12])  # Use last 12 weeks
    
    for i in range(req.weeks_ahead):
        week = ((req.week + i - 1) % 52) + 1
        year = req.year + ((req.week + i - 1) // 52)
        year_trend = year - BASE_YEAR
        
        # Compute all time-based features
        month = (week * 7 % 365) // 30  # Approximate month from week
        quarter = (month // 3) + 1
        day_of_year = (week - 1) * 7
        week_sin = float(np.sin(2 * np.pi * week / 52))
        week_cos = float(np.cos(2 * np.pi * week / 52))
        month_sin = float(np.sin(2 * np.pi * month / 12))
        month_cos = float(np.cos(2 * np.pi * month / 12))
        
        # Compute technical indicators from current price_history
        tech_ind = compute_technical_indicators(
            price_history=price_history,
            demand_index=req.demand_index,
            rainfall=req.rainfall,
            temperature=req.temperature,
            fuel_price=req.fuel_price
        )
        
        # BUILD FEATURE ROW (48 features total)
        row = {
            # Weather & Economic (4)
            "Rainfall_mm": req.rainfall,
            "Temp_C": req.temperature,
            "Fuel_price_Rs_per_L": req.fuel_price,
            "Import_tax_Rs_per_kg": req.import_tax,
            
            # Demand Features (11) - from decomposition + lags
            "demand_Festival": tech_ind["demand_Festival"],
            "demand_tax": tech_ind["demand_tax"],
            "demand_season": tech_ind["demand_season"],
            "demand_fuel": tech_ind["demand_fuel"],
            "demand_Temp": tech_ind["demand_Temp"],
            "demand_rainfall": tech_ind["demand_rainfall"],
            "demand_index": req.demand_index,
            "fuel_demand_combined_lag0": tech_ind["fuel_demand_combined_lag0"],
            "demand_lag_1": tech_ind["demand_lag_1"],
            "demand_lag_4": tech_ind["demand_lag_4"],
            "demand_ma_4": tech_ind["demand_ma_4"],
            "demand_zscore": tech_ind["demand_zscore"],
            
            # Time Features (10)
            "year_trend": float(year_trend),
            "month": float(month),
            "quarter": float(quarter),
            "day_of_year": float(day_of_year),
            "week_sin": week_sin,
            "week_cos": week_cos,
            "month_sin": month_sin,
            "month_cos": month_cos,
            
            # Lag Features (5)
            "lag_1": tech_ind["lag_1"],
            "lag_2": tech_ind["lag_2"],
            "lag_4": tech_ind["lag_4"],
            "lag_8": tech_ind["lag_8"],
            "lag_12": tech_ind["lag_12"],
            
            # Rolling Statistics (8)
            "roll_mean_4": tech_ind["roll_mean_4"],
            "roll_std_4": tech_ind["roll_std_4"],
            "roll_mean_8": tech_ind["roll_mean_8"],
            "roll_std_8": tech_ind["roll_std_8"],
            "roll_mean_12": tech_ind["roll_mean_12"],
            "roll_std_12": tech_ind["roll_std_12"],
            "roll_mean_26": tech_ind["roll_mean_26"],
            "roll_std_26": tech_ind["roll_std_26"],
            
            # Momentum & Volatility (3)
            "price_momentum_4w": tech_ind["price_momentum_4w"],
            "price_momentum_12w": tech_ind["price_momentum_12w"],
            "price_volatility_4w": tech_ind["price_volatility_4w"],
            
            # EMA (3)
            "ema_4": tech_ind["ema_4"],
            "ema_8": tech_ind["ema_8"],
            "ema_12": tech_ind["ema_12"],
            
            # Price Ratios (2)
            "price_to_ma_ratio_4": tech_ind["price_to_ma_ratio_4"],
            "price_to_ma_ratio_12": tech_ind["price_to_ma_ratio_12"],
            
            # Weather Interactions (3)
            "rainfall_temp_interaction": tech_ind["rainfall_temp_interaction"],
            "rainfall_ma_4": tech_ind["rainfall_ma_4"],
            "temp_ma_4": tech_ind["temp_ma_4"],
        }
        
        # Build X in correct feature order
        X = pd.DataFrame([row]).reindex(columns=FEATURE_COLS, fill_value=0)
        
        # Predict delta + uncertainty
        delta_mean, delta_std = predict_delta_with_uncertainty(X)
        conf_pct, conf_tag = delta_confidence(delta_std, weeks_ahead=i+1)
        
        next_price = round(float(price_history[-1] + delta_mean), 2)
        
        results.append({
            "week": i + 1,
            "rf_price": next_price,
            "confidence_pct": conf_pct,
            "confidence_tag": conf_tag,
        })
        
        price_history.append(next_price)
    
    return results


# =====================================================
# DEMAND INDEX ENDPOINT (for frontend)
# =====================================================
@router.get("/demand-index")
def get_demand_index(
    district: str = Query(...),
    year: int = Query(...),
    week: int = Query(...)
):
    """
    Fetch demand index for a district and week.
    Used by frontend to populate demand field in price forecast form.
    """
    try:
        # Query Supabase for demand data
        result = (
            supabase
            .from_("maize_prices")
            .select("demand_index")
            .eq("district", district)
            .eq("year", year)
            .eq("week", week)
            .single()
            .execute()
        )
        
        if not result.data:
            # Return default/average demand if not found
            print(f"⚠️  No demand data for {district} {year} W{week}, returning average")
            return {
                "success": True,
                "district": district,
                "year": year,
                "week": week,
                "demand_index": 75.0,  # Default average
                "note": "Using default demand value",
                "source": "default"
            }
        
        return {
            "success": True,
            "district": district,
            "year": year,
            "week": week,
            "demand_index": float(result.data.get("demand_index", 75.0)),
            "source": "database"
        }
    except Exception as e:
        print(f"⚠️  Demand fetch error: {e}, returning default")
        # Return default on error instead of failing
        return {
            "success": True,
            "district": district,
            "year": year,
            "week": week,
            "demand_index": 75.0,
            "note": "Using fallback demand value",
            "source": "default"
        }


# =====================================================
# DISTRICT WEATHER ENDPOINT (for frontend)
# =====================================================
@router.get("/district-weather")
def get_district_weather(
    district: str = Query(...),
    year: int = Query(...),
    week: int = Query(...)
):
    """
    Fetch weekly-average temperature & rainfall for a district.
    Used by frontend to populate weather fields in price forecast form.
    """
    try:
        weather = fetch_district_weekly_weather(district, year, week)
        if not weather:
            return {
                "success": False,
                "message": f"No weather data available for {district}"
            }
        
        return {
            "success": True,
            "district": district,
            "avg_temperature": weather.get("avg_temperature", 0),
            "avg_rainfall": weather.get("avg_rainfall", 0),
            "week_start": weather.get("week_start", ""),
            "week_end": weather.get("week_end", ""),
            "source": weather.get("source", "unknown")
        }
    except Exception as e:
        print(f"❌ Weather fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# =====================================================
# MAIN FORECAST ENDPOINT
# =====================================================
@router.post("/predict")
def predict_price_forecast(req: PriceForecastRequest):
    """
    Predict maize prices for 1-4 weeks ahead using GB (Tuned) model.
    """
    try:
        req = normalize_if_needed(req)
        
        # ===== LOG 1: RECEIVED PAYLOAD =====
        payload_dict = {
            "year": req.year,
            "week": req.week,
            "district": req.district,
            "season": req.season,
            "fuel_price": req.fuel_price,
            "rainfall": req.rainfall,
            "temperature": req.temperature,
            "demand_index": req.demand_index,
            "import_tax": req.import_tax,
            "last_price": req.last_price,
            "weeks_ahead": req.weeks_ahead
        }
        print(f"\n🔥 GB (TUNED) BACKEND RECEIVED PAYLOAD: {payload_dict}")
        
        # Fetch 12-week price history
        price_history = fetch_price_history(req.district, req.year, req.week, pad_to=12)
        
        # ===== LOG 2: PRICE HISTORY =====
        print(f"  History (lag12): {price_history}")
        
        # Forecast using GB model
        results = forecast_weeks_gb_delta(req, price_history)
        
        # ===== LOG 3: FORECAST OUTPUT =====
        print("\n" + "="*80)
        print("📤  FORECAST OUTPUT")
        print("="*80)
        print(f"  Week   Predicted (Rs/kg)      Δ vs last        Confidence")
        print(f"  ────   ──────────────────     ────────────     ────────────")
        
        last_price = req.last_price
        for r in results:
            delta = r["rf_price"] - last_price
            delta_str = f"{delta:+.2f}"
            conf_str = f"{r['confidence_pct']:.1f}%  ({r['confidence_tag']})"
            print(f"  {r['week']}      Rs {r['rf_price']:<13.2f}      {delta_str:<14}  {conf_str}")
            last_price = r["rf_price"]  # Update for next iteration
        
        print("="*80 + "\n")
        
        # Map to response format (keeps backward compatibility)
        weeks_response = []
        for r in results:
            weeks_response.append(
                WeekForecast(
                    week=r["week"],
                    rf_price=r["rf_price"],  # Field name unchanged for compatibility
                    confidence_pct=r["confidence_pct"],
                    confidence_tag=r["confidence_tag"]
                )
            )
        
        return PriceForecastResponse(success=True, weeks=weeks_response)
    
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        print(f"❌ Forecast error: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast failed: {str(e)}")


# =====================================================
# ALIAS ENDPOINT: /next-weeks → /predict
# (Frontend calls this, maps to same handler)
# =====================================================
@router.post("/next-weeks")
def forecast_next_weeks(req: PriceForecastRequest):
    """
    Alias for /predict endpoint (frontend compatibility).
    Predict maize prices for 1-4 weeks ahead using GB (Tuned) model.
    """
    return predict_price_forecast(req)


# =====================================================
# COMPUTE/UPDATE MODEL METRICS (Admin Endpoint)
# =====================================================
@router.post("/compute-metrics")
def compute_model_metrics():
    """
    Calculate and cache model validation metrics from Supabase data.
    """
    try:
        print("\n🔄 Admin triggered metric computation...")
        result = metrics_calc.compute_metrics_from_supabase(gb_model, FEATURE_COLS, BASE_YEAR)
        
        if result is None:
            raise HTTPException(
                status_code=422,
                detail="Insufficient data to compute metrics."
            )
        
        r2, mae, rmse = result
        
        return {
            "success": True,
            "message": "Model metrics computed successfully",
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
# CONFIDENCE DEBUG ENDPOINT
# =====================================================
@router.get("/confidence-debug")
def get_confidence_debug():
    """Debug endpoint for confidence calculations."""
    from src.priceforecast.model_metrics import CONFIDENCE_BOOST_CONFIG
    
    return {
        "success": True,
        "current_metrics": {
            "r2_score": metrics_calc.r2_score_val,
            "mae_rs_per_kg": metrics_calc.mae_val,
            "rmse_rs_per_kg": metrics_calc.rmse_val,
        },
        "confidence_boost_config": CONFIDENCE_BOOST_CONFIG,
    }


# =====================================================
# HEALTH CHECK
# =====================================================
@router.get("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model": type(gb_model).__name__,
        "features": len(FEATURE_COLS),
        "base_year": BASE_YEAR
    }
