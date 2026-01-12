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
    
    # Timing
    planting_date: str = Field(..., description="Planting date (YYYY-MM-DD)")
    season: str = Field(..., description="Growing season (Maha/Yala)")
    
    # Land size
    land_size_value: float = Field(..., gt=0, description="Land size value")
    land_size_unit: str = Field(..., description="Land size unit (Acres/Hectares)")
    
    # Crop details (mandatory - same as officer)
    variety: str = Field(..., description="Maize variety name")
    planting_month: int = Field(..., ge=1, le=12, description="Planting month (1-12)")
    field_size_ha: float = Field(..., gt=0, description="Field size in hectares")
    
    # Fertilizer Dates (mandatory - same as officer)
    first_fert_date: str = Field(..., description="First fertilizer application date (YYYY-MM-DD)")
    second_fert_date: Optional[str] = Field(None, description="Second fertilizer application date (YYYY-MM-DD)")
    
    # Soil information
    soil_type: Optional[str] = Field(None, description="Soil type (Alluvial, IBL, LHG, RBE, RYP)")
    soil_condition: str = Field(..., description="Soil condition: Good/Medium/Poor")
    
    # Soil test data (mandatory - farmer must provide soil testing results)
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH level (0-14)")
    soil_nitrogen_n: float = Field(..., ge=0, description="Nitrogen content (ppm)")
    soil_phosphorus_p: float = Field(..., ge=0, description="Phosphorus content (ppm)")
    soil_potassium_k: float = Field(..., ge=0, description="Potassium content (ppm)")
    soil_fertility_index: float = Field(..., ge=0, le=1, description="Soil fertility index (0-1)")
    
    # NPK Status Classification (mandatory - same as officer)
    n_status_class: str = Field(..., description="Nitrogen status: Low/Medium/High")
    p_status_class: str = Field(..., description="Phosphorus status: Low/Medium/High")
    k_status_class: str = Field(..., description="Potassium status: Low/Medium/High")
    
    # Field conditions (simplified for farmers)
    irrigation_type: str = Field(..., description="Irrigation: Rainfed/Irrigated/Mixed")
    rainfall_condition: str = Field(..., description="Rainfall: Low/Normal/High")
    
    # Weather Data (mandatory - same as officer)
    rainfall_30d: float = Field(..., ge=0, description="30-day rainfall in mm")
    seasonal_rainfall: float = Field(..., ge=0, description="Seasonal total rainfall in mm")
    avg_temperature: float = Field(..., description="Average temperature in Celsius")
    max_temperature: float = Field(..., description="Maximum temperature in Celsius")
    avg_humidity: float = Field(..., ge=0, le=100, description="Average humidity percentage")
    sunshine_hours: float = Field(..., ge=0, le=24, description="Daily sunshine hours")
    
    # Weather data source tracking
    weather_data_source: Optional[str] = Field(default="auto", description="Weather data source: 'auto' or 'manual'")

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
    ml_model_version: str = Field(default="v1.0", description="Model version")

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
    
    # Yield comparison data
    yield_comparison: Optional[dict] = Field(None, description="Comparison with district optimal yield")
    
    # Variety and irrigation comparisons
    variety_comparison: Optional[dict] = Field(None, description="Seed variety comparison with potential yield improvement")
    irrigation_comparison: Optional[dict] = Field(None, description="Irrigation system comparison with potential yield improvement")
    
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
