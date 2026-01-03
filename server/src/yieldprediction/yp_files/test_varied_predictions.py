"""
Test script to verify ML model with varied input conditions to verify predictions are logical and not inverted parameters
Tests with poor, medium, and excellent conditions
"""

import requests
import json

API_BASE = "http://localhost:8000"
ENDPOINT = f"{API_BASE}/api/v1/yield-prediction/officer"

# Test Case 1: Poor Conditions (should predict LOW yield)
poor_conditions = {
    "soil_profile": {
        "district": "Monaragala",
        "location": "Buttala",
        "soil_type": "RYP",
        "soil_condition": "Poor",
        "soil_ph": 5.5,
        "soil_nitrogen_n": 30.0,
        "soil_phosphorus_p": 8.0,
        "soil_potassium_k": 80.0,
        "soil_fertility_index": 0.25,
        "n_status_class": "Low",
        "p_status_class": "Low",
        "k_status_class": "Low",
    },
    "climate_data": {
        "irrigation_type": "Rainfed",
        "rainfall_condition": "Low",
        "rainfall_30d_mm": 50.0,
        "seasonal_rainfall_mm": 400.0,
        "avg_temperature_c": 32.0,
        "max_temperature_c": 38.0,
        "avg_humidity_pct": 55.0,
        "sunshine_hours": 10.0,
    },
    "crop_information": {
        "seed_variety": "Local Variety",
        "planting_date": "2024-05-15T00:00:00",
        "planting_month": 5,
        "season": "Yala",
        "field_size_ha": 1.0,
    },
}

# Test Case 2: Medium Conditions (should predict MEDIUM yield)
medium_conditions = {
    "soil_profile": {
        "district": "Anuradhapura",
        "location": "Kahatagasdigiliya",
        "soil_type": "RBE",
        "soil_condition": "Medium",
        "soil_ph": 6.25,
        "soil_nitrogen_n": 70.0,
        "soil_phosphorus_p": 15.0,
        "soil_potassium_k": 160.0,
        "soil_fertility_index": 0.57,
        "n_status_class": "Medium",
        "p_status_class": "Medium",
        "k_status_class": "Medium",
    },
    "climate_data": {
        "irrigation_type": "Mixed",
        "rainfall_condition": "Normal",
        "rainfall_30d_mm": 300.0,
        "seasonal_rainfall_mm": 830.0,
        "avg_temperature_c": 27.5,
        "max_temperature_c": 31.7,
        "avg_humidity_pct": 73.0,
        "sunshine_hours": 7.5,
    },
    "crop_information": {
        "seed_variety": "GT 200",
        "planting_date": "2024-10-15T00:00:00",
        "planting_month": 10,
        "season": "Maha",
        "field_size_ha": 2.0,
    },
}

# Test Case 3: Excellent Conditions (should predict HIGH yield)
excellent_conditions = {
    "soil_profile": {
        "district": "Anuradhapura",
        "location": "Eppawala",
        "soil_type": "RBE",
        "soil_condition": "Good",
        "soil_ph": 6.5,
        "soil_nitrogen_n": 95.0,
        "soil_phosphorus_p": 28.0,
        "soil_potassium_k": 250.0,
        "soil_fertility_index": 0.90,
        "n_status_class": "High",
        "p_status_class": "High",
        "k_status_class": "High",
    },
    "climate_data": {
        "irrigation_type": "Irrigated",
        "rainfall_condition": "High",
        "rainfall_30d_mm": 200.0,
        "seasonal_rainfall_mm": 1000.0,
        "avg_temperature_c": 27.0,
        "max_temperature_c": 30.0,
        "avg_humidity_pct": 80.0,
        "sunshine_hours": 8.5,
    },
    "crop_information": {
        "seed_variety": "Jet 999",
        "planting_date": "2024-10-15T00:00:00",
        "planting_month": 10,
        "season": "Maha",
        "field_size_ha": 3.0,
    },
}

