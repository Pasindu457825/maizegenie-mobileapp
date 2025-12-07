"""
Fertilizer Calculation Service
Handles NPK requirements, balance calculations, and fertilizer scheduling
"""

from datetime import datetime, timedelta
from typing import Dict, Tuple, List
from .officer_models import (
    FertilizerSchedule, 
    FertilizerApplication, 
    BasalFertilizerApplication,
    OfficerPredictionRequest,
    FertilizerStatus
)
import uuid

# ============================================================
# NPK REQUIREMENT CALCULATIONS
# ============================================================

def calculate_npk_requirements(variety: str, expected_yield: float, soil_data: dict) -> Tuple[float, float, float]:
    """
    Calculate NPK requirements based on variety, expected yield, and soil conditions
    Returns: (nitrogen, phosphorus, potassium) in kg/ha
    """
    
    # Base NPK requirements per ton of yield
    base_npk_per_ton = {
        "Jet 999": {"N": 25, "P": 12, "K": 20},
        "Pacific 808": {"N": 24, "P": 11, "K": 19},
        "GT 709": {"N": 23, "P": 10, "K": 18},
        "GT200": {"N": 25, "P": 12, "K": 20},
        "Commando": {"N": 26, "P": 13, "K": 21},
    }
    
    # Default if variety not found
    npk_rates = base_npk_per_ton.get(variety, {"N": 25, "P": 12, "K": 20})
    
    # Convert yield from kg/ha to tons/ha
    yield_tons = expected_yield / 1000
    
    # Base requirements
    n_requirement = npk_rates["N"] * yield_tons
    p_requirement = npk_rates["P"] * yield_tons
    k_requirement = npk_rates["K"] * yield_tons
    
    # Soil adjustment factors
    # Adjust based on soil nutrient levels
    soil_n = soil_data.get('soil_nitrogen', 50)  # ppm
    soil_p = soil_data.get('soil_phosphorus', 25)  # ppm
    soil_k = soil_data.get('soil_potassium', 150)  # ppm
    
    # Soil adjustment multipliers (simple logic)
    if soil_n < 30:
        n_adjustment = 1.2  # Low N - increase requirement
    elif soil_n > 80:
        n_adjustment = 0.9  # High N - reduce requirement
    else:
        n_adjustment = 1.0
    
    if soil_p < 15:
        p_adjustment = 1.3
    elif soil_p > 40:
        p_adjustment = 0.8
    else:
        p_adjustment = 1.0
    
    if soil_k < 100:
        k_adjustment = 1.2
    elif soil_k > 200:
        k_adjustment = 0.9
    else:
        k_adjustment = 1.0
    
    # Apply adjustments
    n_requirement *= n_adjustment
    p_requirement *= p_adjustment
    k_requirement *= k_adjustment
    
    return round(n_requirement, 1), round(p_requirement, 1), round(k_requirement, 1)

# ============================================================
# FERTILIZER BALANCE CALCULATIONS
# ============================================================

def calculate_fertilizer_balance(
    total_n: float, 
    total_p: float, 
    total_k: float,
    fertilizer_applied: dict,
    planting_date: str
) -> Dict:
    """
    Calculate fertilizer balance and determine application status
    """
    
    # Parse planting date
    plant_date = datetime.fromisoformat(planting_date)
    today = datetime.now()
    days_since_planting = (today - plant_date).days
    
    # Standard fertilizer schedule (days after planting)
    basal_day = 0
    top_dress_1_day = 25
    top_dress_2_day = 45
    
    # NPK content in different fertilizer types
    # Assuming NPK 15:15:15 for basal, Urea (46% N) for top-dress
    basal_n_percent = 0.15
    basal_p_percent = 0.15
    basal_k_percent = 0.15
    urea_n_percent = 0.46
    
    # Calculate basal NPK contribution
    basal_npk = fertilizer_applied.get('basal_npk', 0)
    basal_n_provided = basal_npk * basal_n_percent
    basal_p_provided = basal_npk * basal_p_percent
    basal_k_provided = basal_npk * basal_k_percent
    
    # Calculate top-dress N contribution
    top_dress_1_amount = fertilizer_applied.get('top_dress_1_amount', 0) or 0
    top_dress_2_amount = fertilizer_applied.get('top_dress_2_amount', 0) or 0
    
    top_dress_1_n = top_dress_1_amount * urea_n_percent
    top_dress_2_n = top_dress_2_amount * urea_n_percent
    
    # Total applied
    total_n_applied = basal_n_provided + top_dress_1_n + top_dress_2_n
    total_p_applied = basal_p_provided  # Usually only from basal
    total_k_applied = basal_k_provided  # Usually only from basal
    
    # Remaining requirements
    remaining_n = max(0, total_n - total_n_applied)
    remaining_p = max(0, total_p - total_p_applied)
    remaining_k = max(0, total_k - total_k_applied)
    
    return {
        "total_requirements": {"N": total_n, "P": total_p, "K": total_k},
        "applied_nutrients": {"N": total_n_applied, "P": total_p_applied, "K": total_k_applied},
        "remaining_nutrients": {"N": remaining_n, "P": remaining_p, "K": remaining_k},
        "days_since_planting": days_since_planting,
        "schedule": {
            "basal_day": basal_day,
            "top_dress_1_day": top_dress_1_day,
            "top_dress_2_day": top_dress_2_day
        }
    }

