"""
API Router for Rule-Based Fertilizer Advisory
"""
from fastapi import APIRouter, HTTPException
from .schemas import FertilizerAdvisoryRequest, FertilizerAdvisoryResponse
from .officer_schemas import OfficerAdvisoryRequest, OfficerAdvisoryResponse
from .rulebased_engine import FertilizerRuleBasedEngine
from .officer_engine import OfficerAdvisoryEngine

router = APIRouter(prefix="/api/v1/rule-based-advisory", tags=["Rule-Based Fertilizer Advisory"])

# Initialize Rule-Based engines (singleton)
rule_based_engine = FertilizerRuleBasedEngine()
officer_engine = OfficerAdvisoryEngine()


@router.post("/analyze", response_model=FertilizerAdvisoryResponse)
async def analyze_farmer_input(request: FertilizerAdvisoryRequest):
    """
    Analyze farmer's natural language input and provide fertilizer recommendations
    
    Supports both Sinhala and English input
    Uses keyword-based rules for lightweight processing
    """
    try:
        if not request.farmer_input or len(request.farmer_input.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Input text is too short. Please describe your crop condition."
            )
        
        # Process the input
        result = rule_based_engine.process_farmer_input(request.farmer_input)
        
        return FertilizerAdvisoryResponse(
            success=True,
            language=result["language"],
            input_text=result["input_text"],
            advice=result["advice"],
            recommendations=result["recommendations"],
            warnings=result["warnings"],
            apply_today=result["apply_today"],
            detected_issues=result["detected_issues"],
            observation=result.get("observation"),
            cause=result.get("cause"),
            reasoning=result.get("reasoning")
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing input: {str(e)}"
        )


@router.post("/officer/analyze", response_model=OfficerAdvisoryResponse)
async def analyze_officer_input(request: OfficerAdvisoryRequest):
    """
    Analyze officer's structured input and provide detailed fertilizer recommendations
    
    Supports structured form inputs with enhanced analytics
    Provides cost analysis, application schedules, and detailed reasoning
    """
    try:
        if not request.growth_stage:
            raise HTTPException(
                status_code=400,
                detail="Growth stage is required."
            )
        
        if request.field_size <= 0:
            raise HTTPException(
                status_code=400,
                detail="Field size must be greater than 0."
            )
        
        # Process the structured input
        result = officer_engine.process_officer_input({
            "language": request.language,
            "growth_stage": request.growth_stage,
            "soil_type": request.soil_type,
            "field_size": request.field_size,
            "symptoms": request.symptoms,
            "weather_condition": request.weather_condition,
            "location": request.location
        })
        
        return OfficerAdvisoryResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing officer input: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "Rule-Based Fertilizer Advisory",
        "engine": "Keyword-based Rules",
        "endpoints": {
            "farmer": "/api/v1/rule-based-advisory/analyze",
            "officer": "/api/v1/rule-based-advisory/officer/analyze"
        }
    }
