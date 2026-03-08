from pydantic import BaseModel, Field
from typing import Optional


class WetWeightPredictionRequest(BaseModel):
    """Request model for wet weight prediction"""
    seed_variety: str = Field(..., description="Seed variety: Jet 999, GT 709, GT 200, Pacific 808, or Commando")
    cob_height_cm: float = Field(..., gt=0, description="Cob height in centimeters")
    plant_height_cm: float = Field(..., gt=0, description="Plant height in centimeters")
    cob_wet_weight_g: float = Field(..., gt=0, description="Cob wet weight in grams")
    cob_length_cm: float = Field(..., gt=0, description="Cob length in centimeters")
    num_seed_rows: int = Field(..., gt=0, description="Number of seed rows")


class WetWeightPredictionResponse(BaseModel):
    """Response model for wet weight prediction"""
    model_config = {"protected_namespaces": ()}
    predicted_wet_weight_field: float = Field(..., description="Predicted wet weight in field (Kg/m²)")
    confidence_score: float = Field(..., description="Model confidence based on Test R² (0-100)")
    confidence_label: str = Field(..., description="Confidence label: Very High / High / Moderate / Low")
    lower_bound: float = Field(..., description="95% prediction interval lower bound (Kg/m²)")
    upper_bound: float = Field(..., description="95% prediction interval upper bound (Kg/m²)")
    model_rmse: float = Field(..., description="Test RMSE used for interval calculation")
    model_r2: float = Field(..., description="Test R² used for confidence score")
    input_summary: dict = Field(..., description="Summary of input parameters")
    model_info: dict = Field(..., description="Model information")
