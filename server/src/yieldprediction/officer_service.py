"""
This is officer_service.py
Officer Yield Prediction Service
ML-first approach with rule-based fallback for reliability
"""

from typing import Dict, Tuple, Optional, List
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


def get_optimal_district_yield(district: str, variety: str, season: str) -> float:
    """
    Calculate optimal district yield based on district, variety, and season
    Returns dynamic optimal yield instead of hardcoded 4500
    """
    # Base optimal yields by district (kg/ha)
    district_base = {
        "Anuradhapura": 5200,
        "Monaragala": 4800,
        "Badulla": 4700,
        "Ampara": 4650,
        "Polonnaruwa": 5250,
        "Kurunegala": 4900,
    }
    
    # Variety adjustment factors
    variety_factors = {
        "Jet 999": 1.15,
        "Pacific 808": 1.12,
        "GT 709": 1.05,
        "GT200": 1.03,
        "Commando": 1.02,
        "Local Variety": 0.90,
    }
    
    # Season adjustment
    season_factors = {
        "Maha": 1.05,  # Better season
        "Yala": 0.95,  # Drier season
    }
    
    base = district_base.get(district, 4800)
    variety_factor = variety_factors.get(variety, 1.0)
    season_factor = season_factors.get(season, 1.0)
    
    optimal_yield = base * variety_factor * season_factor
    return round(optimal_yield, 0)


def get_ph_interpretation(ph: float) -> str:
    """
    Get pH interpretation for soil health
    """
    if ph < 5.5:
        return "Too Acidic"
    elif ph < 6.0:
        return "Slightly Acidic"
    elif ph <= 7.0:
        return "Optimal"
    elif ph <= 7.5:
        return "Slightly Alkaline"
    else:
        return "Too Alkaline"


def identify_limiting_npk_factor(n_status: str, p_status: str, k_status: str) -> str:
    """
    Identify the main limiting NPK factor
    """
    status_priority = {"Low": 3, "Medium": 2, "High": 1}
    
    factors = [
        ("Nitrogen", status_priority.get(n_status, 2)),
        ("Phosphorus", status_priority.get(p_status, 2)),
        ("Potassium", status_priority.get(k_status, 2)),
    ]
    
    # Sort by priority (higher number = more limiting)
    factors.sort(key=lambda x: x[1], reverse=True)
    
    if factors[0][1] == 3:  # At least one is Low
        return f"Low {factors[0][0]}"
    elif factors[0][1] == 2:  # All are Medium or High
        return "Balanced NPK"
    else:
        return "Optimal NPK"


def calculate_rule_based_yield(data: Dict) -> Tuple[float, Dict[str, float], str]:
    """
    Rule-based yield prediction using agronomic principles
    Fallback when ML model is unavailable or fails
    
    Returns:
        Tuple of (yield_kg_ha, multipliers_dict, method_used)
    """
    
    # Base yield for maize in Sri Lanka (kg/ha)
    base_yield = 4562
    
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
    
    # Try ML prediction first (now fixed with correct feature mapping)
    from .ml_prediction_service import get_ml_prediction_officer
    
    ml_result = get_ml_prediction_officer(data)
    
    if ml_result:
        # ML prediction successful
        logger.info("Using ML-based prediction (XGBoost)")
        predicted_yield = ml_result["predicted_yield"]
        confidence = ml_result["confidence_score"]
        prediction_method = "ml_model"
        harvest_window = ml_result.get("harvest_window", {})
        multipliers = {}  # ML doesn't use multipliers
        logger.info(f"ML prediction: {predicted_yield:.2f} kg/ha (confidence: {confidence:.2f})")
    else:
        # Fallback to rule-based if ML fails
        logger.warning("ML prediction failed, falling back to rule-based system")
        rule_yield, multipliers, _ = calculate_rule_based_yield(flat_data)
        prediction_method = "rule_based"
        predicted_yield = rule_yield
        confidence = 0.85
        harvest_window = {}
        logger.info(f"Rule-based prediction: {predicted_yield:.2f} kg/ha")
    
    # Determine yield category
    if predicted_yield >= 5700:
        yield_category = "High"
    elif predicted_yield >= 3500:
        yield_category = "Medium"
    else:
        yield_category = "Low"
    
    # Build input summary for frontend display
    input_summary = {
        "district": flat_data.get("district", "N/A"),
        "variety": flat_data.get("seed_variety", "N/A"),
        "season": flat_data.get("season", "N/A"),
        "planting_date": flat_data.get("planting_date", "N/A"),
    }
    
    # Build response
    response = {
        "status": "success",
        "input_summary": input_summary,
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
        "officer_insights": build_officer_insights(flat_data, predicted_yield, prediction_method),
        "analysis_data": build_analysis_data(flat_data, predicted_yield, multipliers),
    }
    
    return response


