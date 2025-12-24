"""
Officer Yield Prediction Service
ML-first approach with rule-based fallback for reliability
"""

from typing import Dict, Tuple, Optional
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def calculate_rule_based_yield(data: Dict) -> Tuple[float, Dict[str, float], str]:
    """
    Rule-based yield prediction using agronomic principles
    Fallback when ML model is unavailable or fails
    
    Returns:
        Tuple of (yield_kg_ha, multipliers_dict, method_used)
    """
    
    # Base yield for maize in Sri Lanka (kg/ha)
    base_yield = 4500
    
    # Initialize multipliers
    multipliers = {
        "variety": 1.0,
        "soil_condition": 1.0,
        "soil_fertility": 1.0,
        "irrigation": 1.0,
        "rainfall": 1.0,
        "season": 1.0,
        "npk_balance": 1.0,
        "temperature": 1.0,
    }
    
    # 1. Variety multiplier (0.9 - 1.5)
    variety = data.get("seed_variety", "")
    variety_map = {
        "Jet 999": 1.5,
        "Pacific 808": 1.45,
        "GT 709": 1.2,
        "GT200": 1.15,
        "Commando": 1.1,
        "Local Variety": 0.9,
    }
    multipliers["variety"] = variety_map.get(variety, 1.0)
    
    # 2. Soil condition multiplier (0.75 - 1.15)
    soil_condition = data.get("soil_condition", "Medium")
    soil_condition_map = {
        "Good": 1.15,
        "Medium": 1.0,
        "Poor": 0.75,
    }
    multipliers["soil_condition"] = soil_condition_map.get(soil_condition, 1.0)
    
    # 3. Soil fertility index (0.8 - 1.2)
    fertility_index = data.get("soil_fertility_index", 0.5)
    if fertility_index >= 0.8:
        multipliers["soil_fertility"] = 1.2
    elif fertility_index >= 0.6:
        multipliers["soil_fertility"] = 1.1
    elif fertility_index >= 0.4:
        multipliers["soil_fertility"] = 1.0
    elif fertility_index >= 0.2:
        multipliers["soil_fertility"] = 0.9
    else:
        multipliers["soil_fertility"] = 0.8
    
    # 4. Irrigation multiplier (0.85 - 1.25)
    irrigation = data.get("irrigation_type", "Mixed")
    irrigation_map = {
        "Irrigated": 1.25,
        "Mixed": 1.1,
        "Rainfed": 0.85,
    }
    multipliers["irrigation"] = irrigation_map.get(irrigation, 1.0)
    
    # 5. Rainfall multiplier (0.75 - 1.1)
    rainfall_condition = data.get("rainfall_condition", "Normal")
    rainfall_map = {
        "High": 1.1,
        "Normal": 1.0,
        "Low": 0.75,
    }
    multipliers["rainfall"] = rainfall_map.get(rainfall_condition, 1.0)
    
    # 6. Season multiplier (0.95 - 1.15)
    season = data.get("season", "Maha")
    season_map = {
        "Maha": 1.15,  # Better rainfall
        "Yala": 0.95,  # Drier season
    }
    multipliers["season"] = season_map.get(season, 1.0)
    
    # 7. NPK balance multiplier (0.85 - 1.15)
    n_status = data.get("n_status_class", "Medium")
    p_status = data.get("p_status_class", "Medium")
    k_status = data.get("k_status_class", "Medium")
    
    npk_scores = []
    status_map = {"High": 1.0, "Medium": 0.9, "Low": 0.7}
    npk_scores.append(status_map.get(n_status, 0.9))
    npk_scores.append(status_map.get(p_status, 0.9))
    npk_scores.append(status_map.get(k_status, 0.9))
    
    avg_npk = sum(npk_scores) / len(npk_scores)
    if avg_npk >= 0.95:
        multipliers["npk_balance"] = 1.15
    elif avg_npk >= 0.85:
        multipliers["npk_balance"] = 1.05
    elif avg_npk >= 0.75:
        multipliers["npk_balance"] = 1.0
    else:
        multipliers["npk_balance"] = 0.85
    
    # 8. Temperature multiplier (0.9 - 1.05)
    avg_temp = data.get("avg_temperature_c", 28)
    if 26 <= avg_temp <= 30:
        multipliers["temperature"] = 1.05  # Optimal
    elif 24 <= avg_temp <= 32:
        multipliers["temperature"] = 1.0   # Good
    elif 22 <= avg_temp <= 34:
        multipliers["temperature"] = 0.95  # Acceptable
    else:
        multipliers["temperature"] = 0.9   # Suboptimal
    
    # Calculate final yield
    final_multiplier = 1.0
    for key, value in multipliers.items():
        final_multiplier *= value
    
    yield_kg_ha = base_yield * final_multiplier
    
    # Ensure realistic bounds (2000 - 8000 kg/ha)
    yield_kg_ha = max(2000, min(8000, yield_kg_ha))
    
    return yield_kg_ha, multipliers, "rule_based"


