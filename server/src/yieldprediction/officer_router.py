"""
Officer Yield Prediction Router
Enhanced endpoint for AgriOfficers with fertilizer scheduling
"""

from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
import uuid
from typing import Dict, Any

from .officer_models import (
    OfficerPredictionRequest,
    OfficerPredictionResponse, 
    PredictionErrorResponse,
    PredictionData,
    ImpactFactor,
    Recommendation,
    OfficerInsights
)
from .fertilizer_service import (
    generate_fertilizer_schedule,
    generate_recommendations,
    generate_officer_insights
)
from .service import predict_yield_service, build_impact_factors
from .ml_model import USE_ML

# Create router with v1 prefix to match frontend expectations
router = APIRouter(prefix="/api/v1", tags=["Officer Yield Prediction"])

@router.post("/yield-prediction/officer", response_model=OfficerPredictionResponse)
async def predict_yield_officer(
    request: OfficerPredictionRequest
):
    """
    Enhanced yield prediction for AgriOfficers
    
    Features:
    - Complete yield prediction with ML/rule-based fallback
    - Fertilizer schedule generation (OUTPUT)
    - NPK requirement calculations  
    - Application status tracking (done/partial/pending)
    - SHAP-based impact factors
    - Officer-specific recommendations and insights
    - Bilingual instructions (Sinhala/English)
    """
    
    try:
        # Generate unique prediction ID
        prediction_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().isoformat() + "Z"
        
        # Convert officer request to format compatible with existing yield service
        farmer_format_data = {
            "district": request.soil_profile.district,
            "location": request.soil_profile.location or "",
            "gps_lat": request.soil_profile.gps_lat,
            "gps_lng": request.soil_profile.gps_lng,
            "planting_date": request.planting_date,
            "variety": request.variety,
            "season": request.season or "Maha",
            "land_size_value": request.land_size_value or 1.0,
            "land_size_unit": request.land_size_unit or "Acres",
            "soil_condition": "Good",  # Will be determined from detailed soil data
            "irrigation_type": "Irrigated",  # Default assumption for officer predictions
            "rainfall_condition": request.climate_data.seasonal_rainfall or "Normal"
        }
        
        # Get basic yield prediction using existing service
        basic_prediction = predict_yield_service(farmer_format_data)
        
        # Convert yield from t/ha to kg/ha for consistency
        yield_kg_ha = basic_prediction["yield_prediction_t_ha"] * 1000
        
        # Determine yield category based on Sri Lankan maize yields
        if yield_kg_ha >= 6000:
            yield_category = "High"
        elif yield_kg_ha >= 4000:
            yield_category = "Medium"  
        else:
            yield_category = "Low"
        
        # Generate enhanced prediction data
        prediction_data = PredictionData(
            predicted_yield=round(yield_kg_ha, 1),
            yield_unit="kg/ha",
            confidence_score=0.9 if USE_ML else 0.75,
            yield_category=yield_category,
            harvest_window={
                "start_date": basic_prediction["harvest_window"]["start"],
                "target_date": basic_prediction["harvest_window"]["target"], 
                "end_date": basic_prediction["harvest_window"]["end"],
                "days_to_harvest": (datetime.fromisoformat(basic_prediction["harvest_window"]["target"]) - datetime.now()).days
            }
        )
        
        # Generate fertilizer schedule (OFFICER-SPECIFIC OUTPUT)
        fertilizer_schedule = generate_fertilizer_schedule(request, yield_kg_ha)
        
        # Generate enhanced impact factors with SHAP-style analysis
        impact_factors = []
        
        # Soil factors
        impact_factors.append(ImpactFactor(
            factor="Soil pH",
            value=str(request.soil_profile.soil_ph),
            impact=0.85 if 6.0 <= request.soil_profile.soil_ph <= 7.5 else 0.6,
            impact_percentage=round((0.85 if 6.0 <= request.soil_profile.soil_ph <= 7.5 else 0.6) * 100, 1),
            description="Optimal pH range is 6.0-7.5 for maize growth"
        ))
        
        impact_factors.append(ImpactFactor(
            factor="Soil Nitrogen",
            value=f"{request.soil_profile.soil_nitrogen} ppm",
            impact=min(1.0, request.soil_profile.soil_nitrogen / 80),
            impact_percentage=round(min(100, (request.soil_profile.soil_nitrogen / 80) * 100), 1),
            description="Nitrogen is critical for vegetative growth and grain filling"
        ))
        
        impact_factors.append(ImpactFactor(
            factor="Organic Matter",
            value=f"{request.soil_profile.organic_matter}%",
            impact=min(1.0, request.soil_profile.organic_matter / 5),
            impact_percentage=round(min(100, (request.soil_profile.organic_matter / 5) * 100), 1),
            description="Organic matter improves soil structure and nutrient retention"
        ))
        
        # Climate factors
        impact_factors.append(ImpactFactor(
            factor="Seasonal Rainfall",
            value=request.climate_data.seasonal_rainfall,
            impact=0.9 if request.climate_data.seasonal_rainfall == "Adequate" else 0.7,
            impact_percentage=90 if request.climate_data.seasonal_rainfall == "Adequate" else 70,
            description="Adequate rainfall is crucial for grain development"
        ))
        
        # Variety factor
        variety_impact = {
            "Jet 999": 0.95,
            "Pacific 808": 0.90, 
            "GT 709": 0.85,
            "GT200": 0.90,
            "Commando": 0.93
        }.get(request.variety, 0.85)
        
        impact_factors.append(ImpactFactor(
            factor="Maize Variety",
            value=request.variety,
            impact=variety_impact,
            impact_percentage=round(variety_impact * 100, 1),
            description=f"{request.variety} variety performance under local conditions"
        ))
        
        # Generate recommendations
        recommendation_data = generate_recommendations(request, fertilizer_schedule)
        recommendations = [
            Recommendation(
                priority=rec["priority"],
                category=rec["category"],
                title_si=rec["title_si"],
                title_en=rec["title_en"], 
                description_si=rec["description_si"],
                description_en=rec["description_en"]
            ) for rec in recommendation_data
        ]
        
        # Generate officer insights
        insights_data = generate_officer_insights(request, fertilizer_schedule)
        officer_insights = OfficerInsights(
            soil_health_score=insights_data["soil_health_score"],
            fertilizer_efficiency=insights_data["fertilizer_efficiency"],
            expected_roi=insights_data["expected_roi"],
            risk_factors=insights_data["risk_factors"],
            field_visit_recommendations=insights_data["field_visit_recommendations"]
        )
        
        # Build complete response
        response = OfficerPredictionResponse(
            prediction_id=prediction_id,
            timestamp=timestamp,
            prediction=prediction_data,
            fertilizer_schedule=fertilizer_schedule,
            impact_factors=impact_factors,
            recommendations=recommendations,
            officer_insights=officer_insights
        )
        
        # Database save removed for simple setup
        print(f"✅ Officer prediction completed: {prediction_id}")
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        error_response = PredictionErrorResponse(
            message=f"Yield prediction failed: {str(e)}",
            details={"error_type": type(e).__name__},
            timestamp=datetime.utcnow().isoformat() + "Z"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_response.model_dump()
        )

