import pickle
import numpy as np
import pandas as pd
import os

BASE = os.path.dirname(__file__)

# -------------------------
#  LOAD TRAINED MODEL FILES
# -------------------------

model = pickle.load(open(os.path.join(BASE, "corn_weather_model.pkl"), "rb"))
minmax_scaler = pickle.load(open(os.path.join(BASE, "corn_minmax_scaler.pkl"), "rb"))
standard_scaler = pickle.load(open(os.path.join(BASE, "corn_standard_scaler.pkl"), "rb"))
label_encoder = pickle.load(open(os.path.join(BASE, "corn_label_encoder.pkl"), "rb"))
feature_columns = pickle.load(open(os.path.join(BASE, "corn_feature_columns.pkl"), "rb"))

print("✅ Weather ML Model Loaded Successfully!")

# -------------------------
#  FIXED RECOMMENDATION MAP
# -------------------------

RECOMMENDATIONS = {
    "optimal_perfect": {
        "status": "🌟 විශිෂ්ට තත්වයන්",
        "status_en": "🌟 EXCELLENT CONDITIONS",
        "action": "සියලුම වගා කටයුතු සිදු කරන්න",
        "action_en": "Proceed with full farming operations",
        "irrigation": "වර්ෂාව ප්‍රමාණවත්",
        "irrigation_en": "Rainfall is sufficient",
        "fertilizer": "සම්පූර්ණ පොහොර වැඩසටහන",
        "fertilizer_en": "Follow full fertilizer program",
        "activities": ["වගාව හොඳයි", "වගාව වර්ධනය වේ"],
        "activities_en": ["Crop growth is optimal", "Proceed normally"],
        "risk_level": "අඩු අවදානම",
        "risk_level_en": "Low risk",
        "color": "#059669"
    },

    "hot_dry_stress": {
        "status": "🔥 උණුසුම් + වියළි - ජල ආතතිය",
        "status_en": "🔥 HOT + DRY – Water Stress",
        "action": " වහාම ජලය දෙන්න",
        "action_en": "Provide emergency irrigation",
        "irrigation": "දිනෙකට 2 වාරයක්",
        "irrigation_en": "Irrigate twice daily",
        "fertilizer": "පොහොර අඩු කරන්න",
        "fertilizer_en": "Reduce fertilizer usage",
        "activities": ["ජලය දෙන්න", "කොළ මැලිවීම බලන්න"],
        "activities_en": ["Provide water", "Check leaf wilting"],
        "risk_level": "ඉහළ අවදානම",
        "risk_level_en": "High risk",
        "color": "#dc2626"
    }
}

DEFAULT = "optimal_perfect"


# -------------------------
#  ML PREDICTION PIPELINE
# -------------------------

def predict_farming_condition(weather_data):
    """
    This function receives weather parameters,
    transforms them with scalers,
    predicts using ML model,
    returns condition + confidence.
    """

    try:
        features_dict = {
    "temperature_2m_mean": float(weather_data["temperature"]),
    "temperature_2m_max": float(weather_data["temperature_max"]),
    "temperature_2m_min": float(weather_data["temperature_min"]),
    "rain_sum": float(weather_data["rainfall"]),
    "snowfall_sum": 0.0,
    "windspeed_10m_max": float(weather_data["windspeed"]),
    "shortwave_radiation_sum": float(weather_data["radiation"]),
}


        df = pd.DataFrame([features_dict])

        # Ensure missing columns exist
        for col in feature_columns:
            if col not in df:
                df[col] = 0.0

        df = df[feature_columns]

        scaled = minmax_scaler.transform(df)
        final = standard_scaler.transform(scaled)

        pred = model.predict(final)
        prob = model.predict_proba(final)

        condition = label_encoder.inverse_transform(pred)[0]
        conf = float(np.max(prob))

        return condition, conf

    except Exception as e:
        print("Prediction Error:", e)
        return DEFAULT, 0.5
