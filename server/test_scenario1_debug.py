"""
Debug Test for Scenario 1 - High Yield Optimal Conditions
Tests the exact scenario from OFFICER_FORM_TEST_SCENARIOS.md
"""

import requests
import json

# API endpoint
API_URL = "http://localhost:8000/api/v1/yield-prediction/officer"

# Scenario 1: High Yield - Optimal Conditions
payload = {
    "officer_id": "officer_test_123",
    "soil_profile": {
        "district": "Anuradhapura",
        "location": "Horowpothana",
        "soil_type": "Reddish Brown Earth",
        "soil_condition": "Good",
        "soil_ph": 6.8,
        "soil_nitrogen_n": 120.0,
        "soil_phosphorus_p": 35.0,
        "soil_potassium_k": 250.0,
        "soil_fertility_index": 0.85,
        "n_status_class": "High",
        "p_status_class": "High",
        "k_status_class": "High"
    },
    "climate_data": {
        "irrigation_type": "Irrigated",
        "rainfall_condition": "High",
        "rainfall_30d_mm": 200.0,
        "seasonal_rainfall_mm": 1500.0,
        "avg_temperature_c": 27.0,
        "max_temperature_c": 32.0,
        "avg_humidity_pct": 80.0,
        "sunshine_hours": 9.0
    },
    "crop_information": {
        "seed_variety": "Pacific 808",
        "planting_date": "2024-10-15",
        "planting_month": 10,
        "season": "Maha",
        "field_size_ha": 0.81  # 2.0 Acres converted
    },
    "fertilizer_dates": {
        "first_fert_date": "2024-10-25",
        "second_fert_date": "2024-11-15"
    }
}

print("=" * 60)
print("🌽 SCENARIO 1 DEBUG TEST - High Yield Optimal Conditions")
print("=" * 60)
print("\n📊 Expected Results:")
print("   Predicted Yield: 6,200-6,800 kg/ha")
print("   Confidence: 92-95%")
print("   Yield Category: High")
print("\n📡 Sending request...")
print(f"   URL: {API_URL}")
print(f"\n📦 Payload:")
print(json.dumps(payload, indent=2))

try:
    response = requests.post(API_URL, json=payload, timeout=30)
    
    print(f"\n📥 Response Status: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        
        print("\n✅ Prediction Successful!")
        print("\n📈 Actual Results:")
        
        prediction = result.get("prediction", {})
        print(f"   Predicted Yield: {prediction.get('predicted_yield', 0):.2f} kg/ha")
        print(f"   Yield Category: {prediction.get('yield_category', 'Unknown')}")
        print(f"   Confidence: {prediction.get('confidence_score', 0) * 100:.1f}%")
        print(f"   Method: {prediction.get('prediction_method', 'Unknown')}")
        
        # Check if results match expectations
        predicted_yield = prediction.get('predicted_yield', 0)
        confidence = prediction.get('confidence_score', 0)
        category = prediction.get('yield_category', '')
        
        print("\n🔍 Validation:")
        
        # Yield check
        if 6200 <= predicted_yield <= 6800:
            print(f"   ✅ Yield in expected range (6,200-6,800)")
        else:
            print(f"   ❌ Yield OUT OF RANGE: {predicted_yield:.2f} kg/ha")
            print(f"      Expected: 6,200-6,800 kg/ha")
            print(f"      Difference: {predicted_yield - 6500:.2f} kg/ha")
        
        # Confidence check
        if 0.92 <= confidence <= 0.95:
            print(f"   ✅ Confidence in expected range (92-95%)")
        else:
            print(f"   ❌ Confidence OUT OF RANGE: {confidence * 100:.1f}%")
            print(f"      Expected: 92-95%")
        
        # Category check
        if category == "High":
            print(f"   ✅ Category correct: High")
        else:
            print(f"   ❌ Category WRONG: {category}")
            print(f"      Expected: High")
        
        # Show impact factors
        impact_factors = result.get("impact_factors", [])
        if impact_factors:
            print("\n🎯 Top Impact Factors:")
            for factor in impact_factors[:5]:
                print(f"   • {factor.get('factor', 'Unknown')}: {factor.get('impact', 0):.1f}%")
        
        # Show harvest window
        harvest = prediction.get("harvest_window", {})
        if harvest:
            print("\n📅 Harvest Window:")
            print(f"   Start: {harvest.get('start_date', 'N/A')}")
            print(f"   Target: {harvest.get('target_date', 'N/A')}")
            print(f"   End: {harvest.get('end_date', 'N/A')}")
        
        print("\n" + "=" * 60)
        
        # Overall assessment
        if (6200 <= predicted_yield <= 6800 and 
            0.92 <= confidence <= 0.95 and 
            category == "High"):
            print("✅ TEST PASSED - All results within expected ranges!")
        else:
            print("❌ TEST FAILED - Results do not match expectations!")
            print("\n🔧 Possible Issues:")
            print("   1. ML model may be predicting in wrong units")
            print("   2. Feature engineering may be incorrect")
            print("   3. Model may need retraining with correct data")
            print("   4. Input data transformation may be wrong")
        
        print("=" * 60)
        
    else:
        print(f"\n❌ Request failed with status {response.status_code}")
        print(f"Response: {response.text}")
        
except requests.exceptions.ConnectionError:
    print("\n❌ Connection Error: Could not connect to server")
    print("   Make sure the server is running on http://localhost:8000")
except Exception as e:
    print(f"\n❌ Error: {e}")
