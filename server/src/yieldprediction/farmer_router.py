"""
Farmer Yield Prediction Router
Simple yield prediction endpoint for farmers
"""

from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from typing import Dict, Any
from core.auth_dependencies import get_current_user

from .farmer_models import (
    FarmerPredictionRequest,
    FarmerPredictionResponse,
    PredictionErrorResponse,
    PredictionData,
    ImpactFactor,
    Recommendation
)
from .service import predict_yield_service, build_impact_factors
try:
    from .ml_prediction_service import MODEL_LOADED as USE_ML
except ImportError:
    USE_ML = False
from .comparison_service import (
    get_variety_comparison,
    get_irrigation_comparison,
    calculate_confidence_score
)
from src.database.supabase_service_yieldNfert import (
    save_farmer_input,
    save_prediction,
    get_district_baseline,
    generate_uuid,
    get_current_timestamp
)

# Create router
router = APIRouter(prefix="/api/v1", tags=["Farmer Yield Prediction"])

@router.post("/yield-prediction/farmer", response_model=FarmerPredictionResponse)
async def predict_yield_farmer(
    request: FarmerPredictionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Simple yield prediction for farmers
    
    Features:
    - Basic yield prediction with ML/rule-based fallback
    - Impact factor analysis
    - General farming recommendations (NO fertilizer schedules)
    - Saves to database for history tracking
    - Bilingual output (English + Sinhala)
    
    Farmers do NOT receive fertilizer schedules - only officers get those.
    """
    try:
        # ✅ Use authenticated user ID instead of request body
        authenticated_farmer_id = current_user["id"]
        
        print(f"\n{'='*60}")
        print(f"🌾 FARMER PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"🔐 Authenticated Farmer ID: {authenticated_farmer_id}")
        print(f"📧 Email: {current_user.get('email', 'N/A')}")
        print(f"District: {request.district}")
        print(f"Season: {request.season}")
        print(f"Variety: {request.variety}")
        print(f"{'='*60}\n")
        
        # Generate IDs
        prediction_id = generate_uuid()
        timestamp = get_current_timestamp()
        
        # Normalize season to "Maha" or "Yala" (remove "Season" suffix if present)
        season_normalized = request.season.replace(" Season", "").replace("වාරය", "").strip()
        if "මහ" in season_normalized:
            season_normalized = "Maha"
        elif "යල" in season_normalized:
            season_normalized = "Yala"
        
        # Step 1: Save farmer input to database
        try:
            # Override farmer_id with authenticated user ID
            input_data = request.model_dump()
            input_data['farmer_id'] = authenticated_farmer_id  # ✅ Use verified ID
            input_data['season'] = season_normalized  # ✅ Save normalized season
            
            print(f"🔍 DEBUG: Attempting to save farmer input for farmer_id: {authenticated_farmer_id}")
            print(f"🔍 DEBUG: Input data keys: {list(input_data.keys())}")
            
            farmer_input_id = await save_farmer_input(input_data)
            print(f"✅ Saved to farmer_inputs table: {farmer_input_id}")
        except Exception as db_error:
            print(f"❌ DATABASE SAVE FAILED!")
            print(f"❌ Error type: {type(db_error).__name__}")
            print(f"❌ Error message: {str(db_error)}")
            import traceback
            print(f"❌ Full traceback:")
            traceback.print_exc()
            # Continue with prediction even if DB save fails
            farmer_input_id = generate_uuid()
        
        # Step 2: Prepare data for prediction model
        # Convert land size to ACRES (ML model trained with acres)
        land_size_acres = request.land_size_value
        if request.land_size_unit.lower() == 'hectares':
            # Convert hectares to acres (1 hectare = 2.47105 acres)
            land_size_acres = request.land_size_value * 2.47105
            print(f"🔄 Converted {request.land_size_value} hectares to {land_size_acres:.2f} acres")
        
        # Step 3: Run yield prediction
        try:
            # Prepare data for prediction service (IDENTICAL to officer structure)
            prediction_input = {
                # Location
                'district': request.district,
                'location': request.location,
                
                # Crop details
                'variety': request.variety,
                'planting_date': request.planting_date,
                'planting_month': request.planting_month,
                'season': season_normalized,
                'field_size_ha': request.field_size_ha,
                
                # Fertilizer dates
                'first_fert_date': request.first_fert_date,
                'second_fert_date': request.second_fert_date,
                
                # Soil information
                'soil_type': request.soil_type,
                'soil_condition': request.soil_condition,
                'soil_ph': request.soil_ph,
                'soil_nitrogen_n': request.soil_nitrogen_n,
                'soil_phosphorus_p': request.soil_phosphorus_p,
                'soil_potassium_k': request.soil_potassium_k,
                'soil_fertility_index': request.soil_fertility_index,
                
                # NPK Status Classification
                'n_status_class': request.n_status_class,
                'p_status_class': request.p_status_class,
                'k_status_class': request.k_status_class,
                
                # Field conditions
                'irrigation_type': request.irrigation_type,
                'rainfall_condition': request.rainfall_condition,
                
                # Weather data (complete)
                'rainfall_30d_mm': request.rainfall_30d,
                'seasonal_rainfall_mm': request.seasonal_rainfall,
                'avg_temperature_c': request.avg_temperature,
                'max_temperature_c': request.max_temperature,
                'avg_humidity_pct': request.avg_humidity,
                'sunshine_hours': request.sunshine_hours,
            }
            
            print(f"🔄 Calling prediction service...")
            result = predict_yield_service(prediction_input)
            predicted_yield = result.get('predicted_yield')  # kg/ha from service
            prediction_method = result.get('prediction_method', 'unknown')
            model_version = result.get('model_version', 'unknown')
            
            if predicted_yield is None:
                raise ValueError("Prediction service returned no yield value")
            
            print(f"📊 Predicted Yield: {predicted_yield:.2f} kg/ha")
            print(f"🤖 Prediction Method: {prediction_method}")
            print(f"📦 Model Version: {model_version}")
            
            # Store full result for response
            ml_factors = result.get('factors', [])
            ml_harvest_window = result.get('harvest_window', {})
            
        except Exception as pred_error:
            print(f"❌ Prediction error: {pred_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Prediction failed: {str(pred_error)}"
            )
        
        # Step 4: Calculate confidence based on weather data source
        weather_data_source = request.weather_data_source or "auto"
        
        if weather_data_source == "auto":
            # Auto-filled weather data: 70% base confidence
            confidence_score = 70.0
            print(f"📊 Confidence: Auto-filled weather data (70% base)")
        else:
            # Manually entered weather data: 70-85% confidence
            confidence_score = 75.0  # Start at 75% for manual entry
            print(f"📊 Confidence: Manual weather data (75% base)")
            
            # Boost for good conditions (up to 85%)
            if request.soil_condition == 'Good' and request.irrigation_type == 'Irrigated':
                confidence_score += 10
            elif request.soil_condition == 'Good' or request.irrigation_type == 'Irrigated':
                confidence_score += 5
            
            # Cap at 85% for manual entry
            confidence_score = min(confidence_score, 85.0)
        
        # Adjust for poor conditions (applies to both auto and manual)
        if request.soil_condition == 'Poor':
            confidence_score -= 10
        if request.rainfall_condition == 'Low' and request.irrigation_type == 'Rainfed':
            confidence_score -= 8
        
        # Ensure confidence stays within bounds
        # Auto: max 70%, Manual: 70-85%
        if weather_data_source == "auto":
            confidence_score = max(50, min(70, confidence_score))
        else:
            confidence_score = max(60, min(85, confidence_score))
        
        if confidence_score >= 80:
            confidence_level = 'High'
        elif confidence_score >= 65:
            confidence_level = 'Medium'
        else:
            confidence_level = 'Low'
        
        print(f"✅ Final Confidence: {confidence_score:.1f}% ({confidence_level})")
        
        # Calculate yield bounds (±15%)
        yield_lower = predicted_yield * 0.85
        yield_upper = predicted_yield * 1.15
        
        # Step 5: Build impact factors
        # Use ML factors if available, otherwise build simplified factors
        if ml_factors and len(ml_factors) > 0:
            print(f"✅ Using {len(ml_factors)} ML-based impact factors")
            impact_factors = convert_ml_factors_to_farmer_format(ml_factors)
        else:
            print(f"⚠️ Using simplified impact factors")
            impact_factors = build_farmer_impact_factors(
                soil_condition=request.soil_condition,
                irrigation_type=request.irrigation_type,
                rainfall_condition=request.rainfall_condition,
                variety=request.variety,
                season=request.season
            )
        
        # Identify primary limiting factors
        primary_limiting = []
        if request.soil_condition == 'Poor':
            primary_limiting.append('POOR_SOIL_QUALITY')
        if request.rainfall_condition == 'Low':
            primary_limiting.append('LOW_RAINFALL')
        if request.irrigation_type == 'Rainfed' and request.rainfall_condition != 'High':
            primary_limiting.append('INSUFFICIENT_WATER')
        
        if not primary_limiting:
            primary_limiting.append('OPTIMAL_CONDITIONS')
        
        # Step 6: Generate recommendations (general farming advice, NO fertilizer)
        recommendations = generate_farmer_recommendations(
            soil_condition=request.soil_condition,
            irrigation_type=request.irrigation_type,
            rainfall_condition=request.rainfall_condition,
            season=request.season
        )
        
        # Step 7: Create prediction data object
        prediction_data = PredictionData(
            predicted_yield_kg_per_ha=round(predicted_yield, 2),
            predicted_yield_tons_per_ha=round(predicted_yield / 1000, 2),
            confidence_level=confidence_level,
            confidence_score=round(confidence_score, 1),
            yield_lower_bound=round(yield_lower, 2),
            yield_upper_bound=round(yield_upper, 2),
            prediction_method=prediction_method,  # Use actual method from service
            ml_model_version=model_version  # Use actual version from service
        )
        
        # Step 8: Save prediction to database
        try:
            await save_prediction(
                farmer_input_id=farmer_input_id,
                prediction_data={
                    'predicted_yield_kg_per_ha': prediction_data.predicted_yield_kg_per_ha,
                    'yield_lower_bound': prediction_data.yield_lower_bound,
                    'yield_upper_bound': prediction_data.yield_upper_bound,
                    'confidence_level': prediction_data.confidence_level,
                    'confidence_score': prediction_data.confidence_score,
                    'ml_model_version': prediction_data.ml_model_version,
                    'primary_limiting_factors': primary_limiting,
                    'prediction_method': prediction_data.prediction_method
                }
            )
            print(f"✅ Saved to yield_predictions table")
        except Exception as db_error:
            print(f"⚠️  Prediction save failed: {db_error}")
            # Continue even if DB save fails
        
        # Step 9: Calculate district optimal yield for comparison
        from .officer_service import get_optimal_district_yield
        district_optimal_yield = get_optimal_district_yield(
            district=request.district,
            variety=request.variety,
            season=request.season
        )
        
        # Calculate comparison percentage
        comparison_percentage = ((predicted_yield - district_optimal_yield) / district_optimal_yield) * 100
        
        print(f"📊 District Optimal: {district_optimal_yield:.2f} kg/ha")
        print(f"📈 Comparison: {comparison_percentage:+.1f}% vs district optimal")
        
        # Step 10: Generate summary messages
        yield_tons = prediction_data.predicted_yield_tons_per_ha
        
        summary_english = f"Expected yield: {yield_tons:.1f} tons per hectare with {confidence_level.lower()} confidence. "
        summary_sinhala = f"අපේක්ෂිත අස්වැන්න: හෙක්ටයාරයකට ටොන් {yield_tons:.1f} {confidence_level} විශ්වාසයෙන්. "
        
        if request.soil_condition == 'Good':
            summary_english += "Your soil quality is excellent for maize cultivation."
            summary_sinhala += "ඔබේ පස් තත්ත්වය බඩඉරිඟු වගාව සඳහා විශිෂ්ටයි."
        elif request.soil_condition == 'Poor':
            summary_english += "Consider soil improvement for better yields."
            summary_sinhala += "වඩා හොඳ අස්වැන්නක් සඳහා පස වැඩිදියුණු කිරීම සලකා බලන්න."
        
        # Step 11: Get variety and irrigation comparisons
        variety_comparison = get_variety_comparison(
            current_variety=request.variety,
            predicted_yield=predicted_yield,
            district=request.district,
            soil_condition=request.soil_condition
        )
        
        irrigation_comparison = get_irrigation_comparison(
            current_irrigation=request.irrigation_type,
            predicted_yield=predicted_yield,
            rainfall_condition=request.rainfall_condition
        )
        
        # Log comparison results
        if variety_comparison:
            print(f"🌱 Variety suggestion: {variety_comparison['suggested_variety']} "
                  f"(+{variety_comparison['yield_increase_percentage']:.1f}%)")
        if irrigation_comparison:
            print(f"💧 Irrigation suggestion: {irrigation_comparison['suggested_irrigation']} "
                  f"(+{irrigation_comparison['yield_increase_percentage']:.1f}%)")
        
        # Step 12: Build response with comparison data
        response = FarmerPredictionResponse(
            prediction_id=prediction_id,
            farmer_input_id=farmer_input_id,
            timestamp=timestamp,
            prediction=prediction_data,
            impact_factors=impact_factors,
            primary_limiting_factors=primary_limiting,
            recommendations=recommendations,
            summary_english=summary_english,
            summary_sinhala=summary_sinhala,
            status='completed',
            yield_comparison={
                'predicted_yield_kg_ha': round(predicted_yield, 2),
                'district_optimal_kg_ha': round(district_optimal_yield, 2),
                'difference_kg_ha': round(predicted_yield - district_optimal_yield, 2),
                'percentage_difference': round(comparison_percentage, 1),
                'district': request.district,
                'variety': request.variety,
                'season': request.season
            },
            variety_comparison=variety_comparison,
            irrigation_comparison=irrigation_comparison
        )
        
        print(f"\n{'='*60}")
        print(f"✅ FARMER PREDICTION COMPLETED")
        print(f"Prediction ID: {prediction_id}")
        print(f"Yield: {yield_tons:.2f} t/ha")
        print(f"Confidence: {confidence_level} ({confidence_score:.1f}%)")
        print(f"{'='*60}\n")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        error_response = PredictionErrorResponse(
            message=f"Yield prediction failed: {str(e)}",
            details={"error_type": type(e).__name__},
            timestamp=get_current_timestamp(),
            status='failed'
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response.model_dump()
        )

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def convert_ml_factors_to_farmer_format(ml_factors: list) -> list[ImpactFactor]:
    """
    Convert ML model factors to farmer-friendly ImpactFactor format
    ML factors have: name, impact, value, importance
    """
    farmer_factors = []
    
    for factor in ml_factors:
        factor_name = factor.get('name', 'Unknown')
        impact = factor.get('impact', 'neutral')
        importance = factor.get('importance', 0.5)
        
        # Create bilingual descriptions
        description_map = {
            'Nitrogen Status': {
                'en': 'Nitrogen levels affect plant growth and leaf development',
                'si': 'නයිට්‍රජන් මට්ටම් ශාක වර්ධනය සහ කොළ වර්ධනයට බලපායි'
            },
            'Soil Condition': {
                'en': 'Soil quality affects nutrient availability and root growth',
                'si': 'පස් තත්ත්වය පෝෂක ලබා ගැනීම සහ මූල වර්ධනයට බලපායි'
            },
            'Soil Fertility Index': {
                'en': 'Overall soil health impacts crop productivity',
                'si': 'සමස්ත පස් සෞඛ්‍යය බෝග ඵලදායිතාවයට බලපායි'
            },
            'Irrigation Type': {
                'en': 'Water management affects plant stress and yield',
                'si': 'ජල කළමනාකරණය ශාක ආතතිය සහ අස්වැන්නට බලපායි'
            },
            'Seed Variety': {
                'en': 'Variety selection determines yield potential',
                'si': 'ප්‍රභේද තෝරා ගැනීම අස්වැන්න විභවය තීරණය කරයි'
            },
            'Season': {
                'en': 'Growing season affects rainfall and temperature',
                'si': 'වගා කන්නය වර්ෂාපතනය සහ උෂ්ණත්වයට බලපායි'
            }
        }
        
        descriptions = description_map.get(factor_name, {
            'en': f'{factor_name} affects crop yield',
            'si': f'{factor_name} බෝග අස්වැන්නට බලපායි'
        })
        
        farmer_factors.append(ImpactFactor(
            factor=factor_name,
            impact=impact,
            description_english=descriptions['en'],
            description_sinhala=descriptions['si'],
            weight=importance
        ))
    
    return farmer_factors

def build_farmer_impact_factors(
    soil_condition: str,
    irrigation_type: str,
    rainfall_condition: str,
    variety: str,
    season: str
) -> list[ImpactFactor]:
    """Build impact factors for farmer display"""
    factors = []
    
    # Soil impact
    soil_impact_map = {'Good': 'positive', 'Medium': 'neutral', 'Poor': 'negative'}
    soil_weight_map = {'Good': 0.9, 'Medium': 0.7, 'Poor': 0.5}
    
    factors.append(ImpactFactor(
        factor='Soil Quality',
        impact=soil_impact_map.get(soil_condition, 'neutral'),
        description_english=f'{soil_condition} soil condition affects nutrient availability',
        description_sinhala=f'{soil_condition} පස් තත්ත්වය පෝෂක ලබා ගැනීමට බලපායි',
        weight=soil_weight_map.get(soil_condition, 0.7)
    ))
    
    # Irrigation impact
    irrigation_impact_map = {'Irrigated': 'positive', 'Mixed': 'neutral', 'Rainfed': 'negative'}
    irrigation_weight_map = {'Irrigated': 1.0, 'Mixed': 0.8, 'Rainfed': 0.6}
    
    factors.append(ImpactFactor(
        factor='Water Availability',
        impact=irrigation_impact_map.get(irrigation_type, 'neutral'),
        description_english=f'{irrigation_type} water supply affects plant growth',
        description_sinhala=f'{irrigation_type} ජල සැපයුම ශාක වර්ධනයට බලපායි',
        weight=irrigation_weight_map.get(irrigation_type, 0.8)
    ))
    
    # Rainfall impact
    rainfall_impact_map = {'High': 'positive', 'Normal': 'neutral', 'Low': 'negative'}
    rainfall_weight_map = {'High': 1.0, 'Normal': 0.85, 'Low': 0.6}
    
    factors.append(ImpactFactor(
        factor='Rainfall',
        impact=rainfall_impact_map.get(rainfall_condition, 'neutral'),
        description_english=f'{rainfall_condition} rainfall affects water stress',
        description_sinhala=f'{rainfall_condition} වර්ෂාපතනය ජල ආතතියට බලපායි',
        weight=rainfall_weight_map.get(rainfall_condition, 0.85)
    ))
    
    # Season impact
    season_impact = 'positive' if season == 'Maha' else 'neutral'
    season_weight = 0.9 if season == 'Maha' else 0.75
    
    factors.append(ImpactFactor(
        factor='Growing Season',
        impact=season_impact,
        description_english=f'{season} season provides suitable growing conditions',
        description_sinhala=f'{season} කන්නය සුදුසු වගා කොන්දේසි සපයයි',
        weight=season_weight
    ))
    
    return factors

def generate_farmer_recommendations(
    soil_condition: str,
    irrigation_type: str,
    rainfall_condition: str,
    season: str
) -> list[Recommendation]:
    """
    Generate general farming recommendations for farmers
    NO fertilizer schedules - only general advice
    """
    recommendations = []
    
    # Soil management
    if soil_condition == 'Poor':
        recommendations.append(Recommendation(
            priority='high',
            title_english='Improve Soil Quality',
            title_sinhala='පස් තත්ත්වය වැඩිදියුණු කරන්න',
            description_english='Add organic matter and consider soil testing for nutrient deficiencies.',
            description_sinhala='කාබනික ද්‍රව්‍ය එකතු කර පෝෂක ඌනතා සඳහා පස පරීක්ෂා කිරීම සලකා බලන්න.',
            icon='leaf'
        ))
    
    # Water management
    if irrigation_type == 'Rainfed' and rainfall_condition == 'Low':
        recommendations.append(Recommendation(
            priority='high',
            title_english='Water Management Critical',
            title_sinhala='ජල කළමනාකරණය ඉතා වැදගත්',
            description_english='Consider supplementary irrigation or water conservation techniques.',
            description_sinhala='අතිරේක වාරිමාර්ග හෝ ජල සංරක්ෂණ ක්‍රම සලකා බලන්න.',
            icon='droplet'
        ))
    
    # Seasonal advice
    if season == 'Yala':
        recommendations.append(Recommendation(
            priority='medium',
            title_english='Yala Season Care',
            title_sinhala='යල කන්නයේ සැලකිල්ල',
            description_english='Monitor water availability closely during dry periods.',
            description_sinhala='වියළි කාලවලදී ජල ලබා ගැනීම සමීපව නිරීක්ෂණය කරන්න.',
            icon='sun'
        ))
    
    # General pest management
    recommendations.append(Recommendation(
        priority='medium',
        title_english='Pest and Disease Monitoring',
        title_sinhala='පළිබෝධ හා රෝග නිරීක්ෂණය',
        description_english='Regularly inspect plants for pests and diseases. Early detection is key.',
        description_sinhala='පළිබෝධ සහ රෝග සඳහා නිතිපතා පරීක්ෂා කරන්න. කල්තියා හඳුනා ගැනීම ප්‍රධානයි.',
        icon='bug'
    ))
    
    # Weed management
    recommendations.append(Recommendation(
        priority='medium',
        title_english='Weed Control',
        title_sinhala='වල් පැලෑටි පාලනය',
        description_english='Keep field weed-free, especially in first 6 weeks after planting.',
        description_sinhala='වගා කිරීමෙන් පසු පළමු සති 6 තුළ විශේෂයෙන් කෙත වල් පැලෑටි රහිතව තබා ගන්න.',
        icon='scissors'
    ))
    
    # Harvest timing
    recommendations.append(Recommendation(
        priority='low',
        title_english='Optimal Harvest Time',
        title_sinhala='ප්‍රශස්ත අස්වනු නෙලීමේ කාලය',
        description_english='Harvest when kernels are at 20-25% moisture for best quality.',
        description_sinhala='හොඳම ගුණාත්මකභාවය සඳහා ධාන්‍ය 20-25% තෙතමනයේ ඇති විට අස්වනු නෙලන්න.',
        icon='calendar'
    ))
    
    return recommendations

@router.get("/yield-prediction/farmer/history")
async def get_farmer_prediction_history(
    current_user: dict = Depends(get_current_user),
    limit: int = 10
):
    """
    Get prediction history for authenticated farmer
    
    Args:
        current_user: Authenticated user from JWT token
        limit: Maximum number of predictions to return (default: 10)
        
    Returns:
        List of farmer's past predictions with shareable text
    """
    try:
        farmer_id = current_user["id"]
        
        print(f"📊 Fetching prediction history for farmer: {farmer_id}")
        
        # Query database for farmer's predictions
        from core.supabase_client import supabase
        
        response = supabase.table("farmer_inputs") \
            .select("*, yield_predictions(*)") \
            .eq("farmer_id", farmer_id) \
            .order("created_at", desc=True) \
            .limit(limit) \
            .execute()
        
        predictions = response.data if response.data else []
        
        # Format predictions with shareable text
        formatted_predictions = []
        for pred in predictions:
            # Debug: Print prediction data to see field names
            print(f"🔍 DEBUG - Prediction fields: {pred.keys()}")
            print(f"🔍 DEBUG - Variety value: {pred.get('variety')}")
            
            # Generate shareable text for officer chat
            shareable_text = generate_shareable_text(pred)
            
            # Extract prediction details from yield_predictions table
            prediction_data = pred.get("yield_predictions", [])
            predicted_yield = None
            confidence_level = None
            
            if prediction_data and len(prediction_data) > 0:
                latest_prediction = prediction_data[0]  # Get most recent prediction
                predicted_yield = latest_prediction.get("predicted_yield_kg_per_ha")
                confidence_level = latest_prediction.get("confidence_level")
            
            # Handle both 'variety' and 'seed_variety' field names
            variety = pred.get("variety") or pred.get("seed_variety")
            
            formatted_predictions.append({
                "id": pred.get("id"),
                "district": pred.get("district"),
                "season": pred.get("season"),
                "variety": variety,
                "land_size": f"{pred.get('land_size_value')} {pred.get('land_size_unit')}",
                "planting_date": pred.get("planting_date"),
                "created_at": pred.get("created_at"),
                "predicted_yield": predicted_yield,
                "confidence_level": confidence_level,
                "shareable_text": shareable_text,
                "prediction_data": pred.get("yield_predictions")
            })
        
        return {
            "status": "success",
            "farmer_id": farmer_id,
            "total_predictions": len(formatted_predictions),
            "predictions": formatted_predictions
        }
        
    except Exception as e:
        print(f"❌ Error fetching prediction history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch prediction history: {str(e)}"
        )

def generate_shareable_text(prediction: dict) -> str:
    """
    Generate shareable text for officer chat
    
    Args:
        prediction: Prediction data from database
        
    Returns:
        Formatted text for sharing with agricultural officer
    """
    text = f"""🌾 Maize Yield Prediction Request

📍 Location: {prediction.get('district', 'N/A')}
{f"   {prediction.get('location', '')}" if prediction.get('location') else ""}

🌱 Crop Details:
   • Variety: {prediction.get('variety', 'N/A')}
   • Season: {prediction.get('season', 'N/A')}
   • Planting Date: {prediction.get('planting_date', 'N/A')}

🏞️ Farm Details:
   • Land Size: {prediction.get('land_size_value', 'N/A')} {prediction.get('land_size_unit', '')}
   • Soil Condition: {prediction.get('soil_condition', 'N/A')}
   • Irrigation: {prediction.get('irrigation_type', 'N/A')}
   • Rainfall: {prediction.get('rainfall_condition', 'N/A')}

📅 Request Date: {prediction.get('created_at', 'N/A')}

{f"💬 Farmer Message: {prediction.get('farmer_message', '')}" if prediction.get('farmer_message') else ""}

---
I would like guidance on improving my maize yield. Please advise on best practices and recommendations.
"""
    return text

@router.get("/farmer/health")
async def farmer_health_check():
    """Health check for farmer prediction service"""
    return {
        "status": "ok",
        "service": "farmer-yield-prediction",
        "ml_model_loaded": USE_ML,
        "database_connected": True,
        "features": [
            "Simple yield prediction",
            "Impact factor analysis",
            "General farming recommendations",
            "Bilingual support (EN/SI)",
            "Database persistence",
            "Prediction history"
        ]
    }