def predict_yield_ml(data: Dict) -> Tuple[Optional[float], Optional[Dict], str]:
    """
    ML-based yield prediction
    Returns None if ML model is not available or fails
    
    Returns:
        Tuple of (yield_kg_ha, model_metadata, method_used)
    """
    try:
        # Import the working ML prediction service
        from .ml_prediction_service import get_ml_prediction, MODEL_LOADED
        
        if not MODEL_LOADED:
            logger.warning("ML model not loaded")
            return None, None, "ml_unavailable"
        
        # Call the ML prediction service
        result = get_ml_prediction(data)
        
        # Extract yield and metadata
        yield_kg_ha = result.get("predicted_yield", 0)
        
        metadata = {
            "model_version": result.get("model_version", "XGBoost_v1.0"),
            "confidence": result.get("confidence_score", 0.85),
            "prediction_method": result.get("prediction_method", "ML"),
            "harvest_window": result.get("harvest_window", {}),
            "factors": result.get("factors", []),
        }
        
        return yield_kg_ha, metadata, "ml_model"
        
    except ImportError as e:
        logger.warning(f"ML prediction service not available: {e}")
        return None, None, "ml_unavailable"
    except Exception as e:
        logger.error(f"ML prediction failed: {e}")
        return None, None, "ml_failed"


def predict_officer_yield(data: Dict) -> Dict:
    """
    Main prediction function with ML-first, rule-based fallback
    
    Strategy:
    1. Try ML model first
    2. If ML fails/unavailable, use rule-based system
    3. Return prediction with method indicator
    """
    
    # Extract data from nested structure
    soil_profile = data.get("soil_profile", {})
    climate_data = data.get("climate_data", {})
    crop_info = data.get("crop_information", {})
    
    # Flatten data for prediction
    flat_data = {
        "district": soil_profile.get("district"),
        "location": soil_profile.get("location"),
        "soil_type": soil_profile.get("soil_type"),
        "soil_condition": soil_profile.get("soil_condition"),
        "soil_ph": soil_profile.get("soil_ph"),
        "soil_nitrogen_n": soil_profile.get("soil_nitrogen_n"),
        "soil_phosphorus_p": soil_profile.get("soil_phosphorus_p"),
        "soil_potassium_k": soil_profile.get("soil_potassium_k"),
        "soil_fertility_index": soil_profile.get("soil_fertility_index"),
        "n_status_class": soil_profile.get("n_status_class"),
        "p_status_class": soil_profile.get("p_status_class"),
        "k_status_class": soil_profile.get("k_status_class"),
        "irrigation_type": climate_data.get("irrigation_type"),
        "rainfall_condition": climate_data.get("rainfall_condition"),
        "rainfall_30d_mm": climate_data.get("rainfall_30d_mm"),
        "seasonal_rainfall_mm": climate_data.get("seasonal_rainfall_mm"),
        "avg_temperature_c": climate_data.get("avg_temperature_c"),
        "max_temperature_c": climate_data.get("max_temperature_c"),
        "avg_humidity_pct": climate_data.get("avg_humidity_pct"),
        "sunshine_hours": climate_data.get("sunshine_hours"),
        "seed_variety": crop_info.get("seed_variety"),
        "planting_date": crop_info.get("planting_date"),
        "planting_month": crop_info.get("planting_month"),
        "season": crop_info.get("season"),
        "field_size_ha": crop_info.get("field_size_ha"),
    }
    
    # Try ML first
    logger.info("Attempting ML prediction...")
    ml_yield, ml_metadata, ml_status = predict_yield_ml(flat_data)
    
    if ml_yield is not None:
        logger.info(f"ML prediction successful: {ml_yield:.2f} kg/ha")
        prediction_method = "ml_model"
        predicted_yield = ml_yield
        confidence = ml_metadata.get("confidence", 0.85)
        multipliers = {}  # ML doesn't use multipliers
        harvest_window = ml_metadata.get("harvest_window", {})
    else:
        logger.info(f"ML prediction failed ({ml_status}), falling back to rule-based system")
        rule_yield, multipliers, _ = calculate_rule_based_yield(flat_data)
        prediction_method = "rule_based"
        predicted_yield = rule_yield
        confidence = 0.75  # Rule-based has lower confidence
        harvest_window = {}
    
    # Determine yield category
    if predicted_yield >= 6000:
        yield_category = "High"
    elif predicted_yield >= 4000:
        yield_category = "Medium"
    else:
        yield_category = "Low"
    
    # Build response
    response = {
        "status": "success",
        "prediction_id": f"pred_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.now().isoformat(),
        "prediction": {
            "predicted_yield": predicted_yield,
            "yield_unit": "kg/ha",
            "confidence_score": confidence,
            "yield_category": yield_category,
            "prediction_method": prediction_method,
            "harvest_window": harvest_window if harvest_window else {
                "start": "2025-02-15",
                "target": "2025-02-28",
                "end": "2025-03-15",
            },
        },
        "impact_factors": build_impact_factors(flat_data, multipliers, prediction_method),
        "recommendations": build_recommendations(flat_data, predicted_yield),
        "fertilizer_schedule": build_fertilizer_schedule(flat_data),
        "officer_insights": build_officer_insights(flat_data, predicted_yield, prediction_method),
        "analysis_data": build_analysis_data(flat_data, predicted_yield, multipliers),
    }
    
    return response


