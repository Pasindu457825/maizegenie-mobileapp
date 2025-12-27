"""
Fix Model Compatibility Issue
This script loads the model and resaves it using XGBoost's native format
which is more compatible across versions
"""

import joblib
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("🔧 Fixing Model Compatibility")
print("="*60)

# Load the problematic model
print("\n1️⃣ Loading existing model...")
try:
    model_path = "src/yieldprediction/best_yield_model_xgb.pkl"
    
    # Try to load with sklearn's ignore warnings
    import sklearn
    sklearn.set_config(assume_finite=True)
    
    model = joblib.load(model_path)
    print("✅ Model loaded successfully")
    print(f"   Model type: {type(model)}")
    
    # Check if it's a pipeline
    if hasattr(model, 'named_steps'):
        print(f"   Pipeline steps: {list(model.named_steps.keys())}")
        xgb_model = model.named_steps.get('regressor') or model.named_steps.get('xgbregressor')
        if xgb_model:
            print(f"   XGBoost model found: {type(xgb_model)}")
    
except Exception as e:
    print(f"❌ Error loading model: {e}")
    print("\n⚠️ The model needs to be retrained with compatible sklearn/xgboost versions")
    print("\nRecommended solution:")
    print("1. Open the Jupyter notebook: Maize_Yield_Pridiction_Model.ipynb")
    print("2. Re-run all cells to retrain the model")
    print("3. Save the model using:")
    print("   joblib.dump(pipeline, 'best_yield_model_xgb.pkl')")
    print("\nOr use XGBoost's native save format:")
    print("   xgb_model.save_model('best_yield_model_xgb.json')")
    exit(1)

# Try to save in XGBoost native format
print("\n2️⃣ Attempting to extract and save XGBoost model in native format...")
try:
    if hasattr(model, 'named_steps'):
        xgb_model = model.named_steps.get('regressor') or model.named_steps.get('xgbregressor')
        if xgb_model and hasattr(xgb_model, 'save_model'):
            xgb_model.save_model('src/yieldprediction/xgb_model_native.json')
            print("✅ XGBoost model saved in native format: xgb_model_native.json")
            print("   This format is more compatible across versions")
        else:
            print("⚠️ Could not extract XGBoost model from pipeline")
    else:
        if hasattr(model, 'save_model'):
            model.save_model('src/yieldprediction/xgb_model_native.json')
            print("✅ Model saved in native format")
except Exception as e:
    print(f"❌ Error saving native format: {e}")

print("\n" + "="*60)
print("📋 SOLUTION SUMMARY")
print("="*60)
print("""
The model has a compatibility issue between scikit-learn 1.6.1 and XGBoost 2.0.3.

RECOMMENDED SOLUTION:
Retrain the model in the Jupyter notebook with these exact versions:
- scikit-learn==1.6.1
- xgboost==2.1.3 (or latest)

Then save using XGBoost's native format for better compatibility:
```python
# After training
xgb_model.save_model('best_yield_model_xgb.json')
```

ALTERNATIVE (Quick Fix):
Use the rule-based prediction system which is already working.
The API automatically falls back to rule-based when ML fails.

The rule-based system provides:
- Realistic yield predictions (2.5-7.0 t/ha)
- Based on agricultural best practices
- Considers variety, soil, irrigation, rainfall, season
- Medium confidence (70-75%)
""")
print("="*60)
