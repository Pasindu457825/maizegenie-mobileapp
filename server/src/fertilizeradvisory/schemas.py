"""
Pydantic schemas for Rule-Based Fertilizer Advisory (Farmer + Officer)

IMPORTANT:
- router.py expects: FertilizerAdvisoryRequest / FertilizerAdvisoryResponse
- Farmer client sends: farmer_input + language
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Any


Language = Literal["si", "en"]


class FertilizerRecommendation(BaseModel):
    type: str  # nitrogen / phosphorus / potassium / balanced / etc.
    fertilizer: str
    amount: str
    timing: str
    priority: str  # high / medium / low
    reason: Optional[str] = None


class AdvisoryWarning(BaseModel):
    type: str
    severity: str  # high / medium / low
    message_en: str
    message_si: str


class FertilizerAdvisoryRequest(BaseModel):
    farmer_input: str = Field(..., min_length=3)
    language: Optional[Language] = None  # if missing, backend will auto-detect (fallback)


class FertilizerAdvisoryResponse(BaseModel):
    success: bool
    language: Language
    input_text: str

    advice: str
    recommendations: List[FertilizerRecommendation]
    warnings: List[AdvisoryWarning]
    apply_today: bool
    detected_issues: List[str]

    # explainability / WHY fields (optional)
    observation: Optional[str] = None
    cause: Optional[str] = None
    reasoning: Optional[str] = None

    # OPTIONAL: allow backend to send extra helper fields safely later
    extra: Optional[Any] = None