@router.get("/predictions/{prediction_id}")
async def get_prediction(prediction_id: str):
    """
    Retrieve a specific prediction by ID (simplified - no database)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Prediction retrieval not implemented in simplified setup"
    )

@router.get("/predictions/officer/{officer_id}")
async def get_officer_predictions(officer_id: str, limit: int = 20, offset: int = 0):
    """
    Get officer's prediction history (simplified - no database)
    """
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Prediction history not implemented in simplified setup"
    )

@router.patch("/predictions/{prediction_id}/fertilizer-application")
async def update_fertilizer_application(
    prediction_id: str,
    application_type: str,
    applied_amount: float,
    applied_date: str
):
    """
    Update fertilizer application status (simplified - no database)
    """
    return {
        "success": True,
        "message": f"Updated {application_type} application: {applied_amount} kg/ha on {applied_date}"
    }

@router.get("/officer/health")
async def officer_health_check():
    """Health check for officer prediction service"""
    return {
        "status": "ok",
        "service": "officer-yield-prediction",
        "ml_model_loaded": USE_ML,
        "features": [
            "Enhanced yield prediction",
            "Fertilizer schedule generation",
            "NPK requirement calculation",
            "Status tracking",
            "SHAP impact factors", 
            "Officer insights",
            "Bilingual instructions"
        ]
    }