def build_impact_factors(data: Dict, multipliers: Dict, method: str) -> list:
    """Build impact factors for visualization"""
    
    if method == "ml_model":
        # For ML, show feature importance (simplified)
        return [
            {
                "factor": "Seed Variety",
                "value": data.get("seed_variety", "Unknown"),
                "impact": 0.85,
                "impact_percentage": 25.0,
                "description": "High-yielding hybrid variety selected",
            },
            {
                "factor": "Soil Fertility",
                "value": f"{data.get('soil_fertility_index', 0.5):.2f}",
                "impact": 0.75,
                "impact_percentage": 20.0,
                "description": "Soil nutrient levels affect yield potential",
            },
            {
                "factor": "Irrigation",
                "value": data.get("irrigation_type", "Mixed"),
                "impact": 0.70,
                "impact_percentage": 18.0,
                "description": "Water availability is crucial for growth",
            },
            {
                "factor": "Season",
                "value": data.get("season", "Maha"),
                "impact": 0.65,
                "impact_percentage": 15.0,
                "description": "Seasonal climate affects crop performance",
            },
            {
                "factor": "NPK Balance",
                "value": f"N:{data.get('n_status_class', 'Medium')}",
                "impact": 0.60,
                "impact_percentage": 12.0,
                "description": "Nutrient balance impacts plant health",
            },
        ]
    else:
        # For rule-based, show actual multipliers
        factors = []
        for key, value in multipliers.items():
            impact_pct = (value - 1.0) * 100
            factors.append({
                "factor": key.replace("_", " ").title(),
                "value": f"{value:.2f}x",
                "impact": value,
                "impact_percentage": impact_pct,
                "description": f"Multiplier effect on base yield",
            })
        
        # Sort by impact
        factors.sort(key=lambda x: abs(x["impact_percentage"]), reverse=True)
        return factors[:5]  # Top 5


def build_recommendations(data: Dict, predicted_yield: float) -> list:
    """Build recommendations based on data and prediction"""
    
    recommendations = []
    
    # Soil-based recommendations
    if data.get("soil_fertility_index", 0.5) < 0.6:
        recommendations.append({
            "priority": "high",
            "category": "Soil Management",
            "title_si": "පස් සාරවත් බව වැඩි දියුණු කරන්න",
            "title_en": "Improve Soil Fertility",
            "description_si": "කාබනික පොහොර සහ කොම්පෝස්ට් යොදන්න",
            "description_en": "Apply organic fertilizers and compost to improve soil health",
        })
    
    # NPK recommendations
    n_status = data.get("n_status_class", "Medium")
    if n_status == "Low":
        recommendations.append({
            "priority": "high",
            "category": "Fertilizer",
            "title_si": "නයිට්‍රජන් යෙදීම වැඩි කරන්න",
            "title_en": "Increase Nitrogen Application",
            "description_si": "යූරියා පොහොර අමතර මාත්‍රාවක් යොදන්න",
            "description_en": "Apply additional urea fertilizer to boost nitrogen levels",
        })
    
    # Irrigation recommendations
    if data.get("irrigation_type") == "Rainfed" and data.get("rainfall_condition") == "Low":
        recommendations.append({
            "priority": "high",
            "category": "Water Management",
            "title_si": "ජල සම්පාදනය වැඩි දියුණු කරන්න",
            "title_en": "Improve Water Supply",
            "description_si": "අතිරේක ජලය ලබා දීම සලකා බලන්න",
            "description_en": "Consider supplementary irrigation during dry periods",
        })
    
    return recommendations


