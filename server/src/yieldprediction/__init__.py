"""
Yield Prediction Module
Automatically loads ML model on import
"""

# Import ML prediction service to trigger model loading at startup
from . import ml_prediction_service

__all__ = ['ml_prediction_service']
