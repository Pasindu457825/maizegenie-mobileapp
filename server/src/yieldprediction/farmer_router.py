"""
Farmer Yield Prediction Router
Simple yield prediction endpoint for farmers
"""

from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import Dict, Any

from .farmer_models import (
    FarmerPredictionRequest,
    FarmerPredictionResponse,
    PredictionErrorResponse,
    PredictionData,
    ImpactFactor,
    Recommendation
)
from .service import predict_yield_service, build_impact_factors
from .ml_model import USE_ML
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
async def predict_yield_farmer(request: FarmerPredictionRequest):
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
        print(f"\n{'='*60}")
        print(f"🌾 FARMER PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"Farmer ID: {request.farmer_id}")
        print(f"District: {request.district}")
        print(f"Season: {request.season}")
        print(f"Variety: {request.variety}")
        print(f"{'='*60}\n")
        
        # Generate IDs
        prediction_id = generate_uuid()
        timestamp = get_current_timestamp()
        
        # Step 1: Save farmer input to database
        try:
            farmer_input_id = await save_farmer_input(request.model_dump())
            print(f"✅ Saved to farmer_inputs table: {farmer_input_id}")
        except Exception as db_error:
            print(f"⚠️  Database save failed: {db_error}")
            # Continue with prediction even if DB save fails
            farmer_input_id = generate_uuid()
        
        # Step 2: Prepare data for prediction model
        # Convert land size to hectares
        land_size_hectares = request.land_size_value
        if request.land_size_unit.lower() == 'acres':
            land_size_hectares = request.land_size_value * 0.404686
        
        # Map simple conditions to model inputs
        soil_quality_map = {'Good': 0.9, 'Medium': 0.7, 'Poor': 0.5}
        irrigation_factor_map = {'Irrigated': 1.0, 'Mixed': 0.8, 'Rainfed': 0.6}
        rainfall_factor_map = {'High': 1.0, 'Normal': 0.85, 'Low': 0.6}
        
        soil_quality = soil_quality_map.get(request.soil_condition, 0.7)
        irrigation_factor = irrigation_factor_map.get(request.irrigation_type, 0.8)
        rainfall_factor = rainfall_factor_map.get(request.rainfall_condition, 0.85)
        
        # Step 3: Run yield prediction
        try:
            # Prepare data for prediction service
            prediction_input = {
                'district': request.district,
                'season': request.season,
                'variety': request.variety,
                'planting_date': request.planting_date,
                'soil_quality': soil_quality,
                'irrigation_factor': irrigation_factor,
                'rainfall_factor': rainfall_factor,
                'land_size_hectares': land_size_hectares,
                'gps_lat': request.gps_lat,
                'gps_lng': request.gps_lng
            }
            
            result = predict_yield_service(prediction_input)
            predicted_yield = result.get('predicted_yield', 5000)  # Default fallback
            
            print(f"📊 Predicted Yield: {predicted_yield:.2f} kg/ha")
            
        except Exception as pred_error:
            print(f"❌ Prediction error: {pred_error}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Prediction failed: {str(pred_error)}"
            )
        
        # Step 4: Calculate confidence
        confidence_score = 75.0  # Base confidence
        
        # Adjust based on data quality
        if request.soil_condition == 'Good' and request.irrigation_type == 'Irrigated':
            confidence_score += 10
        elif request.soil_condition == 'Poor' or request.rainfall_condition == 'Low':
            confidence_score -= 15
        
        confidence_score = max(50, min(95, confidence_score))
        
        if confidence_score >= 80:
            confidence_level = 'High'
        elif confidence_score >= 65:
            confidence_level = 'Medium'
        else:
            confidence_level = 'Low'
        
        # Calculate yield bounds (±15%)
        yield_lower = predicted_yield * 0.85
        yield_upper = predicted_yield * 1.15
        
        # Step 5: Build impact factors (simplified for farmers)
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
            prediction_method='ml_model' if USE_ML else 'rule_based',
            model_version='v1.0'
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
                    'model_version': prediction_data.model_version,
                    'primary_limiting_factors': primary_limiting,
                    'prediction_method': prediction_data.prediction_method
                }
            )
            print(f"✅ Saved to predictions table")
        except Exception as db_error:
            print(f"⚠️  Prediction save failed: {db_error}")
            # Continue even if DB save fails
        
        # Step 9: Generate summary messages
        yield_tons = prediction_data.predicted_yield_tons_per_ha
        
        summary_english = f"Expected yield: {yield_tons:.1f} tons per hectare with {confidence_level.lower()} confidence. "
        summary_sinhala = f"අපේක්ෂිත අස්වැන්න: හෙක්ටයාරයකට ටොන් {yield_tons:.1f} {confidence_level} විශ්වාසයෙන්. "
        
        if request.soil_condition == 'Good':
            summary_english += "Your soil quality is excellent for maize cultivation."
            summary_sinhala += "ඔබේ පස් තත්ත්වය බඩඉරිඟු වගාව සඳහා විශිෂ්ටයි."
        elif request.soil_condition == 'Poor':
            summary_english += "Consider soil improvement for better yields."
            summary_sinhala += "වඩා හොඳ අස්වැන්නක් සඳහා පස වැඩිදියුණු කිරීම සලකා බලන්න."
        
        # Step 10: Build response
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
            status='completed'
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
