"""
Farmer Prediction Models and Schemas
Simple yield prediction for farmers without fertilizer scheduling
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

# ============================================================
# REQUEST MODEL - Matches Frontend Data Structure
# ============================================================

class FarmerPredictionRequest(BaseModel):
    """
    Simple farmer prediction request matching frontend form data
    Maps to farmer_inputs table in Supabase
    """
    # User identification
    farmer_id: str = Field(..., description="Farmer's Supabase user ID")
    
    # Location data
    district: str = Field(..., description="District name")
    location: Optional[str] = Field(None, description="Specific location name")
    gps_lat: Optional[float] = Field(None, description="GPS latitude")
    gps_lng: Optional[float] = Field(None, description="GPS longitude")
    
    # Timing
    planting_date: str = Field(..., description="Planting date (YYYY-MM-DD)")
    season: str = Field(..., description="Growing season (Maha/Yala)")
    
    # Land size
    land_size_value: float = Field(..., gt=0, description="Land size value")
    land_size_unit: str = Field(..., description="Land size unit (Acres/Hectares)")
    
    # Crop details
    variety: str = Field(..., description="Maize variety name")
    
    # Field conditions (simplified for farmers)
    soil_condition: str = Field(..., description="Soil condition: Good/Medium/Poor")
    irrigation_type: str = Field(..., description="Irrigation: Rainfed/Irrigated/Mixed")
    rainfall_condition: str = Field(..., description="Rainfall: Low/Normal/High")
    
    # Optional farmer message
    farmer_message: Optional[str] = Field(None, description="Optional message to officer")

# ============================================================
# RESPONSE MODEL - Simple Farmer-Friendly Output
# ============================================================

class ImpactFactor(BaseModel):
    """Individual factor affecting yield"""
    factor: str = Field(..., description="Factor name")
    impact: str = Field(..., description="Impact level: positive/negative/neutral")
    description_english: str = Field(..., description="English description")
    description_sinhala: str = Field(..., description="Sinhala description")
    weight: float = Field(..., ge=0, le=1, description="Importance weight 0-1")

class Recommendation(BaseModel):
    """Simple recommendation for farmer"""
    priority: Literal['high', 'medium', 'low'] = Field(..., description="Priority level")
    title_english: str = Field(..., description="Recommendation title in English")
    title_sinhala: str = Field(..., description="Recommendation title in Sinhala")
    description_english: str = Field(..., description="Detailed description in English")
    description_sinhala: str = Field(..., description="Detailed description in Sinhala")
    icon: str = Field(..., description="Icon name for UI")

class PredictionData(BaseModel):
    """Core prediction results"""
    predicted_yield_kg_per_ha: float = Field(..., description="Predicted yield in kg/ha")
    predicted_yield_tons_per_ha: float = Field(..., description="Predicted yield in tons/ha")
    confidence_level: Literal['High', 'Medium', 'Low'] = Field(..., description="Confidence level")
    confidence_score: float = Field(..., ge=0, le=100, description="Confidence percentage")
    
    # Yield range
    yield_lower_bound: Optional[float] = Field(None, description="Lower bound estimate")
    yield_upper_bound: Optional[float] = Field(None, description="Upper bound estimate")
    
    # Model info
    prediction_method: Literal['ml_model', 'rule_based', 'hybrid'] = Field(..., description="Method used")
    model_version: str = Field(default="v1.0", description="Model version")

class FarmerPredictionResponse(BaseModel):
    """
    Complete farmer prediction response
    Simple, farmer-friendly output without fertilizer schedules
    """
    # Identifiers
    prediction_id: str = Field(..., description="Unique prediction ID")
    farmer_input_id: str = Field(..., description="Reference to farmer_inputs table")
    timestamp: str = Field(..., description="Prediction timestamp ISO format")
    
    # Core prediction
    prediction: PredictionData = Field(..., description="Yield prediction data")
    
    # Impact analysis
    impact_factors: List[ImpactFactor] = Field(..., description="Factors affecting yield")
    primary_limiting_factors: List[str] = Field(..., description="Main limiting factors")
    
    # Recommendations (general farming advice, NO fertilizer schedules)
    recommendations: List[Recommendation] = Field(..., description="Farming recommendations")
    
    # Summary messages
    summary_english: str = Field(..., description="Summary message in English")
    summary_sinhala: str = Field(..., description="Summary message in Sinhala")
    
    # Status
    status: str = Field(default="completed", description="Prediction status")

# ============================================================
# ERROR RESPONSE
# ============================================================

class PredictionErrorResponse(BaseModel):
    """Error response for failed predictions"""
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Additional error details")
    timestamp: str = Field(..., description="Error timestamp")
    status: str = Field(default="failed", description="Status")
