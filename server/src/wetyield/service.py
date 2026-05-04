import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

MODEL_DIR = Path(__file__).parent.parent / "yieldprediction" / "yp_files"
MODEL_PATH = MODEL_DIR / "xgboost_best.pkl"
PREPROCESSOR_PATH = MODEL_DIR / "xgboost_preprocessor.pkl"

model = None
preprocessor = None
MODEL_LOADED = False

SEED_VARIETIES = ["Jet 999", "GT 709", "GT 200", "Pacific 808", "Commando"]

# ── Real model evaluation metrics from test set ──────────────────────────────
# Run the notebook eval block to get these values, then update here.
MODEL_R2   = 0.94    # Test R²  (replace with your exact value)
MODEL_RMSE = 0.115   # Test RMSE Kg/m² (replace with your exact value)


def load_model():
    """Load the XGBoost model and preprocessor"""
    global model, preprocessor, MODEL_LOADED
    
    try:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        if not PREPROCESSOR_PATH.exists():
            raise FileNotFoundError(f"Preprocessor file not found at {PREPROCESSOR_PATH}")
        
        model = joblib.load(MODEL_PATH)
        preprocessor = joblib.load(PREPROCESSOR_PATH)
        MODEL_LOADED = True
        logger.info("✅ XGBoost model and preprocessor loaded successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {str(e)}")
        MODEL_LOADED = False
        raise


def engineer_features(data: Dict[str, Any]) -> pd.DataFrame:
    """
    Engineer features from raw input data.
    Adds derived features: cob_to_plant_ratio and weight_per_row
    """
    df = pd.DataFrame([{
        'seed_variety': data['seed_variety'],
        'cob_height_cm': data['cob_height_cm'],
        'plant_height_cm': data['plant_height_cm'],
        'cob_wet_weight_g': data['cob_wet_weight_g'],
        'cob_length_cm': data['cob_length_cm'],
        'num_seed_rows': data['num_seed_rows'],
    }])
    
    df['cob_to_plant_ratio'] = df['cob_height_cm'] / df['plant_height_cm']
    df['weight_per_row'] = df['cob_wet_weight_g'] / df['num_seed_rows']
    
    return df


def get_confidence_info() -> Dict[str, Any]:
    """
    Return model-level confidence derived from Test R² (not input validity).
    The confidence score and label are fixed per model evaluation, not per prediction.
    """
    pct = round(MODEL_R2 * 100, 1)
    if MODEL_R2 >= 0.95:
        label = "Very High"
    elif MODEL_R2 >= 0.90:
        label = "High"
    elif MODEL_R2 >= 0.80:
        label = "Moderate"
    else:
        label = "Low"
    return {"confidence_pct": pct, "confidence_label": label}


def get_prediction_interval(prediction: float) -> Dict[str, float]:
    """
    95% prediction interval using ±1.96 * RMSE.
    """
    margin = 1.96 * MODEL_RMSE
    return {
        "lower_bound": round(max(prediction - margin, 0.0), 4),
        "upper_bound": round(prediction + margin, 4),
    }


def get_feature_importance() -> Dict[str, float]:
    """Get feature importance from the model"""
    if model is None or not hasattr(model, 'feature_importances_'):
        return {}
    
    try:
        cat_names = list(preprocessor.named_transformers_['cat'].get_feature_names_out(['seed_variety']))
        num_cols = ['cob_height_cm', 'plant_height_cm', 'cob_wet_weight_g', 
                    'cob_length_cm', 'num_seed_rows', 'cob_to_plant_ratio', 'weight_per_row']
        feature_names = num_cols + cat_names
        
        importances = model.feature_importances_
        
        importance_dict = {}
        for name, importance in zip(feature_names, importances):
            if not name.startswith('seed_variety_'):
                importance_dict[name] = float(importance)
        
        sorted_importance = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))
        return sorted_importance
        
    except Exception as e:
        logger.error(f"Error getting feature importance: {str(e)}")
        return {}


def generate_recommendations(prediction: float, input_data: Dict[str, Any]) -> list[str]:
    """Generate recommendations based on prediction and input data"""
    recommendations = []
    
    if prediction < 1.2:
        recommendations.append("⚠️ Low yield predicted. Consider improving soil fertility and irrigation.")
        recommendations.append("💡 Check for pest and disease issues that may be affecting plant growth.")
    elif prediction < 1.5:
        recommendations.append("📊 Moderate yield predicted. Optimize fertilizer application for better results.")
        recommendations.append("💧 Ensure consistent irrigation throughout the growing season.")
    else:
        recommendations.append("✅ Good yield predicted! Maintain current farming practices.")
        recommendations.append("🌟 Continue monitoring plant health and environmental conditions.")
    
    cob_to_plant = input_data['cob_height_cm'] / input_data['plant_height_cm']
    if cob_to_plant < 0.4:
        recommendations.append("📏 Cob position is low. This may indicate nutrient deficiency or variety characteristics.")
    elif cob_to_plant > 0.6:
        recommendations.append("📏 Cob position is high. Monitor for lodging risk in windy conditions.")
    
    if input_data['num_seed_rows'] < 12:
        recommendations.append("🌽 Lower seed row count. Consider varieties with higher row numbers for better yield.")
    elif input_data['num_seed_rows'] > 16:
        recommendations.append("🌽 High seed row count. Ensure adequate spacing and nutrition for optimal kernel development.")
    
    weight_per_row = input_data['cob_wet_weight_g'] / input_data['num_seed_rows']
    if weight_per_row < 12:
        recommendations.append("⚖️ Low weight per row. Improve kernel filling through better pollination and nutrition.")
    
    return recommendations


def predict_wet_weight(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main prediction function for wet weight in field.
    
    Args:
        input_data: Dictionary containing all required input parameters
        
    Returns:
        Dictionary containing prediction results and metadata
    """
    global model, preprocessor
    
    if not MODEL_LOADED:
        load_model()
    
    if model is None or preprocessor is None:
        raise RuntimeError("Model not loaded. Please check model files.")
    
    if input_data['seed_variety'] not in SEED_VARIETIES:
        raise ValueError(f"Invalid seed variety. Must be one of: {', '.join(SEED_VARIETIES)}")
    
    df = engineer_features(input_data)
    
    X_transformed = preprocessor.transform(df)
    
    prediction = model.predict(X_transformed)[0]
    
    confidence_info = get_confidence_info()
    interval = get_prediction_interval(float(prediction))
    
    result = {
        "predicted_wet_weight_field": float(round(prediction, 4)),
        "confidence_score": confidence_info["confidence_pct"],
        "confidence_label": confidence_info["confidence_label"],
        "lower_bound": interval["lower_bound"],
        "upper_bound": interval["upper_bound"],
        "model_rmse": MODEL_RMSE,
        "model_r2": MODEL_R2,
        "input_summary": {
            "seed_variety": input_data['seed_variety'],
            "cob_height_cm": input_data['cob_height_cm'],
            "plant_height_cm": input_data['plant_height_cm'],
            "cob_wet_weight_g": input_data['cob_wet_weight_g'],
            "cob_length_cm": input_data['cob_length_cm'],
            "num_seed_rows": input_data['num_seed_rows'],
            "cob_to_plant_ratio": float(round(df['cob_to_plant_ratio'].iloc[0], 4)),
            "weight_per_row": float(round(df['weight_per_row'].iloc[0], 2))
        },
        "model_info": {
            "model_type": "XGBoost Regressor",
            "target": "Wet Weight in Field (Kg/m²)",
            "features_used": 8,
            "training_samples": 175
        }
    }
    
    return result
