# service.py
# IMPORTANT: Response format must match frontend expectations exactly!
# Frontend expects: yield_prediction_t_ha, confidence, harvest_window, calendar_event, factors

from datetime import datetime, timedelta
from typing import Dict, List
from .ml_model import predict_yield_ml, USE_ML


# ============================================================
# RULE-BASED FALLBACK LOGIC
# ============================================================
def rule_based_yield(data: Dict) -> float:
    """
    Fallback logic when ML model is not available.
    Returns yield in tons per hectare (t/ha)
    """
    # Base yield in t/ha
    base_yield = 4.5
    
    # Variety multipliers
    variety_multipliers = {
        "Jet 999": 1.1,
        "Pacific 808": 1.05,
        "GT 709": 0.95,
        "GT200": 1.0,
        "Commando": 1.08,
    }
    variety_mult = variety_multipliers.get(data.get("variety", ""), 1.0)
    
    # Soil condition multipliers
    soil_multipliers = {
        "Well-Drained Loamy": 1.15,
        "Clay Loam": 1.0,
        "Sandy Loam": 0.95,
        "Heavy Clay": 0.85,
        "Sandy": 0.8,
    }
    soil_mult = soil_multipliers.get(data.get("soil_condition", ""), 1.0)
    
    # Irrigation multipliers
    irrigation_multipliers = {
        "Drip Irrigation": 1.2,
        "Sprinkler": 1.1,
        "Flood Irrigation": 1.05,
        "Rainfed": 0.85,
    }
    irrigation_mult = irrigation_multipliers.get(data.get("irrigation_type", ""), 1.0)
    
    # Rainfall multipliers
    rainfall_multipliers = {
        "Adequate": 1.1,
        "Moderate": 1.0,
        "Low": 0.8,
        "Excessive": 0.9,
    }
    rainfall_mult = rainfall_multipliers.get(data.get("rainfall_condition", ""), 1.0)
    
    # Season multipliers
    season_multipliers = {
        "Maha": 1.05,
        "Yala": 0.95,
    }
    season_mult = season_multipliers.get(data.get("season", ""), 1.0)
    
    # Calculate final yield
    yield_t_ha = (
        base_yield
        * variety_mult
        * soil_mult
        * irrigation_mult
        * rainfall_mult
        * season_mult
    )
    
    # Add small random variance
    import random
    yield_t_ha *= (0.95 + random.random() * 0.1)  # ±5%
    
    return max(yield_t_ha, 0.5)  # Minimum 0.5 t/ha


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
        "impact": "High" if rainfall_mult >= 1.05 else "Medium" if rainfall_mult >= 0.9 else "Low",
        "value": rainfall_mult
    })
    
    # Soil impact
    soil_mult = multipliers.get("soil", 1.0)
    factors.append({
        "name": "Soil Condition",
        "impact": "High" if soil_mult >= 1.1 else "Medium" if soil_mult >= 0.95 else "Low",
        "value": soil_mult
    })
    
    # Variety impact
    variety_mult = multipliers.get("variety", 1.0)
    factors.append({
        "name": "Variety",
        "impact": "High" if variety_mult >= 1.05 else "Medium" if variety_mult >= 0.98 else "Low",
        "value": variety_mult
    })
    
    # Irrigation impact
    irrigation_mult = multipliers.get("irrigation", 1.0)
    factors.append({
        "name": "Irrigation Type",
        "impact": "High" if irrigation_mult >= 1.1 else "Medium" if irrigation_mult >= 0.95 else "Low",
        "value": irrigation_mult
    })
    
    # Season impact
    season_mult = multipliers.get("season", 1.0)
    factors.append({
        "name": "Season",
        "impact": "Medium",
        "value": season_mult
    })
    
    return factors


# ============================================================
# MAIN SERVICE - RETURNS FRONTEND-COMPATIBLE FORMAT
# ============================================================
def predict_yield_service(data: Dict) -> Dict:
    """
    Main prediction service.
    Returns format that matches frontend expectations EXACTLY.
    
    Frontend expects:
    {
      "yield_prediction_t_ha": float,
      "confidence": "High" | "Medium" | "Low",
      "harvest_window": { "start": str, "end": str, "target": str },
      "calendar_event": { "title": str, "date": str },
      "factors": [ { "name": str, "impact": str, "value": float } ]
    }
    """
    
    # Try ML model first
    try:
        if USE_ML:
            yield_t_ha = predict_yield_ml(data)
            confidence_score = 0.9
        else:
            raise RuntimeError("ML not available")
    except Exception as e:
        # Fallback to rule-based
        print(f"[YieldService] Using rule-based prediction: {e}")
        yield_t_ha = rule_based_yield(data)
        confidence_score = 0.7
    
    # Determine confidence level
    if data.get("gps_lat") and data.get("gps_lng"):
        confidence_score += 0.05  # Bonus for GPS data
    
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
    
    # Build impact factors
    # Store multipliers for factor display
    multipliers = {
        "rainfall": 1.0,
        "soil": 1.0,
        "variety": 1.0,
        "irrigation": 1.0,
        "season": 1.0,
    }
    factors = build_impact_factors(data, multipliers)
    
    # Build response in EXACT format frontend expects
    response = {
        "yield_prediction_t_ha": round(yield_t_ha, 2),
        "confidence": confidence,
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
    }
    
    return response
