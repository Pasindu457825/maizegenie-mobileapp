"""
Variety and Irrigation Comparison Service
Provides potential yield improvements based on better seed varieties and irrigation systems
"""

from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Seed variety yield potential (kg/ha) - based on research data
VARIETY_YIELD_POTENTIAL = {
    "Commando": 5500,
    "GT200": 5800,
    "GT 709": 6000,
    "Jet 999": 5700,
    "Pacific 808": 6200,
    "Local Variety": 4500,
    "Unknown": 4500,
}

# Variety ranking (higher is better)
VARIETY_RANKING = {
    "Pacific 808": 1,
    "GT 709": 2,
    "GT200": 3,
    "Jet 999": 4,
    "Commando": 5,
    "Local Variety": 6,
    "Unknown": 6,
}

# Irrigation system yield multipliers
IRRIGATION_MULTIPLIERS = {
    "Irrigated": 1.0,      # Baseline (best)
    "Mixed": 0.92,         # 8% reduction
    "Rainfed": 0.85,       # 15% reduction
}

# Irrigation ranking (higher is better)
IRRIGATION_RANKING = {
    "Irrigated": 1,
    "Mixed": 2,
    "Rainfed": 3,
}


def get_variety_comparison(
    current_variety: str,
    predicted_yield: float,
    district: str = None,
    soil_condition: str = None
) -> Optional[Dict]:
    """
    Compare current variety with better alternatives
    
    Args:
        current_variety: Current seed variety used by farmer
        predicted_yield: Predicted yield with current variety (kg/ha)
        district: District name (for location-specific recommendations)
        soil_condition: Soil condition (Good/Medium/Poor)
    
    Returns:
        Dictionary with variety comparison data or None if no better variety exists
    """
    
    # Normalize variety name
    current_variety = current_variety.strip()
    if current_variety not in VARIETY_RANKING:
        current_variety = "Unknown"
    
    current_rank = VARIETY_RANKING[current_variety]
    current_potential = VARIETY_YIELD_POTENTIAL[current_variety]
    
    # Find best variety (rank 1)
    best_varieties = [v for v, r in VARIETY_RANKING.items() if r < current_rank]
    
    if not best_varieties:
        # Already using the best variety
        return None
    
    # Get the top recommended variety
    best_variety = min(best_varieties, key=lambda v: VARIETY_RANKING[v])
    best_potential = VARIETY_YIELD_POTENTIAL[best_variety]
    
    # Calculate potential yield increase
    # Use ratio of variety potentials to estimate improvement
    improvement_ratio = best_potential / current_potential
    potential_yield = predicted_yield * improvement_ratio
    yield_increase_percentage = ((potential_yield - predicted_yield) / predicted_yield) * 100
    
    # Apply soil condition adjustment
    if soil_condition == "Poor":
        # Poor soil reduces variety potential
        potential_yield *= 0.95
        yield_increase_percentage *= 0.95
    elif soil_condition == "Good":
        # Good soil enhances variety potential
        potential_yield *= 1.05
        yield_increase_percentage *= 1.05
    
    logger.info(f"Variety comparison: {current_variety} -> {best_variety}, "
                f"Yield increase: {yield_increase_percentage:.1f}%")
    
    return {
        "current_variety": current_variety,
        "suggested_variety": best_variety,
        "potential_yield": round(potential_yield, 2),
        "yield_increase_percentage": round(yield_increase_percentage, 2),
        "current_potential": current_potential,
        "suggested_potential": best_potential,
    }


