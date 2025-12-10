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
    
    return yield_t_ha


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