def build_fertilizer_schedule(data: Dict) -> Dict:
    """Build fertilizer schedule"""
    
    # Simplified fertilizer schedule
    return {
        "total_n_requirement": 150,
        "total_p_requirement": 60,
        "total_k_requirement": 60,
        "basal": {
            "date": data.get("planting_date", "2024-10-15"),
            "day_number": 0,
            "recommended_amount": 200,
            "applied_amount": 200,
            "remaining_amount": 0,
            "status": "done",
            "npk_amount": 200,
            "nitrogen": 30,
            "phosphorus": 60,
            "potassium": 60,
            "instructions_si": "වගා කිරීමේදී යොදන්න",
            "instructions_en": "Apply at planting time",
        },
        "top_dress_1": {
            "date": "2024-11-05",
            "day_number": 21,
            "recommended_amount": 100,
            "applied_amount": 0,
            "remaining_amount": 100,
            "status": "pending",
            "nitrogen": 60,
            "instructions_si": "වගා කිරීමෙන් දින 21 කට පසු",
            "instructions_en": "Apply 21 days after planting",
        },
        "top_dress_2": {
            "date": "2024-11-25",
            "day_number": 41,
            "recommended_amount": 100,
            "applied_amount": 0,
            "remaining_amount": 100,
            "status": "pending",
            "nitrogen": 60,
            "instructions_si": "වගා කිරීමෙන් දින 41 කට පසු",
            "instructions_en": "Apply 41 days after planting",
        },
    }


def build_officer_insights(data: Dict, predicted_yield: float, method: str) -> Dict:
    """Build officer-specific insights"""
    
    # Calculate soil health score
    fertility = data.get("soil_fertility_index", 0.5)
    ph = data.get("soil_ph", 6.5)
    ph_score = 1.0 if 6.0 <= ph <= 7.0 else 0.8
    soil_health = (fertility + ph_score) / 2 * 10
    
    # Expected ROI
    cost_per_ha = 150000  # LKR
    price_per_kg = 80  # LKR
    revenue = predicted_yield * price_per_kg
    roi = revenue / cost_per_ha
    
    return {
        "soil_health_score": round(soil_health, 1),
        "fertilizer_efficiency": 0.85,
        "expected_roi": round(roi, 2),
        "prediction_method": method,
        "risk_factors": build_risk_factors(data),
        "field_visit_recommendations": [
            "Monitor crop growth at 30 DAS",
            "Check for pest and disease",
            "Verify fertilizer application timing",
        ],
    }


def build_risk_factors(data: Dict) -> list:
    """Identify risk factors"""
    
    risks = []
    
    if data.get("rainfall_condition") == "Low":
        risks.append("Low rainfall - drought risk")
    
    if data.get("soil_fertility_index", 0.5) < 0.4:
        risks.append("Poor soil fertility")
    
    if data.get("irrigation_type") == "Rainfed":
        risks.append("Rainfed cultivation - weather dependent")
    
    return risks if risks else ["No major risks identified"]


def build_analysis_data(data: Dict, predicted_yield: float, multipliers: Dict) -> Dict:
    """
    Build data for charts and graphs
    This will be used in the frontend for visualization
    """
    
    return {
        "yield_comparison": {
            "predicted": predicted_yield,
            "district_average": 4500,
            "national_average": 4200,
            "potential_maximum": 7000,
        },
        "npk_levels": {
            "nitrogen": data.get("soil_nitrogen_n", 60),
            "phosphorus": data.get("soil_phosphorus_p", 30),
            "potassium": data.get("soil_potassium_k", 180),
            "optimal_nitrogen": 80,
            "optimal_phosphorus": 40,
            "optimal_potassium": 200,
        },
        "environmental_factors": {
            "temperature": data.get("avg_temperature_c", 28),
            "humidity": data.get("avg_humidity_pct", 75),
            "rainfall_30d": data.get("rainfall_30d_mm", 150),
            "sunshine": data.get("sunshine_hours", 8.5),
        },
        "multiplier_breakdown": multipliers if multipliers else {},
        "soil_health": {
            "ph": data.get("soil_ph", 6.5),
            "fertility_index": data.get("soil_fertility_index", 0.5),
            "n_status": data.get("n_status_class", "Medium"),
            "p_status": data.get("p_status_class", "Medium"),
            "k_status": data.get("k_status_class", "Medium"),
        },
    }