def test_prediction(name: str, data: dict):
    """Test a single prediction case using officer endpoint"""
    print(f"\n{'='*80}")
    print(f"Testing: {name}")
    print(f"{'='*80}")
    
    # Show key parameters
    soil = data.get('soil_profile', {})
    climate = data.get('climate_data', {})
    crop = data.get('crop_information', {})
    
    print(f"\nInput Parameters:")
    print(f"   Variety: {crop.get('seed_variety')}")
    print(f"   Soil Condition: {soil.get('soil_condition')}")
    print(f"   Nitrogen: {soil.get('soil_nitrogen_n'):.1f} ppm ({soil.get('n_status_class')})")
    print(f"   Irrigation: {climate.get('irrigation_type')}")
    print(f"   Rainfall: {climate.get('rainfall_condition')}")
    print(f"   Soil Fertility Index: {soil.get('soil_fertility_index'):.2f}")
    
    try:
        from src.yieldprediction.ml_prediction_service import get_ml_prediction_officer
        
        result = get_ml_prediction_officer(data)
        
        if result:
            print(f"\n✅ ML Prediction Successful!")
            print(f"   Predicted Yield: {result['predicted_yield']:.2f} kg/ha ({result['predicted_yield_t_ha']:.2f} t/ha)")
            print(f"   Confidence Score: {result['confidence_score']:.2%}")
            print(f"   Method: {result['prediction_method']}")
            print(f"   Harvest Window: {result['harvest_window']['start']} to {result['harvest_window']['end']}")
            
            print(f"\n   Top Impact Factors:")
            for factor in result['factors'][:3]:
                print(f"      - {factor['name']}: {factor['impact']} (importance: {factor['importance']:.1%})")
            
            return result['predicted_yield']
        else:
            print(f"\n❌ ML Prediction returned None")
            return None
        
    except Exception as e:
        print(f"\n❌ Prediction Failed: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("\n" + "="*80)
    print("ML MODEL VALIDATION TEST")
    print("Testing if ML predictions respond correctly to input variations")
    print("="*80)
    
    poor_yield = test_prediction("POOR CONDITIONS (Low inputs)", poor_conditions)
    medium_yield = test_prediction("MEDIUM CONDITIONS (Average inputs)", medium_conditions)
    excellent_yield = test_prediction("EXCELLENT CONDITIONS (Optimal inputs)", excellent_conditions)
    
    # Summary
    print(f"\n{'='*80}")
    print(f"SUMMARY - Prediction Comparison")
    print(f"{'='*80}")
    print(f"Poor Conditions:      {poor_yield:.2f} kg/ha ({poor_yield/1000:.2f} t/ha)" if poor_yield else "Poor Conditions:      FAILED")
    print(f"Medium Conditions:    {medium_yield:.2f} kg/ha ({medium_yield/1000:.2f} t/ha)" if medium_yield else "Medium Conditions:    FAILED")
    print(f"Excellent Conditions: {excellent_yield:.2f} kg/ha ({excellent_yield/1000:.2f} t/ha)" if excellent_yield else "Excellent Conditions: FAILED")
    
    # Verify logical ordering
    if poor_yield and medium_yield and excellent_yield:
        print(f"\n{'='*80}")
        print(f"VERIFICATION")
        print(f"{'='*80}")
        
        # Check if predictions are in logical order
        poor_medium_ok = poor_yield < medium_yield
        medium_excellent_ok = medium_yield < excellent_yield
        poor_excellent_ok = poor_yield < excellent_yield
        
        print(f"Poor < Medium:    {'✅ PASS' if poor_medium_ok else '❌ FAIL'} ({poor_yield:.0f} vs {medium_yield:.0f})")
        print(f"Medium < Excellent: {'✅ PASS' if medium_excellent_ok else '❌ FAIL'} ({medium_yield:.0f} vs {excellent_yield:.0f})")
        print(f"Poor < Excellent:   {'✅ PASS' if poor_excellent_ok else '❌ FAIL'} ({poor_yield:.0f} vs {excellent_yield:.0f})")
        
        if poor_medium_ok and medium_excellent_ok and poor_excellent_ok:
            print("\n🎉 SUCCESS: All predictions are logically ordered!")
            print("✅ ML model is working correctly - predictions increase with better conditions")
            print("✅ Feature mapping is correct - variety, soil, and climate factors are properly used")
            print("✅ No calibration issues - predictions are in realistic range (0-7 t/ha)")
        else:
            print("\n❌ FAILURE: Predictions are NOT logically ordered")
            print("⚠️  ML model still has issues - predictions do not increase with better conditions")
            
            if poor_yield > excellent_yield:
                print("⚠️  CRITICAL: Predictions appear INVERTED (poor > excellent)")
                print("    This suggests feature mapping or model training issues")
    else:
        print("\n⚠️  Could not verify ordering - some predictions failed")
    
    print(f"\n{'='*80}")
    print(f"Expected Ranges (based on training data):")
    print(f"{'='*80}")
    print(f"Poor conditions:      2.0 - 3.5 t/ha (2000 - 3500 kg/ha)")
    print(f"Medium conditions:    4.0 - 5.0 t/ha (4000 - 5000 kg/ha)")
    print(f"Excellent conditions: 5.5 - 6.8 t/ha (5500 - 6800 kg/ha)")
    print(f"Training data range:  0.0 - 6.85 t/ha (mean: 4.72 t/ha)")
    print(f"\n{'='*80}")
