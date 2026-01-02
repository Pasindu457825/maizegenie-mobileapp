"""
ML-Based Yield Prediction Service
Uses trained XGBoost model for maize yield prediction
Based on Maize_Yield_Pridiction_Model.ipynb
"""

import os
import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import logging

# Disable sklearn's fitted check for XGBoost compatibility
os.environ['SKLEARN_ALLOW_DEPRECATED_SKLEARN_PACKAGE_INSTALL'] = 'True'

logger = logging.getLogger(__name__)

# Monkey-patch XGBoost to fix sklearn 1.6.x compatibility
try:
    import xgboost
    from sklearn.base import BaseEstimator
    
    # Add missing __sklearn_tags__ method to XGBoost classes
    if not hasattr(xgboost.XGBRegressor, '__sklearn_tags__'):
        def _sklearn_tags(self):
            tags = BaseEstimator.__sklearn_tags__(self)
            return tags
        
        xgboost.XGBRegressor.__sklearn_tags__ = _sklearn_tags
        xgboost.XGBClassifier.__sklearn_tags__ = _sklearn_tags
        logger.info("Applied XGBoost compatibility patch for sklearn 1.6.x")
except Exception as e:
    logger.warning(f"Could not apply XGBoost compatibility patch: {e}")

# Model path - located in the same directory as this file
MODEL_PATH = Path(__file__).parent / "best_yield_model_xgb.pkl"

# Global model instance
_MODEL = None
_PREPROCESSOR = None
MODEL_LOADED = False


def load_model():
    """Load the trained XGBoost model"""
    global _MODEL, MODEL_LOADED
    
    try:
        if MODEL_PATH.exists():
            _MODEL = joblib.load(MODEL_PATH)
            MODEL_LOADED = True
            # Use print for immediate visibility in server logs
            print(f"✅ XGBoost Yield Prediction model loaded successfully!")
            logger.info(f"✅ XGBoost model loaded successfully from {MODEL_PATH}")
            return True
        else:
            print(f"⚠️ Yield Prediction model file not found at {MODEL_PATH}")
            logger.warning(f"⚠️ Model file not found at {MODEL_PATH}")
            return False
    except Exception as e:
        print(f"❌ Failed to load Yield Prediction model: {e}")
        logger.error(f"❌ Failed to load model: {e}")
        MODEL_LOADED = False
        return False


# Try to load model on import
load_model()


# ============================================================
# FEATURE ENGINEERING (Based on notebook)
# ============================================================