# ============================================================
# STATUS DETERMINATION
# ============================================================

def determine_application_status(
    recommended_amount: float,
    applied_amount: float,
    application_day: int,
    days_since_planting: int,
    tolerance: float = 0.1
) -> FertilizerStatus:
    """
    Determine fertilizer application status
    """
    
    if days_since_planting < application_day - 3:  # Too early
        return 'pending'
    
    if applied_amount == 0:
        return 'pending'
    
    # Calculate percentage applied
    percent_applied = applied_amount / recommended_amount if recommended_amount > 0 else 1
    
    if percent_applied >= (1 - tolerance):  # Within 10% of recommended
        return 'done'
    elif percent_applied > 0:
        return 'partial'
    else:
        return 'pending'

# ============================================================
# FERTILIZER SCHEDULE GENERATION
# ============================================================

def generate_fertilizer_schedule(request: OfficerPredictionRequest, expected_yield: float) -> FertilizerSchedule:
    """
    Generate complete fertilizer schedule with status tracking
    """
    
    # Calculate NPK requirements
    soil_data = request.soil_profile.model_dump()
    total_n, total_p, total_k = calculate_npk_requirements(
        request.variety, 
        expected_yield, 
        soil_data
    )
    
    # Calculate balance
    balance = calculate_fertilizer_balance(
        total_n, total_p, total_k,
        request.fertilizer_applied.model_dump(),
        request.planting_date
    )
    
    # Parse planting date for schedule dates
    plant_date = datetime.fromisoformat(request.planting_date)
    
    # Generate basal application
    basal_date = plant_date
    basal_recommended = 250  # kg/ha NPK (standard recommendation)
    basal_applied = request.fertilizer_applied.basal_npk
    basal_remaining = max(0, basal_recommended - basal_applied)
    basal_status = determine_application_status(
        basal_recommended, basal_applied, 0, balance["days_since_planting"]
    )
    
    basal = BasalFertilizerApplication(
        date=basal_date.strftime("%Y-%m-%d"),
        day_number=0,
        recommended_amount=basal_recommended,
        applied_amount=basal_applied,
        remaining_amount=basal_remaining,
        status=basal_status,
        npk_amount=basal_recommended,
        adjustment_reason=f"Farmer applied {basal_applied} kg/ha" if basal_applied != basal_recommended else None,
        timing_warning=None,
        instructions_si="බීජ රෝපණ කාලයේදී NPK පොහොර කිලෝග්‍රෑම් 250ක් අක්කරයකට යොදන්න",
        instructions_en="Apply 250 kg NPK fertilizer per hectare at planting time"
    )
    
    # Generate top-dress 1
    td1_date = plant_date + timedelta(days=25)
    td1_recommended = round(balance["remaining_nutrients"]["N"] / 0.46 * 0.6, 1)  # 60% of remaining N as urea
    td1_applied = request.fertilizer_applied.top_dress_1_amount or 0
    td1_remaining = max(0, td1_recommended - td1_applied)
    td1_status = determine_application_status(
        td1_recommended, td1_applied, 25, balance["days_since_planting"]
    )
    
    top_dress_1 = FertilizerApplication(
        date=td1_date.strftime("%Y-%m-%d"),
        day_number=25,
        recommended_amount=td1_recommended,
        applied_amount=td1_applied,
        remaining_amount=td1_remaining,
        status=td1_status,
        adjustment_reason=f"Farmer applied {td1_applied} kg/ha on Day {balance['days_since_planting']}" if td1_applied != td1_recommended else None,
        timing_warning="Apply between Day 20-30 for optimal results" if balance["days_since_planting"] > 30 else None,
        instructions_si=f"නයිට්‍රජන් කිලෝග්‍රෑම් {td1_recommended}ක් යොදන්න (යූරියා කිලෝග්‍රෑම් {round(td1_recommended/0.46, 1)})",
        instructions_en=f"Apply {td1_recommended} kg nitrogen (equivalent to {round(td1_recommended/0.46, 1)} kg urea)"
    )
    
    # Generate top-dress 2
    td2_date = plant_date + timedelta(days=45)
    td2_recommended = round(balance["remaining_nutrients"]["N"] / 0.46 * 0.4, 1)  # 40% of remaining N as urea
    td2_applied = request.fertilizer_applied.top_dress_2_amount or 0
    td2_remaining = max(0, td2_recommended - td2_applied)
    td2_status = determine_application_status(
        td2_recommended, td2_applied, 45, balance["days_since_planting"]
    )
    
    top_dress_2 = FertilizerApplication(
        date=td2_date.strftime("%Y-%m-%d"),
        day_number=45,
        recommended_amount=td2_recommended,
        applied_amount=td2_applied,
        remaining_amount=td2_remaining,
        status=td2_status,
        adjustment_reason=f"Farmer applied {td2_applied} kg/ha" if td2_applied != td2_recommended else None,
        timing_warning=None,
        instructions_si=f"නයිට්‍රජන් කිලෝග්‍රෑම් {td2_recommended}ක් යොදන්න (යූරියා කිලෝග්‍රෑම් {round(td2_recommended/0.46, 1)})",
        instructions_en=f"Apply {td2_recommended} kg nitrogen (equivalent to {round(td2_recommended/0.46, 1)} kg urea)"
    )
    
    # Generate warnings
    warnings = []
    if balance["days_since_planting"] > 50 and td2_status == 'pending':
        warnings.append("Top-dress 2 application is overdue - may reduce yield")
    if basal_status == 'partial':
        warnings.append("Incomplete basal fertilizer application detected")
    
    # Calendar events
    calendar_events = [
        {
            "title": "Top-dress 1 Application",
            "date": td1_date.strftime("%Y-%m-%d"),
            "description": f"Apply {td1_recommended} kg nitrogen",
            "reminder_days_before": 2
        },
        {
            "title": "Top-dress 2 Application", 
            "date": td2_date.strftime("%Y-%m-%d"),
            "description": f"Apply {td2_recommended} kg nitrogen",
            "reminder_days_before": 2
        }
    ]
    
    return FertilizerSchedule(
        total_n_requirement=total_n,
        total_p_requirement=total_p,
        total_k_requirement=total_k,
        basal=basal,
        top_dress_1=top_dress_1,
        top_dress_2=top_dress_2,
        warnings=warnings,
        calendar_events=calendar_events
    )

