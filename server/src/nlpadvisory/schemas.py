"""
Pydantic schemas for NLP Fertilizer Advisory
"""
from pydantic import BaseModel
from typing import List, Optional


class FertilizerAdvisoryRequest(BaseModel):
    """Request schema for fertilizer advisory"""
    farmer_input: str
    location: Optional[str] = None
    crop_stage: Optional[str] = None


class RecommendationItem(BaseModel):
    """Single fertilizer recommendation"""
    type: str
    fertilizer: str
    amount: str
    timing: str
    priority: str


class WarningItem(BaseModel):
    """Warning message"""
    type: str
    severity: str
    message_en: str
    message_si: str


class FertilizerAdvisoryResponse(BaseModel):
    """Response schema for fertilizer advisory"""
    success: bool
    language: str
    input_text: str
    advice: str
    recommendations: List[RecommendationItem]
    warnings: List[WarningItem]
    apply_today: bool
    detected_issues: List[str]
