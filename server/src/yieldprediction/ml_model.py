# ml_model.py
# -----------------------------------------------------
# Handles:
#   - Loading ML model (yield_model.pkl)
#   - Preparing feature vector
#   - Predicting yield using ML
#   - Exposing "is ML available?" flag
# -----------------------------------------------------

from pathlib import Path
from typing import Dict, List
import joblib
import datetime as dt

# Path to ML model
MODEL_PATH = Path(__file__).with_name("yield_model.pkl")

MODEL = None
USE_ML = False

# ----------------------------------------
# TRY TO LOAD ML MODEL
# ----------------------------------------
if MODEL_PATH.exists():
    try:
        MODEL = joblib.load(MODEL_PATH)
        USE_ML = True
        print(f"[YieldModel] ML model loaded from: {MODEL_PATH}")
    except Exception as e:
        USE_ML = False
        print(f"[YieldModel] Failed to load model → fallback to rules. Error: {e}")
else:
    print(f"[YieldModel] No model found → rule-based prediction active.")


# ----------------------------------------
# FEATURE ENGINEERING
# ----------------------------------------
def _build_feature_vector(data: Dict) -> List[float]:

    district_map = {"Anuradhapura": 0, "Monaragala": 1, "Badulla": 2, "Ampara": 3}
    season_map   = {"Maha": 0, "Yala": 1}
    soil_map     = {"Good": 2, "Medium": 1, "Poor": 0}
    irrig_map    = {"Rainfed": 0, "Irrigated": 1}
    rain_map     = {"Low": 0, "Normal": 1, "High": 2}

    planting_date = dt.date.fromisoformat(data["planting_date"])
    today = dt.date.today()
    days_since_planting = (today - planting_date).days

    land_size = float(data.get("land_size_value") or 1.0)

    return [
        district_map.get(data["district"], 0),
        season_map.get(data["season"], 0),
        soil_map.get(data["soil_condition"], 1),
        irrig_map.get(data["irrigation_type"], 0),
        rain_map.get(data["rainfall_condition"], 1),
        land_size,
        days_since_planting,
    ]


# ----------------------------------------
# ML PREDICTION
# ----------------------------------------
def predict_yield_ml(data: Dict) -> float:
    """
    Predict yield using ML model.
    Return: predicted t/ha (float)
    If ML not available → raises RuntimeError (service will fallback)
    """
    if not USE_ML or MODEL is None:
        raise RuntimeError("ML model not available")

    features = _build_feature_vector(data)
    y_pred = MODEL.predict([features])[0]
    return float(y_pred)
