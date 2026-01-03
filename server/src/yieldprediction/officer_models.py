"""
Officer Prediction Models and Schemas
Enhanced yield prediction with fertilizer scheduling for AgriOfficers
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, date

# ============================================================
# ENUMS AND TYPES
# ============================================================

FertilizerStatus = Literal['done', 'partial', 'pending']
RecommendationPriority = Literal['high', 'medium', 'low']

# ============================================================
# REQUEST MODELS
# ============================================================

class SoilProfile(BaseModel):
    district: str = Field(..., description="District name")
    location: str = Field(..., description="Specific location within district")
    soil_type: str = Field(..., description="Soil type (Alluvial, IBL, LHG, RBE, RYP)")
    soil_condition: str = Field(..., description="Soil condition: Good/Medium/Poor")
    
    # Soil Chemistry
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH (0-14)")
    soil_nitrogen_n: float = Field(..., ge=0, description="Soil nitrogen content (ppm)")
    soil_phosphorus_p: float = Field(..., ge=0, description="Soil phosphorus content (ppm)")
    soil_potassium_k: float = Field(..., ge=0, description="Soil potassium content (ppm)")
    soil_fertility_index: float = Field(..., ge=0, le=1, description="Soil fertility index (0-1)")
    
    # NPK Status Classification
    n_status_class: str = Field(..., description="Nitrogen status: Low/Medium/High")
    p_status_class: str = Field(..., description="Phosphorus status: Low/Medium/High")
    k_status_class: str = Field(..., description="Potassium status: Low/Medium/High")

class ClimateData(BaseModel):
    # Categorical conditions
    irrigation_type: str = Field(..., description="Irrigation: Rainfed/Irrigated/Mixed")
    rainfall_condition: str = Field(..., description="Rainfall: Low/Normal/High")
    
    # Numerical weather data
    rainfall_30d_mm: float = Field(..., ge=0, description="30-day rainfall in mm")
    seasonal_rainfall_mm: float = Field(..., ge=0, description="Seasonal total rainfall in mm")
    avg_temperature_c: float = Field(..., description="Average temperature in Celsius")
    max_temperature_c: float = Field(..., description="Maximum temperature in Celsius")
    avg_humidity_pct: float = Field(..., ge=0, le=100, description="Average humidity percentage")
    sunshine_hours: float = Field(..., ge=0, le=24, description="Daily sunshine hours")

class FertilizerDates(BaseModel):
    first_fert_date: str = Field(..., description="First fertilizer application date (YYYY-MM-DD)")
    second_fert_date: Optional[str] = Field(None, description="Second fertilizer application date (YYYY-MM-DD)")

class CropInformation(BaseModel):
    seed_variety: str = Field(..., description="Maize variety name")
    planting_date: str = Field(..., description="Planting date (YYYY-MM-DD)")
    planting_month: int = Field(..., ge=1, le=12, description="Planting month (1-12)")
    season: str = Field(..., description="Growing season: Maha/Yala")
    field_size_ha: float = Field(..., gt=0, description="Field size in hectares")

class OfficerPredictionRequest(BaseModel):
    """
    Officer prediction request matching ML training dataset structure (28 parameters)
    """
    officer_id: str = Field(..., description="Officer ID")
    farmer_id: Optional[str] = Field(None, description="Farmer ID (if applicable)")
    prediction_type: Literal["operational", "experimental"] = Field(
        default="experimental",
        description="operational: farmer-requested (saved to DB), experimental: officer-initiated (not saved)"
    )
    
    # Core data sections
    soil_profile: SoilProfile
    climate_data: ClimateData
    crop_information: CropInformation
    fertilizer_dates: FertilizerDates

# ============================================================
# RESPONSE MODELS
# ============================================================

class FertilizerApplication(BaseModel):
    date: str = Field(..., description="Application date (YYYY-MM-DD)")
    day_number: int = Field(..., ge=0, description="Days after planting")
    recommended_amount: float = Field(..., ge=0, description="Recommended amount (kg/ha)")
    applied_amount: float = Field(..., ge=0, description="Applied amount (kg/ha)")
    remaining_amount: float = Field(..., ge=0, description="Remaining amount (kg/ha)")
    status: FertilizerStatus = Field(..., description="Application status")
    adjustment_reason: Optional[str] = Field(None, description="Reason for adjustment")
    timing_warning: Optional[str] = Field(None, description="Timing warning")
    instructions_si: str = Field(..., description="Instructions in Sinhala")
    instructions_en: str = Field(..., description="Instructions in English")

class BasalFertilizerApplication(FertilizerApplication):
    npk_amount: float = Field(..., ge=0, description="NPK amount (kg/ha)")

class FertilizerSchedule(BaseModel):
    total_n_requirement: float = Field(..., ge=0, description="Total nitrogen requirement (kg/ha)")
    total_p_requirement: float = Field(..., ge=0, description="Total phosphorus requirement (kg/ha)")
    total_k_requirement: float = Field(..., ge=0, description="Total potassium requirement (kg/ha)")
    
    basal: BasalFertilizerApplication
    top_dress_1: FertilizerApplication
    top_dress_2: FertilizerApplication
    
    warnings: List[str] = Field(default_factory=list, description="Fertilizer warnings")
    
    calendar_events: List[dict] = Field(default_factory=list, description="Calendar events")

class ImpactFactor(BaseModel):
    factor: str = Field(..., description="Factor name")
    value: str = Field(..., description="Factor value")
    impact: float = Field(..., description="Impact score")
    impact_percentage: float = Field(..., ge=0, le=100, description="Impact percentage")
    description: str = Field(..., description="Factor description")

class Recommendation(BaseModel):
    priority: RecommendationPriority = Field(..., description="Recommendation priority")
    category: str = Field(..., description="Recommendation category")
    title_si: str = Field(..., description="Title in Sinhala")
    title_en: str = Field(..., description="Title in English")
    description_si: str = Field(..., description="Description in Sinhala")
    description_en: str = Field(..., description="Description in English")

class OfficerInsights(BaseModel):
    soil_health_score: float = Field(..., ge=0, le=10, description="Soil health score (0-10)")
    fertilizer_efficiency: float = Field(..., ge=0, le=1, description="Fertilizer efficiency (0-1)")
    expected_roi: float = Field(..., ge=0, description="Expected ROI multiplier")
    risk_factors: List[str] = Field(default_factory=list, description="Risk factors")
    field_visit_recommendations: List[str] = Field(default_factory=list, description="Field visit recommendations")

class PredictionData(BaseModel):
    predicted_yield: float = Field(..., ge=0, description="Predicted yield (kg/ha)")
    yield_unit: str = Field(default="kg/ha", description="Yield unit")
    confidence_score: float = Field(..., ge=0, le=1, description="Confidence score (0-1)")
    yield_category: str = Field(..., description="Yield category (High/Medium/Low)")
    prediction_method: str = Field(..., description="Method used: ml_model or rule_based")
    harvest_window: dict = Field(..., description="Harvest window information")

class OfficerPredictionResponse(BaseModel):
    status: Literal['success'] = 'success'
    prediction_id: str = Field(..., description="Prediction ID")
    timestamp: str = Field(..., description="Timestamp")
    
    # Core prediction
    prediction: PredictionData
    
    # Officer-specific data
    fertilizer_schedule: FertilizerSchedule
    impact_factors: List[ImpactFactor]
    recommendations: List[Recommendation]
    officer_insights: OfficerInsights
    analysis_data: dict = Field(..., description="Analysis data for charts and visualization")

class PredictionErrorResponse(BaseModel):
    status: Literal['error'] = 'error'
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Error details")
    timestamp: str = Field(..., description="Error timestamp")
