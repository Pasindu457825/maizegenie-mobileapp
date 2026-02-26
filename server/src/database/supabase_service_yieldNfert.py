"""
Supabase Service for Yield Prediction & Fertilizer Advisory
Handles database operations for farmer inputs, predictions, and officer data
"""

from typing import Dict, Any, Optional
from datetime import datetime
import uuid
from core.supabase_client import supabase


# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def generate_uuid() -> str:
    """Generate a new UUID string"""
    return str(uuid.uuid4())


def get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat() + "Z"


# ============================================================
# FARMER INPUTS
# ============================================================

async def save_farmer_input(data: Dict[str, Any]) -> str:
    """
    Save farmer input data to database
    Returns: farmer_input_id
    """
    try:
        farmer_input_data = {
            "id": generate_uuid(),
            "farmer_id": data.get("farmer_id"),
            "district": data.get("district"),
            "location": data.get("location"),
            "season": data.get("season"),
            "planting_date": data.get("planting_date"),
            "planting_month": data.get("planting_month"),
            "land_size_value": data.get("land_size_value"),
            "land_size_unit": data.get("land_size_unit", "Acres"),
            "field_size_ha": data.get("field_size_ha"),
            "variety": data.get("variety"),
            # Fertilizer dates
            "first_fert_date": data.get("first_fert_date"),
            "second_fert_date": data.get("second_fert_date"),
            # Soil information
            "soil_type": data.get("soil_type"),
            "soil_condition": data.get("soil_condition"),
            "soil_ph": data.get("soil_ph"),
            "soil_nitrogen_n": data.get("soil_nitrogen_n"),
            "soil_phosphorus_p": data.get("soil_phosphorus_p"),
            "soil_potassium_k": data.get("soil_potassium_k"),
            "soil_fertility_index": data.get("soil_fertility_index"),
            # NPK Status
            "n_status_class": data.get("n_status_class"),
            "p_status_class": data.get("p_status_class"),
            "k_status_class": data.get("k_status_class"),
            # Field conditions
            "irrigation_type": data.get("irrigation_type"),
            "rainfall_condition": data.get("rainfall_condition"),
            # Weather data (complete)
            "rainfall_30d": data.get("rainfall_30d"),
            "seasonal_rainfall": data.get("seasonal_rainfall"),
            "avg_temperature": data.get("avg_temperature"),
            "max_temperature": data.get("max_temperature"),
            "avg_humidity": data.get("avg_humidity"),
            "sunshine_hours": data.get("sunshine_hours"),
            "created_at": get_current_timestamp(),
        }

        result = supabase.table("farmer_inputs").insert(farmer_input_data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"Error saving farmer input: {e}")
        raise


