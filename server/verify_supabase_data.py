"""
Verify data in Supabase tables
"""

import sys
from pathlib import Path

# Add src to path
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from supabase import create_client
from core.config import settings

# Initialize Supabase client
supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

def check_farmer_inputs():
    """Check farmer_inputs table"""
    print("\n" + "="*60)
    print("📊 Checking FARMER_INPUTS Table")
    print("="*60)
    
    try:
        result = supabase.table('farmer_inputs').select('*').order('created_at', desc=True).limit(5).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} records")
            for i, record in enumerate(result.data, 1):
                print(f"\n{i}. Record ID: {record['id']}")
                print(f"   Farmer ID: {record['farmer_id']}")
                print(f"   District: {record['district']}")
                print(f"   Season: {record['season']}")
                print(f"   Variety: {record['maize_variety']}")
                print(f"   Land Size: {record['land_size_hectares']} ha")
                print(f"   Soil: {record['soil_condition']}")
                print(f"   Irrigation: {record['irrigation_type']}")
                print(f"   Status: {record['status']}")
                print(f"   Created: {record['created_at']}")
        else:
            print("❌ No records found")
            
        return len(result.data) if result.data else 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 0

def check_predictions():
    """Check predictions table"""
    print("\n" + "="*60)
    print("📊 Checking PREDICTIONS Table")
    print("="*60)
    
    try:
        result = supabase.table('predictions').select('*').order('created_at', desc=True).limit(5).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} records")
            for i, record in enumerate(result.data, 1):
                print(f"\n{i}. Prediction ID: {record['id']}")
                print(f"   Farmer Input ID: {record['farmer_input_id']}")
                print(f"   Predicted Yield: {record['predicted_yield_kg_per_ha']} kg/ha")
                print(f"   Confidence: {record['confidence_level']} ({record['confidence_score']}%)")
                print(f"   Method: {record['prediction_method']}")
                print(f"   Limiting Factors: {record.get('primary_limiting_factors', [])}")
                print(f"   Created: {record['created_at']}")
        else:
            print("❌ No records found")
            
        return len(result.data) if result.data else 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 0

def check_fertilizer_advice():
    """Check fertilizer_advice table"""
    print("\n" + "="*60)
    print("📊 Checking FERTILIZER_ADVICE Table")
    print("="*60)
    
    try:
        result = supabase.table('fertilizer_advice').select('*').order('created_at', desc=True).limit(5).execute()
        
        if result.data:
            print(f"✅ Found {len(result.data)} records")
            for i, record in enumerate(result.data, 1):
                print(f"\n{i}. Advice ID: {record['id']}")
                print(f"   Prediction ID: {record['prediction_id']}")
                print(f"   Farmer ID: {record['farmer_id']}")
                print(f"   Basal Urea: {record.get('basal_urea_kg', 0)} kg")
                print(f"   Status: Basal={record.get('basal_status')}, TD1={record.get('first_topdress_status')}")
                print(f"   Created: {record['created_at']}")
        else:
            print("❌ No records found (Expected - farmer endpoint doesn't create fertilizer advice)")
            
        return len(result.data) if result.data else 0
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return 0

def main():
    """Main verification"""
    print("\n" + "="*60)
    print("🔍 SUPABASE DATA VERIFICATION")
    print("="*60)
    print(f"URL: {settings.SUPABASE_URL}")
    print(f"Using: SERVICE_KEY")
    
    farmer_inputs_count = check_farmer_inputs()
    predictions_count = check_predictions()
    fertilizer_count = check_fertilizer_advice()
    
    print("\n" + "="*60)
    print("📋 SUMMARY")
    print("="*60)
    print(f"Farmer Inputs: {farmer_inputs_count} records")
    print(f"Predictions: {predictions_count} records")
    print(f"Fertilizer Advice: {fertilizer_count} records")
    
    if farmer_inputs_count > 0 and predictions_count > 0:
        print("\n✅ SUCCESS! Data is being saved to Supabase!")
        print("\n📝 Next Steps:")
        print("   1. ✅ Backend is working correctly")
        print("   2. ✅ Database integration is complete")
        print("   3. 🔄 Update frontend to use /api/v1/yield-prediction/farmer")
        print("   4. 📱 Test with mobile app")
    elif farmer_inputs_count == 0 and predictions_count == 0:
        print("\n⚠️  NO DATA FOUND!")
        print("\n🔧 Troubleshooting:")
        print("   1. Check if RLS policies are correct")
        print("   2. Verify SERVICE_KEY has correct permissions")
        print("   3. Check server logs for errors")
        print("   4. Run: .venv\\Scripts\\python test_farmer_endpoint.py")
    else:
        print("\n⚠️  PARTIAL DATA!")
        print("   Some tables have data, others don't")
        print("   Check the logs above for details")

if __name__ == "__main__":
    main()
