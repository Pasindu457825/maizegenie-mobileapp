"""
Test script for Farmer Yield Prediction Endpoint
"""

import requests
import json
from datetime import datetime, timedelta

# API Configuration
BASE_URL = "http://localhost:8000"
FARMER_ENDPOINT = f"{BASE_URL}/api/v1/yield-prediction/farmer"
HEALTH_ENDPOINT = f"{BASE_URL}/api/v1/farmer/health"

def test_farmer_health():
    """Test farmer service health check"""
    print("\n" + "="*60)
    print("🔍 Testing Farmer Health Endpoint...")
    print("="*60)
    
    try:
        response = requests.get(HEALTH_ENDPOINT)
        print(f"✅ Health Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   ML Model: {'✅ Loaded' if data.get('ml_model_loaded') else '⚠️ Using Fallback'}")
            print(f"   Database: {'✅ Connected' if data.get('database_connected') else '❌ Disconnected'}")
            print(f"   Features: {len(data.get('features', []))} available")
        
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_farmer_prediction():
    """Test farmer prediction endpoint with sample data"""
    print("\n" + "="*60)
    print("🔍 Testing Farmer Prediction Endpoint...")
    print("="*60)
    
    # Sample farmer data matching frontend structure
    planting_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    
    payload = {
        "farmer_id": "0d0da7cb-67a6-4c14-b688-6648fddce67f",  # Nimal Perera from Supabase (CORRECT ID)
        "district": "Monaragala",
        "location": "Wellawaya",
        "gps_lat": 6.7344,
        "gps_lng": 81.1014,
        "planting_date": planting_date,
        "season": "Yala",
        "land_size_value": 2.5,
        "land_size_unit": "Acres",
        "variety": "Pacific 999",
        "soil_condition": "Medium",
        "irrigation_type": "Irrigated",
        "rainfall_condition": "Normal",
        "farmer_message": "First time using this app"
    }
    
    print(f"\n📤 Sending Request:")
    print(f"   Farmer: Nimal Perera")
    print(f"   District: {payload['district']}")
    print(f"   Season: {payload['season']}")
    print(f"   Land Size: {payload['land_size_value']} {payload['land_size_unit']}")
    print(f"   Variety: {payload['variety']}")
    print(f"   Soil: {payload['soil_condition']}")
    print(f"   Irrigation: {payload['irrigation_type']}")
    
    try:
        response = requests.post(
            FARMER_ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n✅ Prediction Successful!")
            print(f"   Prediction ID: {data.get('prediction_id')}")
            print(f"   Farmer Input ID: {data.get('farmer_input_id')}")
            
            prediction = data.get('prediction', {})
            print(f"\n📈 Yield Prediction:")
            print(f"   Predicted Yield: {prediction.get('predicted_yield_kg_per_ha')} kg/ha")
            print(f"   Predicted Yield: {prediction.get('predicted_yield_tons_per_ha')} t/ha")
            print(f"   Confidence: {prediction.get('confidence_level')} ({prediction.get('confidence_score')}%)")
            print(f"   Method: {prediction.get('prediction_method')}")
            
            print(f"\n🎯 Impact Factors: {len(data.get('impact_factors', []))}")
            for factor in data.get('impact_factors', [])[:3]:
                print(f"   - {factor.get('factor')}: {factor.get('impact')}")
            
            print(f"\n⚠️  Limiting Factors:")
            for factor in data.get('primary_limiting_factors', []):
                print(f"   - {factor}")
            
            print(f"\n💡 Recommendations: {len(data.get('recommendations', []))}")
            for rec in data.get('recommendations', [])[:3]:
                print(f"   [{rec.get('priority')}] {rec.get('title_english')}")
            
            print(f"\n📝 Summary:")
            print(f"   EN: {data.get('summary_english')}")
            print(f"   SI: {data.get('summary_sinhala')}")
            
            return True
        else:
            print(f"❌ Request failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

def test_with_poor_conditions():
    """Test with poor farming conditions"""
    print("\n" + "="*60)
    print("🔍 Testing with Poor Conditions...")
    print("="*60)
    
    planting_date = (datetime.now() - timedelta(days=45)).strftime("%Y-%m-%d")
    
    payload = {
        "farmer_id": "0d0da7cb-67a6-4c14-b688-6648fddce67f",  # Nimal Perera (CORRECT ID)
        "district": "Monaragala",
        "location": "Buttala",
        "planting_date": planting_date,
        "season": "Yala",
        "land_size_value": 1.0,
        "land_size_unit": "Hectares",
        "variety": "Unknown",
        "soil_condition": "Poor",
        "irrigation_type": "Rainfed",
        "rainfall_condition": "Low"
    }
    
    print(f"   Testing: Poor soil + Rainfed + Low rainfall")
    
    try:
        response = requests.post(FARMER_ENDPOINT, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            prediction = data.get('prediction', {})
            
            print(f"✅ Prediction: {prediction.get('predicted_yield_tons_per_ha')} t/ha")
            print(f"   Confidence: {prediction.get('confidence_level')} ({prediction.get('confidence_score')}%)")
            print(f"   Limiting Factors: {', '.join(data.get('primary_limiting_factors', []))}")
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🚀 Testing MaizeGenie Farmer API")
    print("="*60)
    
    results = {
        "Health Check": test_farmer_health(),
        "Farmer Prediction": test_farmer_prediction(),
        "Poor Conditions": test_with_poor_conditions()
    }
    
    print("\n" + "="*60)
    print("📋 Test Results:")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    all_passed = all(results.values())
    
    if all_passed:
        print("\n🎉 All Tests Passed! Farmer endpoint is ready!")
        print("\n📝 Next Steps:")
        print("   1. Check Supabase tables for saved data")
        print("   2. Update frontend to use this endpoint")
        print("   3. Test with real mobile app")
    else:
        print("\n⚠️  Some tests failed. Check the logs above.")
    
    return all_passed

if __name__ == "__main__":
    main()