async def get_farmer_inputs(farmer_id: str, limit: int = 20) -> list:
    """Get farmer's input history"""
    try:
        result = (
            supabase.table("farmer_inputs")
            .select("*")
            .eq("farmer_id", farmer_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching farmer inputs: {e}")
        return []


# ============================================================
# PREDICTIONS
# ============================================================

async def save_prediction(farmer_input_id: str, prediction_data: Dict[str, Any]) -> str:
    """
    Save yield prediction results to database
    Returns: prediction_id
    """
    try:
        prediction_record = {
            "id": generate_uuid(),
            "farmer_input_id": farmer_input_id,
            "predicted_yield_kg_per_ha": prediction_data.get("predicted_yield_kg_per_ha"),
            "yield_lower_bound": prediction_data.get("yield_lower_bound"),
            "yield_upper_bound": prediction_data.get("yield_upper_bound"),
            "confidence_level": prediction_data.get("confidence_level"),
            "confidence_score": prediction_data.get("confidence_score"),
            "ml_model_version": prediction_data.get("ml_model_version"),
            "primary_limiting_factors": prediction_data.get("primary_limiting_factors"),
            "prediction_method": prediction_data.get("prediction_method"),
            "created_at": get_current_timestamp(),
        }

        result = supabase.table("yield_predictions").insert(prediction_record).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"Error saving prediction: {e}")
        raise


async def get_prediction(prediction_id: str) -> Optional[Dict]:
    """Get a specific yield prediction by ID"""
    try:
        result = (
            supabase.table("yield_predictions")
            .select("*, farmer_inputs(*)")
            .eq("id", prediction_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching prediction: {e}")
        return None


async def get_farmer_predictions(farmer_id: str, limit: int = 20) -> list:
    """Get farmer's yield prediction history"""
    try:
        result = (
            supabase.table("yield_predictions")
            .select("*, farmer_inputs!inner(*)")
            .eq("farmer_inputs.farmer_id", farmer_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching farmer predictions: {e}")
        return []


# ============================================================
# OFFICER PREDICTIONS
# ============================================================

async def save_officer_prediction(data: Dict[str, Any], prediction_type: str = "experimental") -> str:
    """
    Save officer prediction with fertilizer schedule
    
    Args:
        data: Prediction data
        prediction_type: "operational" (farmer-requested, persisted) or "experimental" (officer-initiated, not persisted)
    
    Returns: prediction_id
    
    Note:
        - "operational": Farmer-requested predictions are saved for advisory and research validation
        - "experimental": Officer-initiated predictions are NOT saved (for analysis only)
    """
    try:
        # Generate prediction ID regardless of type (for response tracking)
        prediction_id = generate_uuid()
        
        # Only persist operational (farmer-requested) predictions
        if prediction_type == "operational":
            officer_prediction_data = {
                "id": prediction_id,
                "officer_id": data.get("officer_id"),
                "farmer_id": data.get("farmer_id"),  # Link to farmer if requested by farmer
                "prediction_type": "operational",  # Mark as farmer-requested
                "soil_profile": data.get("soil_profile"),
                "climate_data": data.get("climate_data"),
                "crop_measurements": data.get("crop_measurements"),
                "fertilizer_applied": data.get("fertilizer_applied"),
                "predicted_yield": data.get("predicted_yield"),
                "fertilizer_schedule": data.get("fertilizer_schedule"),
                "impact_factors": data.get("impact_factors"),
                "recommendations": data.get("recommendations"),
                "officer_insights": data.get("officer_insights"),
                "created_at": get_current_timestamp(),
            }

            result = supabase.table("officer_predictions").insert(officer_prediction_data).execute()
            
            if result.data and len(result.data) > 0:
                print(f"✅ Saved operational prediction to database: {prediction_id}")
                return result.data[0]["id"]
            else:
                raise Exception("No data returned from insert")
        else:
            # Experimental predictions are NOT saved to database
            print(f"ℹ️  Experimental prediction (not saved): {prediction_id}")
            return prediction_id
            
    except Exception as e:
        print(f"Error saving officer prediction: {e}")
        raise


async def get_officer_prediction(prediction_id: str) -> Optional[Dict]:
    """Get a specific officer prediction by ID"""
    try:
        result = (
            supabase.table("officer_predictions")
            .select("*")
            .eq("id", prediction_id)
            .single()
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching officer prediction: {e}")
        return None


async def get_officer_predictions(officer_id: str, limit: int = 20) -> list:
    """Get officer's prediction history"""
    try:
        result = (
            supabase.table("officer_predictions")
            .select("*")
            .eq("officer_id", officer_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching officer predictions: {e}")
        return []


async def update_fertilizer_application(
    prediction_id: str,
    application_type: str,
    applied_amount: float,
    applied_date: str
) -> bool:
    """Update fertilizer application status"""
    try:
        # Get current prediction
        prediction = await get_officer_prediction(prediction_id)
        if not prediction:
            return False

        # Update fertilizer schedule
        fertilizer_schedule = prediction.get("fertilizer_schedule", {})
        
        # Find and update the specific application
        for app_key in ["basal", "topdress_1", "topdress_2"]:
            if app_key in fertilizer_schedule:
                app = fertilizer_schedule[app_key]
                if app.get("type") == application_type:
                    app["applied_amount"] = applied_amount
                    app["applied_date"] = applied_date
                    app["status"] = "done" if applied_amount >= app.get("recommended_amount", 0) * 0.9 else "partial"

        # Update in database
        result = (
            supabase.table("officer_predictions")
            .update({"fertilizer_schedule": fertilizer_schedule})
            .eq("id", prediction_id)
            .execute()
        )
        
        return True
    except Exception as e:
        print(f"Error updating fertilizer application: {e}")
        return False


# ============================================================
# DISTRICT BASELINES
# ============================================================

async def get_district_baseline(district: str, season: str) -> Optional[Dict]:
    """Get baseline yield data for a district and season"""
    try:
        # This would query historical data
        # For now, return default baselines
        baselines = {
            "Anuradhapura": {"Maha": 5500, "Yala": 4800},
            "Monaragala": {"Maha": 5200, "Yala": 4500},
            "Badulla": {"Maha": 5000, "Yala": 4300},
            "Ampara": {"Maha": 5300, "Yala": 4600},
            "Dambulla": {"Maha": 5400, "Yala": 4700},
        }
        
        return {
            "district": district,
            "season": season,
            "baseline_yield_kg_ha": baselines.get(district, {}).get(season, 5000),
            "sample_size": 100,  # Mock data
        }
    except Exception as e:
        print(f"Error fetching district baseline: {e}")
        return None


# ============================================================
# FERTILIZER ADVISORY
# ============================================================

async def save_fertilizer_advisory(data: Dict[str, Any]) -> str:
    """
    Save fertilizer advisory recommendation
    Returns: advisory_id
    """
    try:
        advisory_data = {
            "id": generate_uuid(),
            "farmer_id": data.get("farmer_id"),
            "soil_type": data.get("soil_type"),
            "crop_stage": data.get("crop_stage"),
            "area": data.get("area"),
            "last_fertilized": data.get("last_fertilized"),
            "fertilizer_type": data.get("fertilizer_type"),
            "recommendations": data.get("recommendations"),
            "nutrient_breakdown": data.get("nutrient_breakdown"),
            "application_schedule": data.get("application_schedule"),
            "created_at": get_current_timestamp(),
        }

        result = supabase.table("fertilizer_advisories").insert(advisory_data).execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]["id"]
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"Error saving fertilizer advisory: {e}")
        raise


async def get_fertilizer_advisories(farmer_id: str, limit: int = 20) -> list:
    """Get farmer's fertilizer advisory history"""
    try:
        result = (
            supabase.table("fertilizer_advisories")
            .select("*")
            .eq("farmer_id", farmer_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return result.data
    except Exception as e:
        print(f"Error fetching fertilizer advisories: {e}")
        return []
