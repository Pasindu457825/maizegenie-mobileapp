"""
Supabase Database Service
Handles all database operations for yield prediction and fertilizer advisory
"""

from supabase import create_client, Client
from src.core.config import settings
from typing import Dict, Any, Optional, List
from datetime import datetime
import uuid

# Initialize Supabase client
try:
    print(f"🔗 Initializing Supabase client...")
    print(f"   URL: {settings.SUPABASE_URL}")
    print(f"   Service Key: {settings.SUPABASE_SERVICE_KEY[:20]}...")
    supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    print(f"✅ Supabase client initialized successfully")
except Exception as e:
    print(f"❌ Failed to initialize Supabase client: {e}")
    raise

# ============================================================
# FARMER INPUTS
# ============================================================

async def save_farmer_input(data: Dict[str, Any]) -> str:
    """
    Save farmer input data to farmer_inputs table
    Returns: farmer_input_id (UUID)
    """
    try:
        # Convert land size to hectares if needed
        land_size_hectares = data.get('land_size_value', 0)
        if data.get('land_size_unit', '').lower() == 'acres':
            land_size_hectares = land_size_hectares * 0.404686  # Convert acres to hectares
        
        # Map rainfall_condition to rainfall_situation
        rainfall_mapping = {
            'Low': 'Low',
            'Normal': 'Normal', 
            'High': 'High',
            'low': 'Low',
            'normal': 'Normal',
            'high': 'High'
        }
        rainfall_situation = rainfall_mapping.get(data.get('rainfall_condition', 'Normal'), 'Normal')
        
        # Prepare record
        record = {
            'farmer_id': data['farmer_id'],
            'district': data['district'],
            'season': data['season'],
            'planting_date': data['planting_date'],
            'land_size_hectares': round(land_size_hectares, 2),
            'maize_variety': data.get('variety', 'Unknown'),
            'soil_condition': data['soil_condition'],
            'irrigation_type': data['irrigation_type'],
            'rainfall_situation': rainfall_situation,
            'pest_disease_issue': False,  # Default for simple farmer form
            'organic_fertilizer_used': False,  # Default for simple farmer form
            'farmer_message': data.get('farmer_message'),
            'status': 'completed'
        }
        
        # Insert into database
        print(f"📝 Attempting to insert farmer_input record...")
        print(f"   Record: {record}")
        
        result = supabase.table('farmer_inputs').insert(record).execute()
        
        print(f"📊 Supabase response: {result}")
        
        if result.data and len(result.data) > 0:
            farmer_input_id = result.data[0]['id']
            print(f"✅ Saved farmer_input: {farmer_input_id}")
            return farmer_input_id
        else:
            print(f"⚠️  No data in response. Full result: {result}")
            raise Exception(f"No data returned from insert. Result: {result}")
            
    except Exception as e:
        print(f"❌ Error saving farmer_input: {e}")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error details: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

# ============================================================
# PREDICTIONS
# ============================================================

async def save_prediction(
    farmer_input_id: str,
    prediction_data: Dict[str, Any]
) -> str:
    """
    Save prediction results to predictions table
    Returns: prediction_id (UUID)
    """
    try:
        record = {
            'farmer_input_id': farmer_input_id,
            'predicted_yield_kg_per_ha': prediction_data['predicted_yield_kg_per_ha'],
            'yield_lower_bound': prediction_data.get('yield_lower_bound'),
            'yield_upper_bound': prediction_data.get('yield_upper_bound'),
            'confidence_level': prediction_data['confidence_level'],
            'confidence_score': prediction_data.get('confidence_score', 0),
            'model_version': prediction_data.get('model_version', 'v1.0'),
            'primary_limiting_factors': prediction_data.get('primary_limiting_factors', []),
            'feature_importance': prediction_data.get('feature_importance'),
            'prediction_method': prediction_data.get('prediction_method', 'rule_based')
        }
        
        result = supabase.table('predictions').insert(record).execute()
        
        if result.data and len(result.data) > 0:
            prediction_id = result.data[0]['id']
            print(f"✅ Saved prediction: {prediction_id}")
            return prediction_id
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"❌ Error saving prediction: {e}")
        raise

# ============================================================
# FERTILIZER ADVICE (Officer Only)
# ============================================================

