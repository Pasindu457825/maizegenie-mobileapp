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
    location: Optional[str] = Field(None, description="Specific location")
    gps_lat: Optional[float] = Field(None, description="GPS latitude")
    gps_lng: Optional[float] = Field(None, description="GPS longitude")
    soil_ph: float = Field(..., ge=0, le=14, description="Soil pH (0-14)")
    soil_nitrogen: float = Field(..., ge=0, description="Soil nitrogen content (ppm)")
    soil_phosphorus: float = Field(..., ge=0, description="Soil phosphorus content (ppm)")
    soil_potassium: float = Field(..., ge=0, description="Soil potassium content (ppm)")
    soil_type: str = Field(..., description="Soil type (Clay, Loam, RBE, RBL)")
    organic_matter: float = Field(..., ge=0, le=100, description="Organic matter percentage")

class ClimateData(BaseModel):
    seasonal_rainfall: str = Field(..., description="Seasonal rainfall condition")
    temperature: str = Field(..., description="Temperature condition")
    humidity: str = Field(..., description="Humidity level")
    photoperiod: str = Field(..., description="Photoperiod")
    climate_auto_fetched: Optional[bool] = Field(False, description="Auto-fetched from weather API")

class CropMeasurements(BaseModel):
    plant_height: Optional[float] = Field(None, ge=0, description="Plant height (cm)")
    cob_height: Optional[float] = Field(None, ge=0, description="Cob height (cm)")
    cob_length: Optional[float] = Field(None, ge=0, description="Cob length (cm)")
    kernel_rows: Optional[int] = Field(None, ge=0, description="Number of kernel rows")
    wet_weight_per_m2: Optional[float] = Field(None, ge=0, description="Wet weight per m² (kg)")
    measurements_taken: Optional[bool] = Field(False, description="Whether measurements were taken")

class FertilizerApplied(BaseModel):
    basal_npk: float = Field(..., ge=0, description="Basal NPK applied (kg/ha)")
    top_dress_1_amount: Optional[float] = Field(None, ge=0, description="Top-dress 1 amount (kg/ha)")
    top_dress_1_date: Optional[str] = Field(None, description="Top-dress 1 date (YYYY-MM-DD)")
    top_dress_2_amount: Optional[float] = Field(None, ge=0, description="Top-dress 2 amount (kg/ha)")
    top_dress_2_date: Optional[str] = Field(None, description="Top-dress 2 date (YYYY-MM-DD)")

class OfficerPredictionRequest(BaseModel):
    user_role: Literal['officer'] = 'officer'
    officer_id: str = Field(..., description="Officer ID")
    farmer_id: Optional[str] = Field(None, description="Farmer ID (if applicable)")
    
    # Core data
    soil_profile: SoilProfile
    climate_data: ClimateData
    crop_measurements: Optional[CropMeasurements] = None
    fertilizer_applied: FertilizerApplied
    
    # Basic info
    planting_date: str = Field(..., description="Planting date (YYYY-MM-DD)")
    variety: str = Field(..., description="Maize variety")
    season: Optional[str] = Field(None, description="Growing season")
    land_size_value: Optional[float] = Field(None, ge=0, description="Land size")
    land_size_unit: Optional[str] = Field(None, description="Land size unit")

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

class PredictionErrorResponse(BaseModel):
    status: Literal['error'] = 'error'
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Error details")
    timestamp: str = Field(..., description="Error timestamp")