def prepare_features(data: Dict) -> pd.DataFrame:
    """
    Prepare features for ML model prediction (FARMER endpoint)
    Based on the training notebook feature engineering
    
    Handles simplified farmer input with smart defaults for missing fields.
    
    Required fields from farmer:
    - district, season, planting_date, variety
    - soil_condition, irrigation_type, rainfall_condition
    
    Optional fields (will use smart defaults):
    - location, soil_type, soil_ph, NPK values, weather data, land_size
    """
    
    # Parse planting date
    planting_date = datetime.fromisoformat(data["planting_date"].split('T')[0])
    
    # Calculate derived features
    planting_month = planting_date.month
    planting_year = planting_date.year
    planting_dayofyear = planting_date.timetuple().tm_yday
    
    # Estimate fertilizer timing (based on typical practices)
    days_to_first_fert = 18  # Average: 14-21 days after planting
    days_between_ferts = 25  # Average: 21-30 days between applications
    
    # Smart defaults for NPK based on soil condition
    # Using training data statistics for more accurate defaults
    soil_condition = data.get("soil_condition", "Medium")
    
    # Training data statistics (mean values by soil condition):
    # Good: N=85, P=20, K=195
    # Medium: N=75, P=16, K=170  
    # Poor: N=65, P=12, K=145
    # These are more realistic than the previous hardcoded values
    
    if soil_condition == "Good":
        default_n, default_p, default_k = 85.0, 20.0, 195.0
    elif soil_condition == "Poor":
        default_n, default_p, default_k = 65.0, 12.0, 145.0
    else:  # Medium
        default_n, default_p, default_k = 75.0, 16.0, 170.0
    
    # Get NPK values (use smart defaults if not provided)
    soil_n = float(data.get("soil_nitrogen_n", default_n))
    soil_p = float(data.get("soil_phosphorus_p", default_p))
    soil_k = float(data.get("soil_potassium_k", default_k))
    
    # Get soil fertility index from data if provided, otherwise calculate it
    if "soil_fertility_index" in data and data["soil_fertility_index"] is not None:
        soil_fertility_index = float(data["soil_fertility_index"])
        logger.info(f"✅ Using provided soil_fertility_index: {soil_fertility_index:.4f}")
        print(f"✅ Using provided soil_fertility_index: {soil_fertility_index:.4f}")
    else:
        # Calculate fertility index if not provided
        n_norm = min(soil_n / 125.0, 1.0)  # Max from training data
        p_norm = min(soil_p / 31.0, 1.0)
        k_norm = min(soil_k / 305.0, 1.0)
        soil_fertility_index = (n_norm + p_norm + k_norm) / 3.0
        logger.info(f"🔄 Calculated soil_fertility_index: {soil_fertility_index:.4f}")
        print(f"🔄 Calculated soil_fertility_index: {soil_fertility_index:.4f}")
    
    # Classify NPK status
    n_status_class = "High" if soil_n > 90 else "Medium" if soil_n > 50 else "Low"
    p_status_class = "High" if soil_p > 20 else "Medium" if soil_p > 10 else "Low"
    k_status_class = "High" if soil_k > 200 else "Medium" if soil_k > 100 else "Low"
    
    # Smart defaults for weather based on district and season
    district = data.get("district", "Anuradhapura")
    season = data.get("season", "Maha")
    
    # District-based weather defaults
    district_weather = {
        "Anuradhapura": {"temp": 28.5, "humidity": 72, "rainfall_30d": 320, "seasonal": 850},
        "Monaragala": {"temp": 27.0, "humidity": 75, "rainfall_30d": 280, "seasonal": 800},
        "Badulla": {"temp": 26.5, "humidity": 78, "rainfall_30d": 350, "seasonal": 900},
        "Ampara": {"temp": 28.0, "humidity": 74, "rainfall_30d": 300, "seasonal": 820},
        "Matale": {"temp": 27.5, "humidity": 76, "rainfall_30d": 290, "seasonal": 810},
    }
    weather_defaults = district_weather.get(district, district_weather["Anuradhapura"])
    
    # Season adjustment for rainfall
    if season in ["Maha", "Maha Season"]:
        rainfall_multiplier = 1.2  # More rain in Maha
    else:
        rainfall_multiplier = 0.8  # Less rain in Yala
    
    # Convert land size to hectares if provided in acres
    land_size_value = data.get("land_size_value", 1.0)
    land_size_acres = data.get("land_size_acres", land_size_value)
    field_size_ha = land_size_acres / 2.47105  # Convert acres to hectares
    
    # Build feature dictionary matching training data
    features = {
        # Categorical features
        "district": district,
        "location": data.get("location", "Unknown"),
        "season": season,
        "seed_variety": data.get("variety", "Local Variety"),
        "soil_type": data.get("soil_type", "RBE"),  # Default: Red-Brown Earth
        "soil_condition": soil_condition,
        "irrigation_type": data.get("irrigation_type", "Mixed"),
        "rainfall_condition": data.get("rainfall_condition", "Normal"),
        "n_status_class": n_status_class,
        "p_status_class": p_status_class,
        "k_status_class": k_status_class,
        
        # Numeric features
        "planting_month": planting_month,
        "field_size_ha": float(field_size_ha),
        "rainfall_30d_mm": float(data.get("rainfall_30d_mm", weather_defaults["rainfall_30d"] * rainfall_multiplier)),
        "seasonal_rainfall_mm": float(data.get("seasonal_rainfall_mm", weather_defaults["seasonal"] * rainfall_multiplier)),
        "avg_temperature_c": float(data.get("avg_temperature_c", weather_defaults["temp"])),
        "max_temperature_c": float(data.get("max_temperature_c", weather_defaults["temp"] + 4.0)),
        "avg_humidity_pct": float(data.get("avg_humidity_pct", weather_defaults["humidity"])),
        "sunshine_hours": float(data.get("sunshine_hours", 7.5)),
        "soil_ph": float(data.get("soil_ph", 6.25)),  # Optimal pH for maize
        "soil_nitrogen_n": soil_n,
        "soil_phosphorus_p": soil_p,
        "soil_potassium_k": soil_k,
        "soil_fertility_index": soil_fertility_index,
        "planting_year": planting_year,
        "planting_month_from_date": planting_month,
        "planting_dayofyear": planting_dayofyear,
        "days_to_first_fert": days_to_first_fert,
        "days_between_ferts": days_between_ferts,
    }
    
    logger.info(f"Farmer features prepared: variety={features['seed_variety']}, "
                f"soil_cond={soil_condition}, irrigation={features['irrigation_type']}, "
                f"N={soil_n:.1f}, fertility_idx={soil_fertility_index:.2f}")
    
    # Create DataFrame with single row
    df = pd.DataFrame([features])
    
    return df