def suggest_seed_variety(data: Dict) -> Optional[Dict]:
    """
    Detect suboptimal seed variety and suggest better alternatives
    Returns suggestion dict with current vs suggested comparison
    """
    variety = data.get("seed_variety", "")
    district = data.get("district", "Badulla")
    
    # Define optimal varieties by district
    optimal_varieties = {
        "Anuradhapura": ["Jet 999", "Pacific 808", "Pacific 999"],
        "Monaragala": ["Jet 999", "Pacific 808"],
        "Badulla": ["Jet 999", "Pacific 999"],
        "Ampara": ["Pacific 808", "Jet 999"],
        "Polonnaruwa": ["Jet 999", "Pacific 999"],
        "Kurunegala": ["Pacific 808", "Jet 999"],
    }
    
    # Check if current variety is suboptimal
    if variety == "Local Variety" or variety not in optimal_varieties.get(district, []):
        suggested = optimal_varieties.get(district, ["Jet 999"])[0]
        return {
            "current": variety,
            "suggested": suggested,
            "current_impact": -12.0,
            "suggested_impact": 25.0,
            "difference": 37.0,
            "reason": f"High-yielding hybrid {suggested} is optimal for {district} district",
        }
    
    return None


def suggest_irrigation(data: Dict) -> Optional[Dict]:
    """
    Suggest irrigation improvements based on current setup and rainfall
    """
    irrigation = data.get("irrigation_type", "Mixed")
    rainfall = data.get("rainfall_condition", "Moderate")
    
    # Rainfed with low rainfall is suboptimal
    if irrigation == "Rainfed" and rainfall == "Low":
        return {
            "current": "Rainfed",
            "suggested": "Supplementary irrigation",
            "current_impact": -15.0,
            "suggested_impact": 18.0,
            "difference": 33.0,
            "reason": "Supplementary irrigation during dry periods improves yield stability",
        }
    
    return None


def suggest_soil_fertility(data: Dict) -> Optional[Dict]:
    """
    Suggest soil fertility improvements
    """
    fertility = data.get("soil_fertility_index", 0.5)
    
    if fertility < 0.5:
        return {
            "current": f"{fertility:.2f}",
            "suggested": "≥0.70",
            "current_impact": -15.0,
            "suggested_impact": 20.0,
            "difference": 35.0,
            "reason": "Apply organic matter and balanced fertilizers to improve soil health",
        }
    elif fertility < 0.7:
        return {
            "current": f"{fertility:.2f}",
            "suggested": "≥0.70",
            "current_impact": -8.0,
            "suggested_impact": 20.0,
            "difference": 28.0,
            "reason": "Moderate fertility - can be improved with proper nutrient management",
        }
    
    return None


def suggest_npk_improvement(data: Dict) -> Optional[Dict]:
    """
    Suggest NPK improvements based on status
    """
    n_status = data.get("n_status_class", "Medium")
    p_status = data.get("p_status_class", "Medium")
    k_status = data.get("k_status_class", "Medium")
    
    # Find the most limiting nutrient
    if n_status == "Low":
        return {
            "current": "Low N",
            "suggested": "High N (≥80 ppm)",
            "current_impact": -12.0,
            "suggested_impact": 15.0,
            "difference": 27.0,
            "reason": "Nitrogen is critical for vegetative growth - apply urea or ammonium sulfate",
        }
    elif p_status == "Low":
        return {
            "current": "Low P",
            "suggested": "High P (≥40 ppm)",
            "current_impact": -10.0,
            "suggested_impact": 12.0,
            "difference": 22.0,
            "reason": "Phosphorus deficiency affects root development - apply TSP or DAP",
        }
    elif k_status == "Low":
        return {
            "current": "Low K",
            "suggested": "High K (≥200 ppm)",
            "current_impact": -10.0,
            "suggested_impact": 12.0,
            "difference": 22.0,
            "reason": "Potassium improves stress tolerance - apply MOP or SOP",
        }
    
    return None


