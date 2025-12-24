"""
Debug ML Model - Use manual pipeline execution to bypass sklearn issue
"""

import joblib
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
import warnings

# Load model
MODEL_PATH = Path("src/yieldprediction/best_yield_model_xgb.pkl")
model = joblib.load(MODEL_PATH)

print("=" * 60)
print("🔍 ML MODEL DEBUG - Manual Pipeline Execution")
print("=" * 60)

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

print(f"\n📊 Test Data (Scenario 1 - High Yield Optimal):")
print(f"   Soil N: {soil_n} mg/kg (Status: High)")
print(f"   Soil P: {soil_p} mg/kg (Status: High)")
print(f"   Soil K: {soil_k} mg/kg (Status: High)")
print(f"   Fertility Index: {soil_fertility_index:.3f}")
print(f"   Irrigation: Irrigated")
print(f"   Rainfall 30d: 200 mm (High)")
print(f"   Seasonal Rainfall: 1500 mm")
print(f"   Temperature: 27°C / 32°C max")
print(f"   Humidity: 80%")
print(f"   Variety: Pacific 808 (Premium)")

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
    "days_to_first_fert": 10,
    "days_between_ferts": 21,
}

# Create DataFrame
X = pd.DataFrame([features])

print(f"\n🎯 Making Prediction (Manual Pipeline)...")

try:
    # Extract pipeline components
    preprocessor = model.named_steps.get('preprocess') or model.named_steps.get('preprocessor')
    xgb_model = model.named_steps.get('model') or model.named_steps.get('regressor')
    
    print(f"   Preprocessor: {type(preprocessor).__name__}")
    print(f"   Model: {type(xgb_model).__name__}")
    
    # Transform features
    with warnings.catch_warnings():
        warnings.filterwarnings("ignore")
        X_transformed = preprocessor.transform(X)
    
    print(f"   Transformed features shape: {X_transformed.shape}")
    
    # Predict using XGBoost directly
    y_pred = xgb_model.predict(X_transformed)[0]
    
    print(f"\n📈 Raw Model Output: {y_pred:.4f}")
    
    # Analyze output
    if y_pred < 10:
        print(f"\n✅ Model output is in tonnes/ha")
        print(f"   {y_pred:.2f} t/ha")
        print(f"   = {y_pred * 1000:.2f} kg/ha")
        
        yield_kg_ha = y_pred * 1000
        
        print(f"\n🔍 Validation:")
        print(f"   Expected: 6,200-6,800 kg/ha")
        print(f"   Actual: {yield_kg_ha:.2f} kg/ha")
        
        if 6200 <= yield_kg_ha <= 6800:
            print(f"   ✅ PREDICTION IS CORRECT!")
        elif 1000 <= yield_kg_ha <= 2000:
            print(f"   ❌ PREDICTION IS TOO LOW!")
            print(f"   ❌ Difference: {yield_kg_ha - 6500:.2f} kg/ha ({((yield_kg_ha / 6500) - 1) * 100:.1f}%)")
            
            print(f"\n🔧 DIAGNOSIS:")
            print(f"   The model is predicting ~{yield_kg_ha:.0f} kg/ha for OPTIMAL conditions")
            print(f"   This suggests:")
            print(f"   1. ❌ Model was trained on incorrect/poor quality data")
            print(f"   2. ❌ Target variable (yield) in training was wrong")
            print(f"   3. ❌ Model needs complete retraining")
            print(f"   4. ❌ Or features are not matching training expectations")
        else:
            print(f"   ⚠️  Prediction is outside expected ranges")
    else:
        print(f"\n⚠️  Model output might be in kg/ha: {y_pred:.2f} kg/ha")
    
    # Get feature importances
    if hasattr(xgb_model, 'feature_importances_'):
        print(f"\n🎯 Top 10 Feature Importances:")
        feature_names = preprocessor.get_feature_names_out()
        importances = xgb_model.feature_importances_
        
        # Sort by importance
        indices = np.argsort(importances)[::-1][:10]
        for i, idx in enumerate(indices, 1):
            feat_name = feature_names[idx]
            feat_val = X_transformed[0, idx] if hasattr(X_transformed, 'shape') else X_transformed.toarray()[0, idx]
            print(f"   {i:2d}. {feat_name:40s}: {importances[idx]:.4f} (value: {feat_val:.2f})")
    
    # Check what the model learned
    print(f"\n📚 Model Training Info:")
    if hasattr(xgb_model, 'n_features_in_'):
        print(f"   Features used: {xgb_model.n_features_in_}")
    if hasattr(xgb_model, 'n_estimators'):
        print(f"   Trees: {xgb_model.n_estimators}")
    
except Exception as e:
    print(f"\n❌ Prediction Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 60)
print("\n💡 RECOMMENDATION:")
print("   If prediction is consistently low (~1600 kg/ha for optimal conditions),")
print("   the ML model needs to be RETRAINED with correct yield data.")
print("   Expected yields for Sri Lanka maize: 4,000-7,000 kg/ha")
print("=" * 60)