def prepare_features_officer(data: Dict) -> pd.DataFrame:
    """
    Prepare features for ML model prediction (OFFICER endpoint)
    Officer data has nested structure: soil_profile, climate_data, crop_information
    
    Args:
        data: Nested dictionary with officer endpoint structure
    
    Returns:
        DataFrame with features matching training data format
    """
    
    # Extract from nested structure
    soil = data.get("soil_profile", {})
    climate = data.get("climate_data", {})
    crop = data.get("crop_information", {})
    
    # Parse planting date
    planting_date_str = crop.get("planting_date", data.get("planting_date", ""))
    planting_date = datetime.fromisoformat(planting_date_str.split('T')[0])
    
    # Calculate derived features
    planting_month = planting_date.month
    planting_year = planting_date.year
    planting_dayofyear = planting_date.timetuple().tm_yday
    
    # Get fertilizer timing from data if available
    fert_dates = data.get("fertilizer_dates", {})
    first_fert = fert_dates.get("first_fert_date")
    second_fert = fert_dates.get("second_fert_date")
    
    if first_fert:
        try:
            first_fert_dt = datetime.fromisoformat(first_fert.split('T')[0])
            days_to_first_fert = (first_fert_dt - planting_date).days
        except:
            days_to_first_fert = 18
    else:
        days_to_first_fert = 18
    
    if second_fert and first_fert:
        try:
            second_fert_dt = datetime.fromisoformat(second_fert.split('T')[0])
            first_fert_dt = datetime.fromisoformat(first_fert.split('T')[0])
            days_between_ferts = (second_fert_dt - first_fert_dt).days
        except:
            days_between_ferts = 25
    else:
        days_between_ferts = 25
    
    # Get NPK values and calculate fertility index
    soil_n = float(soil.get("soil_nitrogen_n", 70.0))
    soil_p = float(soil.get("soil_phosphorus_p", 15.0))
    soil_k = float(soil.get("soil_potassium_k", 160.0))
    
    # Normalize and calculate fertility index (same as training)
    n_norm = min(soil_n / 125.0, 1.0)
    p_norm = min(soil_p / 31.0, 1.0)
    k_norm = min(soil_k / 305.0, 1.0)
    soil_fertility_index = (n_norm + p_norm + k_norm) / 3.0
    
    # Build feature dictionary matching training data exactly
    features = {
        # Categorical features
        "district": soil.get("district", "Anuradhapura"),
        "location": soil.get("location", "Unknown"),
        "season": crop.get("season", "Maha"),
        "seed_variety": crop.get("seed_variety", "Local Variety"),
        "soil_type": soil.get("soil_type", "RBE"),
        "soil_condition": soil.get("soil_condition", "Medium"),
        "irrigation_type": climate.get("irrigation_type", "Mixed"),
        "rainfall_condition": climate.get("rainfall_condition", "Normal"),
        "n_status_class": soil.get("n_status_class", "Medium"),
        "p_status_class": soil.get("p_status_class", "Medium"),
        "k_status_class": soil.get("k_status_class", "Medium"),
        
        # Numeric features
        "planting_month": crop.get("planting_month", planting_month),
        "field_size_ha": float(crop.get("field_size_ha", 1.0)),
        "rainfall_30d_mm": float(climate.get("rainfall_30d_mm", 300.0)),
        "seasonal_rainfall_mm": float(climate.get("seasonal_rainfall_mm", 830.0)),
        "avg_temperature_c": float(climate.get("avg_temperature_c", 27.5)),
        "max_temperature_c": float(climate.get("max_temperature_c", 31.7)),
        "avg_humidity_pct": float(climate.get("avg_humidity_pct", 73.0)),
        "sunshine_hours": float(climate.get("sunshine_hours", 7.5)),
        "soil_ph": float(soil.get("soil_ph", 6.25)),
        "soil_nitrogen_n": soil_n,
        "soil_phosphorus_p": soil_p,
        "soil_potassium_k": soil_k,
        "soil_fertility_index": soil_fertility_index,
        "planting_year": planting_year,
        "planting_month_from_date": planting_month,
        "planting_dayofyear": planting_dayofyear,
        "days_to_first_fert": days_to_first_fert,
        "days_between_ferts": days_between_ferts,
    }
    
    # Create DataFrame with single row
    df = pd.DataFrame([features])
    
    logger.info(f"Officer features prepared: variety={features['seed_variety']}, "
                f"N={soil_n:.1f}, soil_cond={features['soil_condition']}, "
                f"irrigation={features['irrigation_type']}")
    
    return df