def build_impact_factors(data: Dict, multipliers: Dict, method: str) -> list:
    """Build impact factors for visualization"""
    
    # Get agronomic suggestions (applies to both ML and rule-based)
    variety_suggestion = suggest_seed_variety(data)
    irrigation_suggestion = suggest_irrigation(data)
    fertility_suggestion = suggest_soil_fertility(data)
    npk_suggestion = suggest_npk_improvement(data)
    
    if method == "ml_model":
        # For ML, show feature importance with suggestions
        factors = []
        
        # Seed Variety - with suggestion if applicable
        if variety_suggestion:
            factors.append({
                "factor": "Seed Variety",
                "value": variety_suggestion["current"],
                "impact": 0.85,
                "impact_percentage": variety_suggestion["current_impact"],
                "suggested_value": variety_suggestion["suggested"],
                "suggested_impact": variety_suggestion["suggested_impact"],
                "difference": variety_suggestion["difference"],
                "description": variety_suggestion["reason"],
                "source": "agronomic_suggestion",
            })
        else:
            factors.append({
                "factor": "Seed Variety",
                "value": data.get("seed_variety", "Unknown"),
                "impact": 0.85,
                "impact_percentage": 25.0,
                "description": "High-yielding hybrid variety selected",
                "source": "ml_model",
            })
        
        # Soil Fertility - with suggestion if applicable
        if fertility_suggestion:
            factors.append({
                "factor": "Soil Fertility",
                "value": fertility_suggestion["current"],
                "impact": 0.75,
                "impact_percentage": fertility_suggestion["current_impact"],
                "suggested_value": fertility_suggestion["suggested"],
                "suggested_impact": fertility_suggestion["suggested_impact"],
                "difference": fertility_suggestion["difference"],
                "description": fertility_suggestion["reason"],
                "source": "agronomic_suggestion",
            })
        else:
            factors.append({
                "factor": "Soil Fertility",
                "value": f"{data.get('soil_fertility_index', 0.5):.2f}",
                "impact": 0.75,
                "impact_percentage": 20.0,
                "description": "Soil nutrient levels affect yield potential",
                "source": "ml_model",
            })
        
        # Irrigation - with suggestion if applicable
        if irrigation_suggestion:
            factors.append({
                "factor": "Irrigation",
                "value": irrigation_suggestion["current"],
                "impact": 0.70,
                "impact_percentage": irrigation_suggestion["current_impact"],
                "suggested_value": irrigation_suggestion["suggested"],
                "suggested_impact": irrigation_suggestion["suggested_impact"],
                "difference": irrigation_suggestion["difference"],
                "description": irrigation_suggestion["reason"],
                "source": "agronomic_suggestion",
            })
        else:
            factors.append({
                "factor": "Irrigation",
                "value": data.get("irrigation_type", "Mixed"),
                "impact": 0.70,
                "impact_percentage": 18.0,
                "description": "Water availability is crucial for growth",
                "source": "ml_model",
            })
        
        # Season (no suggestion needed)
        factors.append({
            "factor": "Season",
            "value": data.get("season", "Maha"),
            "impact": 0.65,
            "impact_percentage": 15.0,
            "description": "Seasonal climate affects crop performance",
            "source": "ml_model",
        })
        
        # NPK Balance - with suggestion if applicable
        if npk_suggestion:
            factors.append({
                "factor": "NPK Balance",
                "value": npk_suggestion["current"],
                "impact": 0.60,
                "impact_percentage": npk_suggestion["current_impact"],
                "suggested_value": npk_suggestion["suggested"],
                "suggested_impact": npk_suggestion["suggested_impact"],
                "difference": npk_suggestion["difference"],
                "description": npk_suggestion["reason"],
                "source": "agronomic_suggestion",
            })
        else:
            factors.append({
                "factor": "NPK Balance",
                "value": f"N:{data.get('n_status_class', 'Medium')}",
                "impact": 0.60,
                "impact_percentage": 12.0,
                "description": "Nutrient balance impacts plant health",
                "source": "ml_model",
            })
        
        return factors
    else:
        # For rule-based, show actual multipliers with suggestions
        factors = []
        
        # Check if we have suggestions for key factors
        suggestion_map = {
            "seed_variety": variety_suggestion,
            "irrigation_type": irrigation_suggestion,
            "soil_fertility_index": fertility_suggestion,
        }
        
        for key, value in multipliers.items():
            impact_pct = (value - 1.0) * 100
            
            # Check if this factor has a suggestion
            suggestion = suggestion_map.get(key)
            
            if suggestion:
                # Use suggestion data
                factors.append({
                    "factor": key.replace("_", " ").title(),
                    "value": suggestion["current"],
                    "impact": value,
                    "impact_percentage": suggestion["current_impact"],
                    "suggested_value": suggestion["suggested"],
                    "suggested_impact": suggestion["suggested_impact"],
                    "difference": suggestion["difference"],
                    "description": suggestion["reason"],
                    "source": "agronomic_suggestion",
                })
            else:
                # Standard multiplier display
                if value > 1.0:
                    desc = f"Positive multiplier effect on base yield (+{impact_pct:.1f}%)"
                elif value < 1.0:
                    desc = f"Negative multiplier effect on base yield ({impact_pct:.1f}%)"
                else:
                    desc = "Neutral effect on base yield"
                
                factors.append({
                    "factor": key.replace("_", " ").title(),
                    "value": f"{value:.2f}x",
                    "impact": value,
                    "impact_percentage": impact_pct,
                    "description": desc,
                    "source": "rule_multiplier",
                })
        
        # Add NPK suggestion if applicable
        if npk_suggestion:
            factors.append({
                "factor": "NPK Balance",
                "value": npk_suggestion["current"],
                "impact": 0.88,
                "impact_percentage": npk_suggestion["current_impact"],
                "suggested_value": npk_suggestion["suggested"],
                "suggested_impact": npk_suggestion["suggested_impact"],
                "difference": npk_suggestion["difference"],
                "description": npk_suggestion["reason"],
                "source": "agronomic_suggestion",
            })
        
        # Sort by absolute impact
        factors.sort(key=lambda x: abs(x["impact_percentage"]), reverse=True)
        return factors  # Return all factors


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


