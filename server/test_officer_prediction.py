"""
Test script for Officer Yield Prediction with ML Model
Tests the /api/v1/yield-prediction/officer endpoint
"""

import requests
import json

API_URL = "http://localhost:8000"

def test_officer_prediction():
    """Test officer prediction endpoint with realistic data"""
    
    print("="*60)
    print("🌽 OFFICER YIELD PREDICTION - ML MODEL TEST")
    print("="*60)
    
    # Test data matching frontend payload structure
    payload = {
        "officer_id": "officer_test_123",
        "farmer_id": "farmer_456",
        "soil_profile": {
            "district": "Anuradhapura",
            "location": "Horowpothana",
            "soil_type": "Reddish Brown Earth",
            "soil_condition": "Good",
            "soil_ph": 6.5,
            "soil_nitrogen_n": 85.0,
            "soil_phosphorus_p": 20.0,
            "soil_potassium_k": 190.0,
            "soil_fertility_index": 0.72,
            "n_status_class": "Medium",
            "p_status_class": "Medium",
            "k_status_class": "High"
        },
        "climate_data": {
            "irrigation_type": "Mixed",
            "rainfall_condition": "Normal",
            "rainfall_30d_mm": 150.0,
            "seasonal_rainfall_mm": 1200.0,
            "avg_temperature_c": 28.0,
            "max_temperature_c": 34.0,
            "avg_humidity_pct": 75.0,
            "sunshine_hours": 8.5
        },
        "crop_information": {
            "seed_variety": "Jet 999",
            "planting_date": "2024-11-23",
            "planting_month": 11,
            "season": "Maha",
            "field_size_ha": 1.0
        },
        "fertilizer_dates": {
            "first_fert_date": "2024-12-03",
            "second_fert_date": "2024-12-23"
        }
    }
    
    print("\n📊 Test Input Data:")
    print(f"   District: {payload['soil_profile']['district']}")
    print(f"   Location: {payload['soil_profile']['location']}")
    print(f"   Variety: {payload['crop_information']['seed_variety']}")
    print(f"   Season: {payload['crop_information']['season']}")
    print(f"   Field Size: {payload['crop_information']['field_size_ha']} ha")
    print(f"   Soil Condition: {payload['soil_profile']['soil_condition']}")
    print(f"   Irrigation: {payload['climate_data']['irrigation_type']}")
    print(f"   Soil N: {payload['soil_profile']['soil_nitrogen_n']} mg/kg")
    print(f"   Soil P: {payload['soil_profile']['soil_phosphorus_p']} mg/kg")
    print(f"   Soil K: {payload['soil_profile']['soil_potassium_k']} mg/kg")
    
    print("\n📡 Sending POST request to: /api/v1/yield-prediction/officer")
    
    try:
        response = requests.post(
            f"{API_URL}/api/v1/yield-prediction/officer",
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ Prediction Successful!")
            print("\n📈 Results:")
            
            prediction = result.get("prediction", {})
            print(f"   Predicted Yield: {prediction.get('predicted_yield', 0):.2f} kg/ha")
            print(f"   Yield Category: {prediction.get('yield_category', 'N/A')}")
            print(f"   Confidence: {prediction.get('confidence_score', 0)*100:.1f}%")
            print(f"   Method: {prediction.get('prediction_method', 'N/A')}")
            
            # Harvest window
            harvest = prediction.get("harvest_window", {})
            if harvest:
                print(f"\n📅 Harvest Window:")
                print(f"   Start: {harvest.get('start', 'N/A')}")
                print(f"   Target: {harvest.get('target', 'N/A')}")
                print(f"   End: {harvest.get('end', 'N/A')}")
            
            # Impact factors
            impact_factors = result.get("impact_factors", [])
            if impact_factors:
                print(f"\n🎯 Top Impact Factors:")
                for factor in impact_factors[:5]:
                    impact_icon = "🟢" if factor.get("impact") == "positive" else "🟡" if factor.get("impact") == "neutral" else "🔴"
                    print(f"   {impact_icon} {factor.get('factor', 'N/A')}: {factor.get('impact', 'N/A')} (multiplier: {factor.get('multiplier', 1.0):.2f})")
            
            # Fertilizer schedule
            fert_schedule = result.get("fertilizer_schedule", {})
            if fert_schedule:
                print(f"\n🌱 Fertilizer Schedule:")
                basal = fert_schedule.get("basal_application", {})
                if basal:
                    print(f"   Basal: {basal.get('total_kg_per_ha', 0):.1f} kg/ha on {basal.get('application_date', 'N/A')}")
                
                top_dressings = fert_schedule.get("top_dressing_applications", [])
                for i, td in enumerate(top_dressings, 1):
                    print(f"   Top Dressing {i}: {td.get('total_kg_per_ha', 0):.1f} kg/ha on {td.get('application_date', 'N/A')}")
            
            # Officer insights
            insights = result.get("officer_insights", {})
            if insights:
                print(f"\n💡 Officer Insights:")
                print(f"   Soil Health Score: {insights.get('soil_health_score', 0):.1f}/10")
                print(f"   Fertilizer Efficiency: {insights.get('fertilizer_efficiency', 0)*100:.1f}%")
                print(f"   Expected ROI: {insights.get('expected_roi', 0):.2f}x")
            
            # Recommendations
            recommendations = result.get("recommendations", [])
            if recommendations:
                print(f"\n📋 Recommendations:")
                for i, rec in enumerate(recommendations[:3], 1):
                    print(f"   {i}. {rec.get('title_en', 'N/A')}")
            
            print("\n" + "="*60)
            print("✅ Officer prediction test completed successfully!")
            print("="*60)
            
        else:
            print(f"\n❌ API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Could not connect to server")
        print("   Make sure the server is running: python run.py")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    test_officer_prediction()