async def save_fertilizer_advice(
    prediction_id: str,
    farmer_id: str,
    fertilizer_data: Dict[str, Any]
) -> str:
    """
    Save fertilizer advice to fertilizer_advice table
    Only used for officer predictions
    Returns: fertilizer_advice_id (UUID)
    """
    try:
        record = {
            'prediction_id': prediction_id,
            'farmer_id': farmer_id,
            
            # Basal application
            'basal_urea_kg': fertilizer_data.get('basal_urea_kg', 0),
            'basal_tsp_kg': fertilizer_data.get('basal_tsp_kg', 0),
            'basal_mop_kg': fertilizer_data.get('basal_mop_kg', 0),
            'basal_application_date': fertilizer_data.get('basal_application_date'),
            'basal_status': fertilizer_data.get('basal_status', 'pending'),
            
            # First top dress
            'first_topdress_urea_kg': fertilizer_data.get('first_topdress_urea_kg', 0),
            'first_topdress_date': fertilizer_data.get('first_topdress_date'),
            'first_topdress_status': fertilizer_data.get('first_topdress_status', 'pending'),
            
            # Second top dress
            'second_topdress_urea_kg': fertilizer_data.get('second_topdress_urea_kg', 0),
            'second_topdress_mop_kg': fertilizer_data.get('second_topdress_mop_kg', 0),
            'second_topdress_date': fertilizer_data.get('second_topdress_date'),
            'second_topdress_status': fertilizer_data.get('second_topdress_status', 'pending'),
            
            # Totals
            'total_n_applied_kg': fertilizer_data.get('total_n_applied_kg'),
            'total_p_applied_kg': fertilizer_data.get('total_p_applied_kg'),
            'total_k_applied_kg': fertilizer_data.get('total_k_applied_kg'),
            
            # Advisory text
            'advisory_text_english': fertilizer_data.get('advisory_text_english'),
            'advisory_text_sinhala': fertilizer_data.get('advisory_text_sinhala'),
            
            # Review status
            'officer_reviewed': fertilizer_data.get('officer_reviewed', False),
            'officer_approved': fertilizer_data.get('officer_approved', False),
            'reviewed_by': fertilizer_data.get('reviewed_by'),
            'review_notes': fertilizer_data.get('review_notes')
        }
        
        result = supabase.table('fertilizer_advice').insert(record).execute()
        
        if result.data and len(result.data) > 0:
            advice_id = result.data[0]['id']
            print(f"✅ Saved fertilizer_advice: {advice_id}")
            return advice_id
        else:
            raise Exception("No data returned from insert")
            
    except Exception as e:
        print(f"❌ Error saving fertilizer_advice: {e}")
        raise

# ============================================================
# DISTRICT BASELINES
# ============================================================

async def get_district_baseline(district: str) -> Optional[Dict[str, Any]]:
    """
    Get district baseline data for fertilizer calculations
    Returns: baseline data or None
    """
    try:
        result = supabase.table('district_baselines')\
            .select('*')\
            .eq('district', district)\
            .execute()
        
        if result.data and len(result.data) > 0:
            print(f"✅ Retrieved baseline for {district}")
            return result.data[0]
        else:
            print(f"⚠️  No baseline found for {district}, using defaults")
            return None
            
    except Exception as e:
        print(f"❌ Error getting district baseline: {e}")
        return None

# ============================================================
# QUERY FUNCTIONS
# ============================================================

async def get_farmer_predictions(farmer_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get farmer's prediction history
    Returns: List of predictions with input data
    """
    try:
        result = supabase.table('predictions')\
            .select('*, farmer_inputs(*)')\
            .eq('farmer_inputs.farmer_id', farmer_id)\
            .order('created_at', desc=True)\
            .limit(limit)\
            .execute()
        
        return result.data if result.data else []
        
    except Exception as e:
        print(f"❌ Error getting farmer predictions: {e}")
        return []

async def get_prediction_by_id(prediction_id: str) -> Optional[Dict[str, Any]]:
    """
    Get specific prediction with all related data
    Returns: Complete prediction data or None
    """
    try:
        result = supabase.table('predictions')\
            .select('*, farmer_inputs(*), fertilizer_advice(*)')\
            .eq('id', prediction_id)\
            .execute()
        
        if result.data and len(result.data) > 0:
            return result.data[0]
        return None
        
    except Exception as e:
        print(f"❌ Error getting prediction: {e}")
        return None

# ============================================================
# UTILITY FUNCTIONS
# ============================================================

def generate_uuid() -> str:
    """Generate a new UUID string"""
    return str(uuid.uuid4())

def get_current_timestamp() -> str:
    """Get current timestamp in ISO format"""
    return datetime.utcnow().isoformat() + "Z"
