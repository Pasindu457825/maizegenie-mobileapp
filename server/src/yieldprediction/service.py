# service.py
# IMPORTANT: Response format must match frontend expectations exactly!
# Frontend expects: yield_prediction_t_ha, confidence, harvest_window, calendar_event, factors

from datetime import datetime, timedelta
from typing import Dict, List
import logging

# Import new ML prediction service
try:
    from .ml_prediction_service import get_ml_prediction, MODEL_LOADED
    ML_AVAILABLE = MODEL_LOADED
except ImportError as e:
    logging.warning(f"ML prediction service not available: {e}")
    ML_AVAILABLE = False

logger = logging.getLogger(__name__)

# ============================================================
# RULE-BASED FALLBACK LOGIC
# ============================================================
def rule_based_yield(data: Dict) -> tuple[float, Dict[str, float]]:
    """
    Fallback logic when ML model is not available.
    Returns (yield in kg/ha, multipliers dict)
    
    Based on Sri Lankan maize yield data:
    - Local Average: 3.58 t/ha
    - Potential (Hybrid): 6-7 t/ha
    - Smallholder Reality: 3.7-6.2 t/ha
    - Factors: Management, seed type, season, water, fertilizer, pests
    """
    # Base yield in t/ha (Sri Lankan local average)
    base_yield = 3.6
    
    # Variety multipliers (Hybrid seeds offer much higher potential)
    variety_multipliers = {
        "Jet 999": 1.5,        # High-yield hybrid (can reach 5.4 t/ha)
        "Pacific 808": 1.45,   # High-yield hybrid (can reach 5.2 t/ha)
        "Commando": 1.4,       # Popular hybrid (can reach 5.0 t/ha)
        "GT 709": 1.2,         # Medium hybrid (can reach 4.3 t/ha)
        "GT200": 1.15,         # Medium hybrid (can reach 4.1 t/ha)
        "Local Variety": 0.9,  # Local seeds (around 3.2 t/ha)
    }
    variety_mult = variety_multipliers.get(data.get("variety", ""), 1.0)
    
    # Soil condition multipliers (Good soil = better yield)
    soil_multipliers = {
        "Good": 1.15,    # Well-managed, fertile soil
        "Medium": 1.0,   # Average soil condition
        "Poor": 0.75,    # Degraded or problematic soil
    }
    soil_mult = soil_multipliers.get(data.get("soil_condition", ""), 1.0)
    
    # Irrigation multipliers (Water management is critical)
    irrigation_multipliers = {
        "Irrigated": 1.25,  # Proper water supply (can boost to 6+ t/ha)
        "Mixed": 1.1,       # Partial irrigation
        "Rainfed": 0.85,    # Dependent on rainfall (lower yields)
    }
    irrigation_mult = irrigation_multipliers.get(data.get("irrigation_type", ""), 1.0)
    
    # Rainfall condition multipliers
    rainfall_multipliers = {
        "High": 1.1,     # Good rainfall (if not excessive)
        "Normal": 1.0,   # Adequate rainfall
        "Low": 0.75,     # Drought stress reduces yield significantly
    }
    rainfall_mult = rainfall_multipliers.get(data.get("rainfall_condition", ""), 1.0)
    
    # Season multipliers (Maha season has better rainfall)
    season_multipliers = {
        "Maha Season": 1.15,  # Main season with better rainfall
        "Maha": 1.15,
        "Yala Season": 0.95,  # Off-season, drier conditions
        "Yala": 0.95,
    }
    season_mult = season_multipliers.get(data.get("season", ""), 1.0)
    
    # Management quality factor (based on soil quality as proxy)
    # Proper nitrogen, pest control (fall armyworm), fertilizer management
    management_quality = soil_multipliers.get(data.get("soil_quality", ""), 1.0)
    
    # Calculate final yield
    yield_t_ha = (
        base_yield
        * variety_mult
        * soil_mult
        * irrigation_mult
        * rainfall_mult
        * season_mult
    )
    
    # Add realistic variance (±8% to simulate field conditions)
    import random
    yield_t_ha *= (0.92 + random.random() * 0.16)  # ±8%
    
    # Constrain to realistic Sri Lankan ranges
    # Minimum: 2.5 t/ha (poor conditions)
    # Maximum: 7.0 t/ha (excellent hybrid + management)
    yield_t_ha = max(2.5, min(yield_t_ha, 7.0))
    
    # Convert to kg/ha for frontend
    yield_kg_ha = yield_t_ha * 1000
    
    # Return yield and actual multipliers used
    multipliers = {
        "variety": variety_mult,
        "soil": soil_mult,
        "irrigation": irrigation_mult,
        "rainfall": rainfall_mult,
        "season": season_mult,
    }
    
    return yield_kg_ha, multipliers


