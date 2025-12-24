"""
Debug ML Model - Check what the model is actually predicting
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime

# Load model
MODEL_PATH = Path("src/yieldprediction/best_yield_model_xgb.pkl")
model = joblib.load(MODEL_PATH)

print("=" * 60)
print("🔍 ML MODEL DEBUG")
print("=" * 60)

print(f"\n📦 Model Type: {type(model)}")
print(f"   Has named_steps: {hasattr(model, 'named_steps')}")

if hasattr(model, 'named_steps'):
    print(f"\n🔧 Pipeline Steps:")
    for step_name, step_obj in model.named_steps.items():
        print(f"   • {step_name}: {type(step_obj).__name__}")

# Prepare test data - Scenario 1 (High Yield Optimal)
planting_date = datetime(2024, 10, 15)
planting_month = 10
planting_year = 2024
planting_dayofyear = planting_date.timetuple().tm_yday

# Calculate soil fertility
soil_n = 120.0
soil_p = 35.0
soil_k = 250.0
n_norm = min(soil_n / 125.0, 1.0)
p_norm = min(soil_p / 31.0, 1.0)
k_norm = min(soil_k / 305.0, 1.0)
soil_fertility_index = (n_norm + p_norm + k_norm) / 3.0

print(f"\n📊 Test Data (Scenario 1 - High Yield):")
print(f"   District: Anuradhapura")
print(f"   Location: Horowpothana")
print(f"   Variety: Pacific 808")
print(f"   Season: Maha")
print(f"   Field Size: 0.81 ha")
print(f"   Soil Condition: Good")
print(f"   Irrigation: Irrigated")
print(f"   Rainfall 30d: 200 mm")
print(f"   Seasonal Rainfall: 1500 mm")
print(f"   Temperature: 27°C")
print(f"   Humidity: 80%")
print(f"   Sunshine: 9 hours")
print(f"   Soil N: {soil_n} mg/kg")
print(f"   Soil P: {soil_p} mg/kg")
print(f"   Soil K: {soil_k} mg/kg")
print(f"   Fertility Index: {soil_fertility_index:.2f}")

# Build feature dictionary
features = {
    "district": "Anuradhapura",
    "location": "Horowpothana",
    "season": "Maha",
    "seed_variety": "Pacific 808",
    "soil_type": "Reddish Brown Earth",
    "soil_condition": "Good",
    "irrigation_type": "Irrigated",
    "rainfall_condition": "High",
    "n_status_class": "High",
    "p_status_class": "High",
    "k_status_class": "High",
    "planting_month": planting_month,
    "field_size_ha": 0.81,
    "rainfall_30d_mm": 200.0,
    "seasonal_rainfall_mm": 1500.0,
    "avg_temperature_c": 27.0,
    "max_temperature_c": 32.0,
    "avg_humidity_pct": 80.0,
    "sunshine_hours": 9.0,
    "soil_ph": 6.8,
    "soil_nitrogen_n": soil_n,
    "soil_phosphorus_p": soil_p,
    "soil_potassium_k": soil_k,
    "soil_fertility_index": soil_fertility_index,
    "planting_year": planting_year,
    "planting_month_from_date": planting_month,
    "planting_dayofyear": planting_dayofyear,
    "days_to_first_fert": 10,  # 2024-10-25 - 2024-10-15
    "days_between_ferts": 21,  # 2024-11-15 - 2024-10-25
}

# Create DataFrame
X = pd.DataFrame([features])

print(f"\n🎯 Making Prediction...")

try:
    # Predict
    y_pred = model.predict(X)[0]
    
    print(f"\n📈 Raw Model Output: {y_pred:.4f}")
    print(f"   Assuming tonnes/ha: {y_pred:.2f} t/ha")
    print(f"   Converted to kg/ha: {y_pred * 1000:.2f} kg/ha")
    
    print(f"\n🔍 Analysis:")
    if y_pred < 10:
        print(f"   ✅ Model output appears to be in tonnes/ha")
        print(f"   ✅ Conversion: {y_pred:.2f} t/ha × 1000 = {y_pred * 1000:.2f} kg/ha")
        
        if 1000 <= y_pred * 1000 <= 2000:
            print(f"   ⚠️  Predicted yield is LOW (1000-2000 kg/ha)")
            print(f"   ⚠️  Expected for optimal conditions: 6000-7000 kg/ha")
            print(f"\n❌ MODEL IS PREDICTING INCORRECTLY!")
            print(f"\n🔧 Possible Causes:")
            print(f"   1. Model was trained on wrong target variable")
            print(f"   2. Feature engineering doesn't match training")
            print(f"   3. Model needs retraining with correct data")
            print(f"   4. Input features are being transformed incorrectly")
        elif 6000 <= y_pred * 1000 <= 7000:
            print(f"   ✅ Predicted yield is in expected range!")
    else:
        print(f"   ⚠️  Model output might already be in kg/ha")
        print(f"   Raw output: {y_pred:.2f} kg/ha")
    
    # Try to get feature importances
    if hasattr(model, 'named_steps'):
        xgb_model = model.named_steps.get('model') or model.named_steps.get('regressor')
        if xgb_model and hasattr(xgb_model, 'feature_importances_'):
            print(f"\n🎯 Top 5 Feature Importances:")
            
            # Get feature names after preprocessing
            preprocessor = model.named_steps.get('preprocess') or model.named_steps.get('preprocessor')
            if preprocessor:
                X_transformed = preprocessor.transform(X)
                feature_names = preprocessor.get_feature_names_out()
                importances = xgb_model.feature_importances_
                
                # Sort by importance
                indices = np.argsort(importances)[::-1][:5]
                for i, idx in enumerate(indices, 1):
                    print(f"   {i}. {feature_names[idx]}: {importances[idx]:.4f}")
    
except Exception as e:
    print(f"\n❌ Prediction Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