# ============================================================
# RECOMMENDATIONS GENERATOR
# ============================================================

def generate_recommendations(request: OfficerPredictionRequest, fertilizer_schedule: FertilizerSchedule) -> List[dict]:
    """
    Generate agronomic recommendations based on data analysis
    """
    
    recommendations = []
    
    # Soil health recommendations
    soil_ph = request.soil_profile.soil_ph
    if soil_ph < 6.0:
        recommendations.append({
            "priority": "high",
            "category": "Soil Management",
            "title_si": "පාංශු pH අඩු වීම",
            "title_en": "Low Soil pH",
            "description_si": f"පාංශුවේ pH අගය {soil_ph} වන අතර එය අඩුයි. චුණ ගල් යෙදීමෙන් pH වැඩි දියුණු කරන්න",
            "description_en": f"Soil pH is {soil_ph}, which is too low. Apply lime to improve pH levels"
        })
    elif soil_ph > 8.0:
        recommendations.append({
            "priority": "medium",
            "category": "Soil Management", 
            "title_si": "පාංශු pH ඉහළ වීම",
            "title_en": "High Soil pH",
            "description_si": f"පාංශුවේ pH අගය {soil_ph} වන අතර එය ඉහළයි. කාබනික කොමිස්ට් යෙදීමෙන් pH අඩු කරන්න",
            "description_en": f"Soil pH is {soil_ph}, which is high. Apply organic compost to reduce pH"
        })
    
    # Nitrogen management
    if request.soil_profile.soil_nitrogen < 40:
        recommendations.append({
            "priority": "high",
            "category": "Nutrient Management",
            "title_si": "නයිට්‍රජන් හිඟකම",
            "title_en": "Nitrogen Deficiency",
            "description_si": "පාංශුවේ නයිට්‍රජන් මට්ටම අඩුයි. නිර්දේශිත පොහොර කාලසටහන නිවැරදිව පිළිපදින්න",
            "description_en": "Soil nitrogen levels are low. Follow the recommended fertilizer schedule carefully"
        })
    
    # Timing recommendations
    if any(app.status == 'pending' for app in [fertilizer_schedule.basal, fertilizer_schedule.top_dress_1, fertilizer_schedule.top_dress_2]):
        recommendations.append({
            "priority": "medium",
            "category": "Application Timing",
            "title_si": "පොහොර යෙදීමේ කාලසීමාව",
            "title_en": "Fertilizer Application Timing",
            "description_si": "නිර්දේශිත කාලසටහන අනුව පොහොර යෙදීම ඉතා වැදගත්යි",
            "description_en": "Timely fertilizer application according to schedule is crucial for optimal yield"
        })
    
    return recommendations