# ============================================================
# HARVEST WINDOW CALCULATION
# ============================================================
def calc_harvest_window(planting_date: str, variety: str) -> tuple:
    """Calculate harvest window based on variety growth period"""
    VARIETY_DAYS = {
        "Jet 999": (110, 120),
        "Pacific 808": (105, 115),
        "GT 709": (100, 110),
        "GT200": (110, 120),
        "Commando": (115, 125),
    }
    
    min_days, max_days = VARIETY_DAYS.get(variety, (110, 120))
    
    planting = datetime.fromisoformat(planting_date.split('T')[0])
    
    start = planting + timedelta(days=min_days)
    end = planting + timedelta(days=max_days)
    target = planting + timedelta(days=(min_days + max_days) // 2)
    
    return start, end, target


# ============================================================
# BUILD IMPACT FACTORS
# ============================================================
def build_impact_factors(data: Dict, multipliers: Dict[str, float]) -> List[Dict]:
    """Build impact factors array for frontend display"""
    factors = []
    
    # Rainfall impact
    rainfall_mult = multipliers.get("rainfall", 1.0)
    factors.append({
        "name": "Rainfall Condition",
        "impact": "positive" if rainfall_mult >= 1.05 else "neutral" if rainfall_mult >= 0.9 else "negative",
        "value": rainfall_mult
    })
    
    # Soil impact
    soil_mult = multipliers.get("soil", 1.0)
    factors.append({
        "name": "Soil Condition",
        "impact": "positive" if soil_mult >= 1.1 else "neutral" if soil_mult >= 0.95 else "negative",
        "value": soil_mult
    })
    
    # Variety impact
    variety_mult = multipliers.get("variety", 1.0)
    factors.append({
        "name": "Variety",
        "impact": "positive" if variety_mult >= 1.3 else "neutral" if variety_mult >= 1.0 else "negative",
        "value": variety_mult
    })
    
    # Irrigation impact
    irrigation_mult = multipliers.get("irrigation", 1.0)
    factors.append({
        "name": "Irrigation Type",
        "impact": "positive" if irrigation_mult >= 1.1 else "neutral" if irrigation_mult >= 0.95 else "negative",
        "value": irrigation_mult
    })
    
    # Season impact
    season_mult = multipliers.get("season", 1.0)
    factors.append({
        "name": "Season",
        "impact": "positive" if season_mult >= 1.1 else "neutral" if season_mult >= 0.98 else "negative",
        "value": season_mult
    })
    
    return factors


# ============================================================
# MAIN SERVICE - RETURNS FRONTEND-COMPATIBLE FORMAT
# ============================================================
def predict_yield_service(data: Dict) -> Dict:
    """
    Main prediction service with ML-first approach.
    Returns format that matches frontend expectations EXACTLY.
    
    Strategy:
    1. Try ML model first (XGBoost) - most accurate
    2. Fallback to rule-based if ML fails
    3. Return comprehensive prediction with impact factors
    
    Frontend expects:
    {
        "predicted_yield": float (kg/ha),
        "predicted_yield_t_ha": float,
        "confidence": "High" | "Medium" | "Low",
        "confidence_score": float,
        "harvest_window": { "start": str, "end": str, "target": str },
        "calendar_event": { "title": str, "date": str },
        "factors": [ { "name": str, "impact": str, "value": float } ],
        "model_version": str,
        "prediction_method": "ML" | "Rule-Based"
    }
    """
    
    # Try ML prediction first (XGBoost model)
    if ML_AVAILABLE:
        try:
            logger.info("🤖 Using ML prediction (XGBoost) for farmer")
            response = get_ml_prediction(data)
            logger.info(f"✅ ML prediction successful: {response['predicted_yield']:.2f} kg/ha")
            return response
        except Exception as e:
            logger.warning(f"⚠️ ML prediction failed, falling back to rule-based: {e}")
    else:
        logger.info("⚠️ ML model not available, using rule-based prediction")
    
    # Fallback to rule-based prediction
    logger.info("📊 Using rule-based prediction for farmer")
    multipliers = {}
    yield_kg_ha, multipliers = rule_based_yield(data)
    confidence_score = 0.7
    
    # Determine confidence level
    if data.get("gps_lat") and data.get("gps_lng"):
        confidence_score += 0.05  # Bonus for GPS data
    
    # Adjust confidence based on data quality
    if data.get("soil_condition") == "Good" and data.get("irrigation_type") == "Irrigated":
        confidence_score += 0.05
    
    if confidence_score >= 0.85:
        confidence = "High"
    elif confidence_score >= 0.7:
        confidence = "Medium"
    else:
        confidence = "Low"
    
    # Calculate harvest window
    start, end, target = calc_harvest_window(
        data["planting_date"], 
        data.get("variety", "Unknown")
    )
    
    # Build impact factors using actual multipliers
    factors = build_impact_factors(data, multipliers)
    
    # Build response in EXACT format frontend expects
    response = {
        "predicted_yield": round(yield_kg_ha, 2),  # kg/ha for frontend
        "predicted_yield_t_ha": round(yield_kg_ha / 1000, 2),  # t/ha
        "confidence": confidence,
        "confidence_score": round(confidence_score, 3),
        "harvest_window": {
            "start": start.strftime("%Y-%m-%d"),
            "end": end.strftime("%Y-%m-%d"),
            "target": target.strftime("%Y-%m-%d"),
        },
        "calendar_event": {
            "title": "Maize Harvest Reminder",
            "date": target.strftime("%Y-%m-%d"),
        },
        "factors": factors,
        "model_version": "Rule-Based_v1.0",
        "prediction_method": "Rule-Based",
    }
    
    logger.info(f"✅ Rule-based prediction: {yield_kg_ha:.2f} kg/ha")
    
    return response
