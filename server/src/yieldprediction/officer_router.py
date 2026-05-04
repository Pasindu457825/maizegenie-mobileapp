"""
Officer Yield Prediction Router
Enhanced endpoint for AgriOfficers with fertilizer scheduling
"""

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import StreamingResponse
from datetime import datetime
import uuid
from typing import Dict, Any

from .officer_models import (
    OfficerPredictionRequest,
    OfficerPredictionResponse, 
    PredictionErrorResponse
)
from .officer_service import predict_officer_yield
from .report_generator import generate_officer_report
from src.database.supabase_service_yieldNfert import save_officer_prediction

# Create router with v1 prefix to match frontend expectations
router = APIRouter(prefix="/api/v1", tags=["Officer Yield Prediction"])

@router.post("/yield-prediction/officer")
async def predict_yield_officer(
    request: OfficerPredictionRequest
):
    """
    Enhanced yield prediction for AgriOfficers
    
    Features:
    - ML-first approach with rule-based fallback
    - Complete yield prediction with 28 parameters
    - Fertilizer schedule generation
    - Impact factors analysis
    - Officer-specific recommendations and insights
    - Visual analysis data for charts/graphs
    - Bilingual support (Sinhala/English)
    
    Strategy:
    1. Try ML model first (if available)
    2. Fallback to rule-based system if ML fails
    3. Return prediction with method indicator
    """
    
    try:
        # Convert request to dict format
        request_data = request.model_dump()
        
        # Extract prediction type (operational vs experimental)
        prediction_type = request.prediction_type
        farmer_id = request.farmer_id
        
        print(f"\n{'='*60}")
        print(f"OFFICER PREDICTION REQUEST")
        print(f"{'='*60}")
        print(f"Officer ID: {request.officer_id}")
        print(f"Prediction Type: {prediction_type.upper()}")
        if farmer_id:
            print(f"Farmer ID: {farmer_id}")
        print(f"District: {request.soil_profile.district}")
        print(f"Variety: {request.crop_information.seed_variety}")
        print(f"{'='*60}\n")
        
        # Call unified prediction service with ML-first, rule-based fallback
        response = predict_officer_yield(request_data)
        
        print(f"Officer prediction completed: {response['prediction_id']}")
        print(f"   Method: {response['prediction']['prediction_method']}")
        print(f"   Yield: {response['prediction']['predicted_yield']:.2f} kg/ha")
        
        # Save to database if operational (farmer-requested)
        if prediction_type == "operational":
            try:
                # Prepare data for database storage
                db_data = {
                    "officer_id": request.officer_id,
                    "farmer_id": farmer_id,
                    "soil_profile": request.soil_profile.model_dump(),
                    "climate_data": request.climate_data.model_dump(),
                    "crop_measurements": request.crop_information.model_dump(),
                    "fertilizer_applied": request.fertilizer_dates.model_dump(),
                    "predicted_yield": response['prediction'],
                    "fertilizer_schedule": response.get('fertilizer_schedule'),
                    "impact_factors": response.get('impact_factors'),
                    "recommendations": response.get('recommendations'),
                    "officer_insights": response.get('officer_insights'),
                }
                
                # Save operational prediction to database
                await save_officer_prediction(db_data, prediction_type="operational")
                print(f"Operational prediction saved to database")
                
            except Exception as db_error:
                print(f"Database save failed (non-critical): {db_error}")
        else:
            print(f"Experimental prediction - not saved to database")
        
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

@router.post("/yield-prediction/officer/report")
async def generate_prediction_report(
    request: OfficerPredictionRequest
):
    """
    Generate a professional PDF report for officer yield prediction
    
    Returns:
        StreamingResponse: PDF file download
    """
    try:
        # Convert request to dict format
        request_data = request.model_dump()
        
        # Get prediction data
        prediction_response = predict_officer_yield(request_data)
        
        # Flatten prediction data for report generator
        report_data = {
            **prediction_response['prediction'],
            **request_data.get('soil_profile', {}),
            **request_data.get('climate_data', {}),
            **request_data.get('crop_information', {}),
        }
        
        # Generate PDF
        pdf_buffer = generate_officer_report(report_data)
        
        # Create filename with timestamp and district
        district = request_data.get('soil_profile', {}).get('district', 'Unknown')
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"MaizeGenie_YieldReport_{district}_{timestamp}.pdf"
        
        # Return as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
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
    from pathlib import Path
    from .ml_prediction_service import MODEL_LOADED, MODEL_PATH
    
    return {
        "status": "ok",
        "service": "officer-yield-prediction",
        "ml_model_available": MODEL_LOADED,
        "ml_model_path": str(MODEL_PATH),
        "ml_model_file_exists": MODEL_PATH.exists(),
        "fallback_system": "rule_based",
        "features": [
            "ML-first prediction with rule-based fallback",
            "28-parameter comprehensive analysis",
            "Fertilizer schedule generation",
            "NPK requirement calculation",
            "Impact factors with multipliers",
            "Visual analysis data for charts",
            "Officer insights and recommendations",
            "Bilingual support (සිං/EN)"
        ]
    }
