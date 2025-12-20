"""
API Router for NLP-based Fertilizer Advisory
"""
from fastapi import APIRouter, HTTPException
from .schemas import FertilizerAdvisoryRequest, FertilizerAdvisoryResponse
from .nlp_engine import FertilizerNLPEngine

router = APIRouter(prefix="/api/v1/nlp-advisory", tags=["NLP Fertilizer Advisory"])

# Initialize NLP engine (singleton)
nlp_engine = FertilizerNLPEngine()


@router.post("/analyze", response_model=FertilizerAdvisoryResponse)
async def analyze_farmer_input(request: FertilizerAdvisoryRequest):
    """
    Analyze farmer's natural language input and provide fertilizer recommendations
    
    Supports both Sinhala and English input
    Uses keyword-based NLP for lightweight processing
    """
    try:
        if not request.farmer_input or len(request.farmer_input.strip()) < 3:
            raise HTTPException(
                status_code=400,
                detail="Input text is too short. Please describe your crop condition."
            )
        
        # Process the input
        result = nlp_engine.process_farmer_input(request.farmer_input)
        
        return FertilizerAdvisoryResponse(
            success=True,
            language=result["language"],
            input_text=result["input_text"],
            advice=result["advice"],
            recommendations=result["recommendations"],
            warnings=result["warnings"],
            apply_today=result["apply_today"],
            detected_issues=result["detected_issues"]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing input: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "NLP Fertilizer Advisory",
        "engine": "Keyword-based NLP"
    }