def get_irrigation_comparison(
    current_irrigation: str,
    predicted_yield: float,
    rainfall_condition: str = None
) -> Optional[Dict]:
    """
    Compare current irrigation with better alternatives
    
    Args:
        current_irrigation: Current irrigation type (Irrigated/Mixed/Rainfed)
        predicted_yield: Predicted yield with current irrigation (kg/ha)
        rainfall_condition: Rainfall condition (High/Normal/Low)
    
    Returns:
        Dictionary with irrigation comparison data or None if already optimal
    """
    
    # Normalize irrigation type
    current_irrigation = current_irrigation.strip()
    if current_irrigation not in IRRIGATION_RANKING:
        current_irrigation = "Rainfed"
    
    current_rank = IRRIGATION_RANKING[current_irrigation]
    current_multiplier = IRRIGATION_MULTIPLIERS[current_irrigation]
    
    # Check if already using best irrigation
    if current_rank == 1:
        return None
    
    # Suggest best irrigation (Irrigated)
    suggested_irrigation = "Irrigated"
    suggested_multiplier = IRRIGATION_MULTIPLIERS[suggested_irrigation]
    
    # Calculate potential yield with better irrigation
    # Reverse current multiplier effect, then apply suggested multiplier
    base_yield = predicted_yield / current_multiplier
    potential_yield = base_yield * suggested_multiplier
    yield_increase_percentage = ((potential_yield - predicted_yield) / predicted_yield) * 100
    
    # Adjust based on rainfall condition
    if rainfall_condition == "High":
        # High rainfall reduces irrigation benefit
        yield_increase_percentage *= 0.7
        potential_yield = predicted_yield * (1 + yield_increase_percentage / 100)
    elif rainfall_condition == "Low":
        # Low rainfall increases irrigation benefit
        yield_increase_percentage *= 1.2
        potential_yield = predicted_yield * (1 + yield_increase_percentage / 100)
    
    logger.info(f"Irrigation comparison: {current_irrigation} -> {suggested_irrigation}, "
                f"Yield increase: {yield_increase_percentage:.1f}%")
    
    return {
        "current_irrigation": current_irrigation,
        "suggested_irrigation": suggested_irrigation,
        "potential_yield": round(potential_yield, 2),
        "yield_increase_percentage": round(yield_increase_percentage, 2),
        "current_multiplier": current_multiplier,
        "suggested_multiplier": suggested_multiplier,
    }


def calculate_confidence_score(
    prediction_method: str,
    soil_data_quality: str,
    weather_data_quality: str,
    model_r2_score: float = 0.56
) -> Tuple[float, str]:
    """
    Calculate confidence score for yield prediction
    
    Args:
        prediction_method: "ml_model" or "rule_based"
        soil_data_quality: "complete", "partial", or "estimated"
        weather_data_quality: "live", "seasonal", or "estimated"
        model_r2_score: R² score of the ML model (default 0.56 from training)
    
    Returns:
        Tuple of (confidence_score, confidence_level)
        confidence_score: 0.0 to 1.0 (will be displayed as 0-100%)
        confidence_level: "High", "Medium", or "Low"
    """
    
    # Base confidence from model performance
    if prediction_method == "ml_model":
        base_confidence = model_r2_score  # 0.56 = 56%
    else:
        base_confidence = 0.50  # Rule-based has lower base confidence
    
    # Adjust for data quality
    soil_adjustment = {
        "complete": 1.0,
        "partial": 0.95,
        "estimated": 0.85
    }.get(soil_data_quality, 0.85)
    
    weather_adjustment = {
        "live": 1.0,
        "seasonal": 0.95,
        "estimated": 0.90
    }.get(weather_data_quality, 0.90)
    
    # Calculate final confidence (ensure it stays between 0 and 1)
    confidence_score = min(base_confidence * soil_adjustment * weather_adjustment, 0.95)
    confidence_score = max(confidence_score, 0.30)  # Minimum 30%
    
    # Determine confidence level
    if confidence_score >= 0.70:
        confidence_level = "High"
    elif confidence_score >= 0.50:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"
    
    logger.info(f"Confidence calculation: method={prediction_method}, "
                f"soil={soil_data_quality}, weather={weather_data_quality}, "
                f"score={confidence_score:.2f} ({confidence_level})")
    
    return confidence_score, confidence_level
