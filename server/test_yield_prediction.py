"""
Test script for Yield Prediction ML Model
Run this to verify the XGBoost model is working correctly
"""

import requests
import json
from datetime import datetime, timedelta

# Server URL
BASE_URL = "http://localhost:8000"

# Test data - realistic maize cultivation scenario
test_data = {
    "district": "Anuradhapura",
    "location": "Horowpothana",
    "gps_lat": 8.3456,
    "gps_lng": 80.1234,
    "season": "Maha",
    "planting_date": (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
    "land_size_value": 2.5,
    "land_size_unit": "Acres",
    "variety": "Jet 999",
    "soil_type": "RBE",
    "soil_condition": "Good",
    "irrigation_type": "Mixed",
    "rainfall_condition": "Normal",
    
    # Soil parameters (optional but recommended for better predictions)
    "soil_ph": 6.5,
    "soil_nitrogen_n": 85.0,
    "soil_phosphorus_p": 20.0,
    "soil_potassium_k": 190.0,
    
    # Weather parameters (optional but recommended)
    "avg_temperature_c": 28.5,
    "max_temperature_c": 33.0,
    "avg_humidity_pct": 75.0,
    "rainfall_30d_mm": 320.0,
    "seasonal_rainfall_mm": 880.0,
    "sunshine_hours": 7.8
}

def test_direct_prediction():
    """Test the ML prediction service directly"""
    print("\n" + "="*60)
    print("🧪 Testing ML Prediction Service Directly")
    print("="*60)
    
    try:
        from src.yieldprediction.ml_prediction_service import get_ml_prediction, MODEL_LOADED
        
        if not MODEL_LOADED:
            print("❌ Model not loaded!")
            return False
        
        print("✅ Model is loaded")
        print(f"\n📊 Test Input Data:")
        print(f"   District: {test_data['district']}")
        print(f"   Location: {test_data['location']}")
        print(f"   Variety: {test_data['variety']}")
        print(f"   Season: {test_data['season']}")
        print(f"   Land Size: {test_data['land_size_value']} {test_data['land_size_unit']}")
        print(f"   Soil Condition: {test_data['soil_condition']}")
        print(f"   Irrigation: {test_data['irrigation_type']}")
        print(f"   Soil N: {test_data['soil_nitrogen_n']} mg/kg")
        print(f"   Soil P: {test_data['soil_phosphorus_p']} mg/kg")
        print(f"   Soil K: {test_data['soil_potassium_k']} mg/kg")
        
        result = get_ml_prediction(test_data)
        
        print(f"\n✅ Prediction Successful!")
        print(f"\n📈 Results:")
        print(f"   Predicted Yield: {result['predicted_yield']:.2f} kg/ha ({result['predicted_yield_t_ha']:.2f} t/ha)")
        print(f"   Confidence: {result['confidence']} ({result['confidence_score']:.1%})")
        print(f"   Model: {result['model_version']}")
        print(f"   Method: {result['prediction_method']}")
        
        print(f"\n📅 Harvest Window:")
        print(f"   Start: {result['harvest_window']['start']}")
        print(f"   Target: {result['harvest_window']['target']}")
        print(f"   End: {result['harvest_window']['end']}")
        
        print(f"\n🎯 Top Impact Factors:")
        for factor in result['factors'][:5]:
            impact_emoji = "🟢" if factor['impact'] == "positive" else "🟡" if factor['impact'] == "neutral" else "🔴"
            print(f"   {impact_emoji} {factor['name']}: {factor['impact']} (importance: {factor.get('importance', 0):.1%})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_endpoint():
    """Test the API endpoint"""
    print("\n" + "="*60)
    print("🌐 Testing API Endpoint")
    print("="*60)
    
    endpoint = f"{BASE_URL}/api/yield/predict"
    
    print(f"\n📡 Sending POST request to: {endpoint}")
    
    try:
        response = requests.post(endpoint, json=test_data, timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API Request Successful!")
            print(f"\n📈 Results:")
            print(f"   Predicted Yield: {result['predicted_yield']:.2f} kg/ha")
            print(f"   Confidence: {result['confidence']}")
            print(f"   Method: {result.get('prediction_method', 'Unknown')}")
            print(f"\n📅 Harvest Target: {result['harvest_window']['target']}")
            return True
        else:
            print(f"❌ API Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection Error: Server not running at {BASE_URL}")
        print(f"   Make sure to start the server with: python run.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_health_check():
    """Test the health check endpoint"""
    print("\n" + "="*60)
    print("🏥 Testing Health Check Endpoint")
    print("="*60)
    
    endpoint = f"{BASE_URL}/api/yield/health"
    
    try:
        response = requests.get(endpoint, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health Check Successful!")
            print(f"   Status: {result['status']}")
            print(f"   Service: {result['service']}")
            print(f"   ML Model Loaded: {result['ml_model_loaded']}")
            return result['ml_model_loaded']
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🌽 MAIZE YIELD PREDICTION - ML MODEL TEST")
    print("="*60)
    
    # Test 1: Direct prediction (without API)
    direct_success = test_direct_prediction()
    
    # Test 2: Health check
    health_success = test_health_check()
    
    # Test 3: API endpoint
    if health_success:
        api_success = test_api_endpoint()
    else:
        print("\n⚠️ Skipping API test - server not responding")
        api_success = False
    
    # Summary
    print("\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    print(f"   Direct Prediction: {'✅ PASS' if direct_success else '❌ FAIL'}")
    print(f"   Health Check: {'✅ PASS' if health_success else '❌ FAIL'}")
    print(f"   API Endpoint: {'✅ PASS' if api_success else '❌ FAIL'}")
    print("="*60)
    
    if direct_success and health_success and api_success:
        print("\n🎉 All tests passed! ML model is working correctly!")
    elif direct_success:
        print("\n⚠️ ML model works but API might have issues")
    else:
        print("\n❌ ML model has issues - check the logs")