# ============================================================
# OFFICER INSIGHTS GENERATOR
# ============================================================

def generate_officer_insights(request: OfficerPredictionRequest, fertilizer_schedule: FertilizerSchedule) -> dict:
    """
    Generate officer-specific insights and analytics
    """
    
    # Calculate soil health score (0-10)
    soil_ph = request.soil_profile.soil_ph
    soil_n = request.soil_profile.soil_nitrogen
    soil_p = request.soil_profile.soil_phosphorus
    soil_k = request.soil_profile.soil_potassium
    organic_matter = request.soil_profile.organic_matter
    
    ph_score = 10 if 6.0 <= soil_ph <= 7.5 else max(0, 10 - abs(soil_ph - 6.75) * 2)
    n_score = min(10, soil_n / 8)  # Assuming 80 ppm is excellent
    p_score = min(10, soil_p / 4)  # Assuming 40 ppm is excellent  
    k_score = min(10, soil_k / 20)  # Assuming 200 ppm is excellent
    om_score = min(10, organic_matter)  # 10% OM is excellent
    
    soil_health_score = round((ph_score + n_score + p_score + k_score + om_score) / 5, 1)
    
    # Calculate fertilizer efficiency
    total_applied = (
        request.fertilizer_applied.basal_npk + 
        (request.fertilizer_applied.top_dress_1_amount or 0) +
        (request.fertilizer_applied.top_dress_2_amount or 0)
    )
    total_recommended = (
        fertilizer_schedule.basal.recommended_amount +
        fertilizer_schedule.top_dress_1.recommended_amount + 
        fertilizer_schedule.top_dress_2.recommended_amount
    )
    
    fertilizer_efficiency = min(1.0, total_applied / total_recommended if total_recommended > 0 else 0)
    
    # Expected ROI (simplified calculation)
    expected_roi = 1.5 + (soil_health_score / 10) * 0.5 + fertilizer_efficiency * 0.3
    
    # Risk factors
    risk_factors = []
    if soil_health_score < 5:
        risk_factors.append("Poor soil health may limit yield potential")
    if fertilizer_efficiency < 0.8:
        risk_factors.append("Suboptimal fertilizer application")
    if request.soil_profile.soil_ph < 5.5 or request.soil_profile.soil_ph > 8.5:
        risk_factors.append("Extreme soil pH levels")
    
    # Field visit recommendations
    field_visits = []
    if any(app.status == 'pending' for app in [fertilizer_schedule.top_dress_1, fertilizer_schedule.top_dress_2]):
        field_visits.append("Monitor upcoming fertilizer applications")
    if soil_health_score < 6:
        field_visits.append("Soil improvement consultation needed")
    field_visits.append("Regular crop monitoring recommended")
    
    return {
        "soil_health_score": soil_health_score,
        "fertilizer_efficiency": round(fertilizer_efficiency, 2),
        "expected_roi": round(expected_roi, 2),
        "risk_factors": risk_factors,
        "field_visit_recommendations": field_visits
    }