# ============================================================
# PREDICTION
# ============================================================

def predict_yield_ml(data: Dict) -> Tuple[float, float, List[Dict]]:
    """
    Predict yield using trained XGBoost model
    
    Returns:
        - predicted_yield_t_ha: float
        - confidence_score: float (0-1)
        - feature_importances: List[Dict] with top factors
    """
    
    if not MODEL_LOADED or _MODEL is None:
        raise RuntimeError("ML model not loaded. Please check model file.")
    
    try:
        # Prepare features
        X = prepare_features(data)
        
        # Make prediction
        # Model was trained on yield_t_ha, so prediction is in t/ha
        y_pred_raw = _MODEL.predict(X)[0]
        
        # Log raw prediction for debugging
        logger.info(f"Raw model prediction: {y_pred_raw:.4f} t/ha")
        
        # No calibration needed - model was trained correctly
        # Training data: yield_t_ha ranges from 0-6.85 t/ha (mean: 4.72 t/ha)
        # Apply realistic bounds for Sri Lankan maize
        # Min: 0.0 t/ha (complete crop failure)
        # Max: 7.0 t/ha (excellent hybrid varieties with optimal management)
        y_pred = max(0.0, min(y_pred_raw, 7.0))
        
        logger.info(f"Final prediction (after bounds): {y_pred:.4f} t/ha")
        
        # Calculate confidence based on model's feature importance
        # Higher confidence if key features are favorable
        confidence_score = calculate_confidence(data, X)
        
        # Get top impact factors
        impact_factors = get_top_impact_factors(data, X)
        
        return y_pred, confidence_score, impact_factors
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise


def calculate_confidence(data: Dict, X: pd.DataFrame) -> float:
    """
    Calculate prediction confidence based on input data quality
    """
    confidence = 0.75  # Base confidence for ML model
    
    # Boost confidence for GPS data
    if data.get("gps_lat") and data.get("gps_lng"):
        confidence += 0.05
    
    # Boost for complete soil data
    if all(k in data for k in ["soil_ph", "soil_nitrogen_n", "soil_phosphorus_p", "soil_potassium_k"]):
        confidence += 0.10
    
    # Boost for weather data
    if all(k in data for k in ["avg_temperature_c", "rainfall_30d_mm", "avg_humidity_pct"]):
        confidence += 0.05
    
    # Boost for known high-quality varieties
    if data.get("variety") in ["Jet 999", "Pacific 808", "Commando"]:
        confidence += 0.03
    
    return min(confidence, 0.98)  # Cap at 98%


def get_top_impact_factors(data: Dict, X: pd.DataFrame) -> List[Dict]:
    """
    Identify top factors impacting yield prediction
    Based on model's feature importance from training
    """
    
    factors = []
    
    # Top features from notebook analysis:
    # 1. n_status_class (20.3%)
    # 2. soil_condition (8.2%)
    # 3. soil_fertility_index (3.5%)
    # 4. soil_nitrogen_n (2.8%)
    # 5. irrigation_type (2.5%)
    
    # Nitrogen status
    n_status = X["n_status_class"].values[0]
    factors.append({
        "name": "Nitrogen Status",
        "impact": "positive" if n_status == "High" else "neutral" if n_status == "Medium" else "negative",
        "value": float(X["soil_nitrogen_n"].values[0]),
        "importance": 0.203
    })
    
    # Soil condition
    soil_cond = X["soil_condition"].values[0]
    factors.append({
        "name": "Soil Condition",
        "impact": "positive" if soil_cond == "Good" else "neutral" if soil_cond == "Medium" else "negative",
        "value": 1.0 if soil_cond == "Good" else 0.5 if soil_cond == "Medium" else 0.0,
        "importance": 0.082
    })
    
    # Soil fertility
    fertility = X["soil_fertility_index"].values[0]
    factors.append({
        "name": "Soil Fertility Index",
        "impact": "positive" if fertility > 0.65 else "neutral" if fertility > 0.50 else "negative",
        "value": float(fertility),
        "importance": 0.035
    })
    
    # Irrigation
    irrigation = X["irrigation_type"].values[0]
    factors.append({
        "name": "Irrigation Type",
        "impact": "positive" if irrigation == "Irrigated" else "neutral" if irrigation == "Mixed" else "negative",
        "value": 1.0 if irrigation == "Irrigated" else 0.5 if irrigation == "Mixed" else 0.0,
        "importance": 0.025
    })
    
    # Variety
    variety = X["seed_variety"].values[0]
    high_yield_varieties = ["Jet 999", "Pacific 808", "Commando", "GT 709"]
    factors.append({
        "name": "Seed Variety",
        "impact": "positive" if variety in high_yield_varieties else "neutral",
        "value": 1.0 if variety in high_yield_varieties else 0.5,
        "importance": 0.010
    })
    
    # Season
    season = X["season"].values[0]
    factors.append({
        "name": "Season",
        "impact": "positive" if season == "Maha" else "neutral",
        "value": 1.0 if season == "Maha" else 0.8,
        "importance": 0.015
    })
    
    return factors


# ============================================================
# HARVEST WINDOW CALCULATION
# ============================================================

