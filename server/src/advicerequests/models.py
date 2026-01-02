"""
Advice Request Models
Pydantic models for farmer advice request API
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# ============================================================
# REQUEST MODELS
# ============================================================

class AdviceRequestCreate(BaseModel):
    """Model for creating a new advice request"""
    yield_prediction_id: str = Field(..., description="ID of the yield prediction")
    request_type: Literal["yield_enhancement", "seed_variety", "both"] = Field(
        default="both",
        description="Type of advice requested"
    )
    farmer_message: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional message from farmer"
    )
    # Denormalized yield prediction data for quick access
    predicted_yield_kg_ha: Optional[float] = Field(default=None)
    district: Optional[str] = Field(default=None)
    location: Optional[str] = Field(default=None)
    variety: Optional[str] = Field(default=None)
    land_size_ha: Optional[float] = Field(default=None)
    irrigation_type: Optional[str] = Field(default=None)
    rainfall_condition: Optional[str] = Field(default=None)
    planting_date: Optional[str] = Field(default=None)


class AdviceRequestUpdate(BaseModel):
    """Model for updating an advice request (by officer)"""
    status: Optional[Literal["pending", "in_progress", "completed", "cancelled"]] = None
    priority: Optional[Literal["low", "normal", "high", "urgent"]] = None
    assigned_officer_id: Optional[str] = None
    officer_response: Optional[str] = Field(default=None, max_length=2000)
    officer_notes: Optional[str] = Field(default=None, max_length=1000)
    fertilizer_plan: Optional[dict] = Field(default=None, description="Structured fertilizer plan (JSONB)")
    cultivation_advice: Optional[str] = Field(default=None, max_length=5000)
    expected_yield_improvement: Optional[str] = Field(default=None, max_length=500)


class AdviceRequestCancel(BaseModel):
    """Model for farmer to cancel their request"""
    reason: Optional[str] = Field(default=None, max_length=500)


# ============================================================
# RESPONSE MODELS
# ============================================================

class FarmerInfo(BaseModel):
    """Farmer information in response"""
    id: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    district: Optional[str] = None


class YieldPredictionInfo(BaseModel):
    """Yield prediction summary in response"""
    id: str
    predicted_yield_kg_per_ha: Optional[float] = None
    confidence_level: Optional[str] = None
    prediction_method: Optional[str] = None
    created_at: Optional[str] = None


class AdviceRequestResponse(BaseModel):
    """Single advice request response"""
    id: str
    farmer_id: str
    yield_prediction_id: Optional[str] = None
    request_type: str
    status: str
    priority: str
    farmer_message: Optional[str] = None
    predicted_yield_kg_ha: Optional[float] = None
    district: Optional[str] = None
    location: Optional[str] = None
    variety: Optional[str] = None
    land_size_ha: Optional[float] = None
    irrigation_type: Optional[str] = None
    rainfall_condition: Optional[str] = None
    planting_date: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    officer_response: Optional[str] = None
    officer_notes: Optional[str] = None
    fertilizer_plan: Optional[dict] = None
    cultivation_advice: Optional[str] = None
    expected_yield_improvement: Optional[str] = None
    created_at: str
    updated_at: Optional[str] = None
    responded_at: Optional[str] = None
    completed_at: Optional[str] = None
    # Nested data (optional)
    farmer: Optional[FarmerInfo] = None
    yield_prediction: Optional[YieldPredictionInfo] = None


class AdviceRequestListResponse(BaseModel):
    """Paginated list of advice requests"""
    requests: List[AdviceRequestResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class AdviceRequestStats(BaseModel):
    """Statistics for advice requests"""
    total: int
    pending: int
    in_progress: int
    completed: int
    cancelled: int


# ============================================================
# FILTER MODELS
# ============================================================

class AdviceRequestFilters(BaseModel):
    """Filters for listing advice requests"""
    status: Optional[Literal["pending", "in_progress", "completed", "cancelled"]] = None
    priority: Optional[Literal["low", "normal", "high", "urgent"]] = None
    request_type: Optional[Literal["yield_enhancement", "seed_variety", "both"]] = None
    district: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    farmer_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None