def build_officer_insights(data: Dict, predicted_yield: float, method: str) -> Dict:
    """Build officer-specific insights"""
    
    # Calculate soil health score
    fertility = data.get("soil_fertility_index", 0.5)
    ph = data.get("soil_ph", 6.5)
    ph_score = 1.0 if 6.0 <= ph <= 7.0 else 0.8
    soil_health = (fertility + ph_score) / 2 * 10
    
    return {
        "soil_health_score": round(soil_health, 1),
        "fertilizer_efficiency": 0.85,
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
    Build data for charts and graphs with dynamic optimal values
    This will be used in the frontend for visualization
    """
    
    # Get dynamic optimal district yield
    district = data.get("district", "Badulla")
    variety = data.get("seed_variety", "GT 709")
    season = data.get("season", "Maha")
    optimal_district_yield = get_optimal_district_yield(district, variety, season)
    
    # Get soil health data
    ph = data.get("soil_ph", 6.5)
    n_status = data.get("n_status_class", "Medium")
    p_status = data.get("p_status_class", "Medium")
    k_status = data.get("k_status_class", "Medium")
    
    # Get NPK interpretation
    npk_interpretation = ""
    if p_status == "Low":
        npk_interpretation = "Phosphorus level is low → yield-limiting nutrient"
    elif n_status == "Low":
        npk_interpretation = "Nitrogen level is low → yield-limiting nutrient"
    elif k_status == "Low":
        npk_interpretation = "Potassium level is low → yield-limiting nutrient"
    else:
        npk_interpretation = "NPK levels are balanced for optimal growth"
    
    return {
        "yield_comparison": {
            "predicted": predicted_yield,
            "district_optimal": optimal_district_yield,
        },
        "npk_levels": {
            "nitrogen": data.get("soil_nitrogen_n", 60),
            "phosphorus": data.get("soil_phosphorus_p", 30),
            "potassium": data.get("soil_potassium_k", 180),
            "optimal_nitrogen": 80,
            "optimal_phosphorus": 40,
            "optimal_potassium": 200,
            "interpretation": npk_interpretation,
        },
        "environmental_factors": {
            "temperature": data.get("avg_temperature_c", 28),
            "humidity": data.get("avg_humidity_pct", 75),
            "rainfall_30d": data.get("rainfall_30d_mm", 150),
            "sunshine": data.get("sunshine_hours", 8.5),
            "ideal_ranges": {
                "temperature": {"min": 26, "max": 30, "unit": "°C"},
                "humidity": {"min": 60, "max": 80, "unit": "%"},
                "rainfall_30d": {"min": 80, "max": 150, "unit": "mm"},
                "sunshine": {"min": 7, "max": 9, "unit": "hrs"},
            },
        },
        "multiplier_breakdown": multipliers if multipliers else {},
        "soil_health": {
            "ph": ph,
            "ph_interpretation": get_ph_interpretation(ph),
            "fertility_index": data.get("soil_fertility_index", 0.5),
            "n_status": n_status,
            "p_status": p_status,
            "k_status": k_status,
            "limiting_factor": identify_limiting_npk_factor(n_status, p_status, k_status),
        },
    }
