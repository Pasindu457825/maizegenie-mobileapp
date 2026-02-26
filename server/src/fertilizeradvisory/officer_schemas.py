"""
Pydantic schemas for Officer Rule-Based Fertilizer Advisory
"""
from pydantic import BaseModel
from typing import List, Optional


class OfficerAdvisoryRequest(BaseModel):
    """Request schema for officer fertilizer advisory"""
    language: str = "en"
    growth_stage: str
    soil_type: str
    field_size: float
    symptoms: List[str] = []
    weather_condition: str = "normal"
    location: Optional[str] = None


class RecommendationItemOfficer(BaseModel):
    """Single fertilizer recommendation for officers"""
    type: str
    fertilizer: str
    npk: str
    amount: str
    amount_per_acre: Optional[str] = None
    timing: str
    priority: str
    cost_estimate: str


class WarningItemOfficer(BaseModel):
    """Warning message for officers"""
    type: str
    severity: str
    message_en: str
    message_si: str


class SoilAdjustment(BaseModel):
    """Soil-specific adjustment recommendations"""
    adjustment: str
    risk: str


class ScheduleItem(BaseModel):
    """Application schedule item"""
    day: str
    activity: str
    fertilizer: str
    amount: str


class CostBreakdown(BaseModel):
    """Cost breakdown item"""
    item: str
    cost: str


class CostAnalysis(BaseModel):
    """Cost analysis summary"""
    total_estimated_cost: str
    breakdown: List[CostBreakdown]
    note: str


class OfficerAdvisoryResponse(BaseModel):
    """Response schema for officer fertilizer advisory"""
    success: bool
    language: str
    growth_stage: str
    soil_type: str
    field_size: float
    recommendations: List[RecommendationItemOfficer]
    warnings: List[WarningItemOfficer]
    soil_adjustment: SoilAdjustment
    application_schedule: List[ScheduleItem]
    cost_analysis: CostAnalysis
    advice: str
    observation: Optional[str] = None
    cause: Optional[str] = None
    reasoning: Optional[str] = None
    apply_today: bool
