# ml_model.py
# -----------------------------------------------------
# DEPRECATED: This file is kept for backward compatibility
# New ML prediction service is in ml_prediction_service.py
# -----------------------------------------------------

import logging

logger = logging.getLogger(__name__)

# Import from new ML prediction service
try:
    from .ml_prediction_service import MODEL_LOADED as USE_ML
    logger.info("✅ Using new ML prediction service (XGBoost)")
except ImportError as e:
    USE_ML = False
    logger.warning(f"⚠️ ML prediction service not available: {e}")

# Legacy compatibility - expose USE_ML flag for existing code
__all__ = ['USE_ML']