def calculate_harvest_window(planting_date: str, variety: str) -> Dict:
    """
    Calculate expected harvest window based on variety maturity period
    """
    
    # Maturity periods (days) for different varieties
    VARIETY_MATURITY = {
        "Jet 999": (110, 120),
        "Pacific 808": (105, 115),
        "Commando": (115, 125),
        "GT 709": (100, 110),
        "GT200": (110, 120),
        "Local Variety": (110, 125),
    }
    
    min_days, max_days = VARIETY_MATURITY.get(variety, (110, 120))
    
    planting = datetime.fromisoformat(planting_date.split('T')[0])
    
    start_date = planting + timedelta(days=min_days)
    end_date = planting + timedelta(days=max_days)
    target_date = planting + timedelta(days=(min_days + max_days) // 2)
    
    return {
        "start": start_date.strftime("%Y-%m-%d"),
        "end": end_date.strftime("%Y-%m-%d"),
        "target": target_date.strftime("%Y-%m-%d"),
    }


# ============================================================
# MAIN SERVICE FUNCTION
# ============================================================

def get_ml_prediction(data: Dict) -> Dict:
    """
    Main ML prediction service for FARMER endpoint
    Returns prediction in format expected by frontend
    """
    
    try:
        # Get ML prediction
        yield_t_ha, confidence_score, impact_factors = predict_yield_ml(data)
        
        # Convert to kg/ha for frontend
        yield_kg_ha = yield_t_ha * 1000
        
        # Determine confidence level
        if confidence_score >= 0.85:
            confidence = "High"
        elif confidence_score >= 0.70:
            confidence = "Medium"
        else:
            confidence = "Low"
        
        # Calculate harvest window
        harvest_window = calculate_harvest_window(
            data["planting_date"],
            data.get("variety", "Local Variety")
        )
        
        # Build response - convert numpy types to Python native types for JSON serialization
        response = {
            "predicted_yield": float(round(yield_kg_ha, 2)),
            "predicted_yield_t_ha": float(round(yield_t_ha, 2)),
            "confidence": confidence,
            "confidence_score": float(round(confidence_score, 3)),
            "harvest_window": harvest_window,
            "calendar_event": {
                "title": "Maize Harvest Reminder",
                "date": harvest_window["target"],
            },
            "factors": impact_factors,
            "model_version": "XGBoost_v1.0",
            "prediction_method": "ml_model",
        }
        
        return response
        
    except Exception as e:
        logger.error(f"ML prediction failed: {e}")
        raise


def predict_yield_ml_officer(data: Dict) -> Tuple[float, float, List[Dict]]:
    """
    Predict yield using trained XGBoost model for OFFICER endpoint
    Uses prepare_features_officer for nested data structure
    
    Returns:
        - predicted_yield_t_ha: float
        - confidence_score: float (0-1)
        - feature_importances: List[Dict] with top factors
    """
    
    if not MODEL_LOADED or _MODEL is None:
        raise RuntimeError("ML model not loaded. Please check model file.")
    
    try:
        # Prepare features using officer-specific function
        X = prepare_features_officer(data)
        
        # Make prediction
        y_pred_raw = _MODEL.predict(X)[0]
        
        logger.info(f"Raw model prediction: {y_pred_raw:.4f} t/ha")
        
        # Apply realistic bounds (no calibration needed)
        y_pred = max(0.0, min(y_pred_raw, 7.0))
        
        logger.info(f"Final prediction (after bounds): {y_pred:.4f} t/ha")
        
        # Calculate confidence based on model's feature importance
        confidence_score = calculate_confidence_officer(data, X)
        
        # Get top impact factors
        impact_factors = get_top_impact_factors_officer(data, X)
        
        return y_pred, confidence_score, impact_factors
        
    except Exception as e:
        logger.error(f"Officer prediction error: {e}")
        raise


def calculate_confidence_officer(data: Dict, X: pd.DataFrame) -> float:
    """
    Calculate prediction confidence for officer endpoint
    """
    confidence = 0.80  # Base confidence for ML model with officer data
    
    # Boost for complete soil data
    soil = data.get("soil_profile", {})
    if all(k in soil for k in ["soil_ph", "soil_nitrogen_n", "soil_phosphorus_p", "soil_potassium_k"]):
        confidence += 0.10
    
    # Boost for weather data
    climate = data.get("climate_data", {})
    if all(k in climate for k in ["avg_temperature_c", "rainfall_30d_mm", "avg_humidity_pct"]):
        confidence += 0.05
    
    # Boost for known high-quality varieties
    crop = data.get("crop_information", {})
    if crop.get("seed_variety") in ["Jet 999", "Pacific 808", "Commando", "GT 709"]:
        confidence += 0.03
    
    return min(confidence, 0.98)


def get_top_impact_factors_officer(data: Dict, X: pd.DataFrame) -> List[Dict]:
    """
    Identify top factors impacting yield prediction for officer endpoint
    """
    
    factors = []
    
    # Nitrogen status (most important - 20.3%)
    n_status = X["n_status_class"].values[0]
    factors.append({
        "name": "Nitrogen Status",
        "impact": "positive" if n_status == "High" else "neutral" if n_status == "Medium" else "negative",
        "value": float(X["soil_nitrogen_n"].values[0]),
        "importance": 0.203
    })
    
    # Soil condition (8.2%)
    soil_cond = X["soil_condition"].values[0]
    factors.append({
        "name": "Soil Condition",
        "impact": "positive" if soil_cond == "Good" else "neutral" if soil_cond == "Medium" else "negative",
        "value": 1.0 if soil_cond == "Good" else 0.5 if soil_cond == "Medium" else 0.0,
        "importance": 0.082
    })
    
    # Soil fertility (3.5%)
    fertility = X["soil_fertility_index"].values[0]
    factors.append({
        "name": "Soil Fertility Index",
        "impact": "positive" if fertility > 0.65 else "neutral" if fertility > 0.50 else "negative",
        "value": float(fertility),
        "importance": 0.035
    })
    
    # Irrigation (2.5%)
    irrigation = X["irrigation_type"].values[0]
    factors.append({
        "name": "Irrigation Type",
        "impact": "positive" if irrigation == "Irrigated" else "neutral" if irrigation == "Mixed" else "negative",
        "value": 1.0 if irrigation == "Irrigated" else 0.5 if irrigation == "Mixed" else 0.0,
        "importance": 0.025
    })
    
    # Variety
    variety = X["seed_variety"].values[0]
    high_yield_varieties = ["Jet 999", "Pacific 808", "Commando", "GT 709"]
    factors.append({
        "name": "Seed Variety",
        "impact": "positive" if variety in high_yield_varieties else "neutral",
        "value": 1.0 if variety in high_yield_varieties else 0.5,
        "importance": 0.010
    })
    
    # Season
    season = X["season"].values[0]
    factors.append({
        "name": "Season",
        "impact": "positive" if season == "Maha" else "neutral",
        "value": 1.0 if season == "Maha" else 0.8,
        "importance": 0.015
    })
    
    return factors


def get_ml_prediction_officer(data: Dict) -> Optional[Dict]:
    """
    Main ML prediction service for OFFICER endpoint
    Returns prediction in format expected by officer service
    
    Args:
        data: Full nested officer request data
    
    Returns:
        Dict with predicted_yield (kg/ha), confidence_score, and other metadata
        None if prediction fails
    """
    
    try:
        # Get ML prediction using officer-specific function
        yield_t_ha, confidence_score, impact_factors = predict_yield_ml_officer(data)
        
        # Convert to kg/ha
        yield_kg_ha = yield_t_ha * 1000
        
        # Get variety for harvest window
        crop = data.get("crop_information", {})
        variety = crop.get("seed_variety", "Local Variety")
        planting_date = crop.get("planting_date", data.get("planting_date", ""))
        
        # Calculate harvest window
        harvest_window = calculate_harvest_window(planting_date, variety)
        
        logger.info(f"ML prediction successful: {yield_kg_ha:.2f} kg/ha (confidence: {confidence_score:.2f})")
        
        # Build response
        response = {
            "predicted_yield": float(round(yield_kg_ha, 2)),
            "predicted_yield_t_ha": float(round(yield_t_ha, 2)),
            "confidence_score": float(round(confidence_score, 3)),
            "harvest_window": harvest_window,
            "factors": impact_factors,
            "model_version": "XGBoost_v1.0",
            "prediction_method": "ml_model",
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Officer ML prediction failed: {e}", exc_info=True)
        return None
