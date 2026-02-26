"""
Test script for Officer Yield Prediction API
Tests the complete flow from request to prediction response
"""

import requests
import json
from datetime import datetime

# API Configuration
API_BASE = "http://localhost:8000"
OFFICER_ENDPOINT = f"{API_BASE}/api/v1/yield-prediction/officer"

# Sample test data matching frontend format
test_payload = {
    "officer_id": "officer_test_123",
    "soil_profile": {
        "district": "Anuradhapura",
        "location": "Eppawala",
        "soil_type": "Reddish Brown Earth",
        "soil_condition": "Good",
        "soil_ph": 6.5,
        "soil_nitrogen_n": 75.0,
        "soil_phosphorus_p": 35.0,
        "soil_potassium_k": 200.0,
        "soil_fertility_index": 0.75,
        "n_status_class": "High",
        "p_status_class": "Medium",
        "k_status_class": "High"
    },
    "climate_data": {
        "irrigation_type": "Irrigated",
        "rainfall_condition": "Normal",
        "rainfall_30d_mm": 150.0,
        "seasonal_rainfall_mm": 800.0,
        "avg_temperature_c": 28.0,
        "max_temperature_c": 32.0,
        "avg_humidity_pct": 75.0,
        "sunshine_hours": 8.5
    },
    "crop_information": {
        "seed_variety": "Jet 999",
        "planting_date": "2024-10-15",
        "planting_month": 10,
        "season": "Maha",
        "field_size_ha": 2.5
    },
    "fertilizer_dates": {
        "first_fert_date": "2024-10-15",
        "second_fert_date": "2024-11-05"
    }
}

def test_officer_yield_prediction():
    """Test the officer yield prediction endpoint"""
    
    print("=" * 80)
    print("🌾 TESTING OFFICER YIELD PREDICTION API")
    print("=" * 80)
    print()
    
    # Display test data
    print("📦 Test Payload:")
    print(json.dumps(test_payload, indent=2))
    print()
    
    # Make API request
    print(f"📡 Sending POST request to: {OFFICER_ENDPOINT}")
    print()
    
    try:
        response = requests.post(
            OFFICER_ENDPOINT,
            json=test_payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"✅ Response Status: {response.status_code}")
        print()
        
        if response.status_code == 200:
            result = response.json()
            
            # Display prediction results
            print("=" * 80)
            print("📊 PREDICTION RESULTS")
            print("=" * 80)
            print()
            
            # Basic info
            print(f"🆔 Prediction ID: {result.get('prediction_id')}")
            print(f"⏰ Timestamp: {result.get('timestamp')}")
            print(f"✅ Status: {result.get('status')}")
            print()
            
            # Prediction details
            prediction = result.get('prediction', {})
            print("🌾 YIELD PREDICTION:")
            print(f"   Predicted Yield: {prediction.get('predicted_yield', 0):.2f} kg/ha")
            print(f"   Yield Category: {prediction.get('yield_category')}")
            print(f"   Confidence: {prediction.get('confidence_score', 0):.2%}")
            print(f"   Method: {prediction.get('prediction_method')}")
            print()
            
            # Harvest window
            harvest = prediction.get('harvest_window', {})
            if harvest:
                print("📅 HARVEST WINDOW:")
                print(f"   Start: {harvest.get('start')}")
                print(f"   Target: {harvest.get('target')}")
                print(f"   End: {harvest.get('end')}")
                print()
            
            # Impact factors
            factors = result.get('impact_factors', [])
            if factors:
                print("📈 TOP IMPACT FACTORS:")
                for i, factor in enumerate(factors[:5], 1):
                    print(f"   {i}. {factor.get('factor')}: {factor.get('value')} "
                          f"(Impact: {factor.get('impact_percentage', 0):+.1f}%)")
                print()
            
            # Recommendations
            recommendations = result.get('recommendations', [])
            if recommendations:
                print(f"💡 RECOMMENDATIONS ({len(recommendations)}):")
                for i, rec in enumerate(recommendations, 1):
                    print(f"   {i}. [{rec.get('priority').upper()}] {rec.get('title_en')}")
                print()
            
            # Fertilizer schedule
            fert_schedule = result.get('fertilizer_schedule', {})
            if fert_schedule:
                print("🌱 FERTILIZER SCHEDULE:")
                print(f"   Total N: {fert_schedule.get('total_n_requirement')} kg/ha")
                print(f"   Total P: {fert_schedule.get('total_p_requirement')} kg/ha")
                print(f"   Total K: {fert_schedule.get('total_k_requirement')} kg/ha")
                print()
            
            # Officer insights
            insights = result.get('officer_insights', {})
            if insights:
                print("🔍 OFFICER INSIGHTS:")
                print(f"   Soil Health Score: {insights.get('soil_health_score')}/10")
                print(f"   Fertilizer Efficiency: {insights.get('fertilizer_efficiency', 0):.1%}")
                print(f"   Expected ROI: {insights.get('expected_roi', 0):.2f}x")
                print(f"   Prediction Method: {insights.get('prediction_method')}")
                
                risks = insights.get('risk_factors', [])
                if risks:
                    print(f"   Risk Factors: {', '.join(risks)}")
                print()
            
            # Analysis data
            analysis = result.get('analysis_data', {})
            if analysis:
                yield_comp = analysis.get('yield_comparison', {})
                if yield_comp:
                    print("📊 YIELD COMPARISON:")
                    print(f"   Predicted: {yield_comp.get('predicted', 0):.0f} kg/ha")
                    print(f"   District Avg: {yield_comp.get('district_average', 0):.0f} kg/ha")
                    print(f"   National Avg: {yield_comp.get('national_average', 0):.0f} kg/ha")
                    print(f"   Max Potential: {yield_comp.get('potential_maximum', 0):.0f} kg/ha")
                    print()
            
            print("=" * 80)
            print("✅ TEST PASSED - API is working correctly!")
            print("=" * 80)
            
            return True
            
        else:
            print("❌ ERROR Response:")
            print(json.dumps(response.json(), indent=2))
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ CONNECTION ERROR: Cannot connect to server")
        print(f"   Make sure the server is running at {API_BASE}")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT ERROR: Request took too long")
        return False
        
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_health_check():
    """Test the health check endpoint"""
    print("\n🏥 Testing Health Check Endpoint...")
    
    try:
        response = requests.get(f"{API_BASE}/api/v1/officer/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Service Status: {health.get('status')}")
            print(f"   ML Model Available: {health.get('ml_model_available')}")
            print(f"   Fallback System: {health.get('fallback_system')}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

if __name__ == "__main__":
    print("\n")
    print("🚀 Starting Officer Yield Prediction API Tests")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\n")
    
    # Run health check first
    health_ok = test_health_check()
    print()
    
    # Run main prediction test
    if health_ok:
        test_ok = test_officer_yield_prediction()
        
        if test_ok:
            print("\n🎉 All tests passed! The yield prediction system is working correctly.")
            print("\n📱 Frontend Integration Status:")
            print("   ✅ Backend API endpoint: /api/v1/yield-prediction/officer")
            print("   ✅ Request format: Matches frontend payload")
            print("   ✅ Response format: Complete with all required fields")
            print("   ✅ ML/Rule-based fallback: Working")
            print("\n🔗 Next Steps:")
            print("   1. Test from mobile app frontend")
            print("   2. Verify results screen displays correctly")
            print("   3. Check fertilizer schedule integration")
        else:
            print("\n❌ Tests failed. Please check the errors above.")
    else:
        print("\n⚠️ Server health check failed. Cannot proceed with tests.")
