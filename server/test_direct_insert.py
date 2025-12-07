"""
Test direct Supabase insert to diagnose the issue
"""

import sys
from pathlib import Path
from datetime import datetime

# Add src to path
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from supabase import create_client
from core.config import settings

print("="*60)
print("🔧 DIRECT SUPABASE INSERT TEST")
print("="*60)
print(f"URL: {settings.SUPABASE_URL}")
print(f"Service Key: {settings.SUPABASE_SERVICE_KEY[:30]}...")
print()

# Initialize Supabase client
try:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    print("✅ Supabase client created")
except Exception as e:
    print(f"❌ Failed to create client: {e}")
    exit(1)

# Test 1: Insert into farmer_inputs
print("\n" + "="*60)
print("TEST 1: Insert into farmer_inputs")
print("="*60)

test_record = {
    'farmer_id': '0d0bdc7b-67d6-4c14-b588-664ff1a7c6e8',  # Nimal Perera
    'district': 'Monaragala',
    'season': 'Yala',
    'planting_date': '2024-11-07',
    'land_size_hectares': 1.01,
    'maize_variety': 'Test Variety',
    'soil_condition': 'Medium',
    'irrigation_type': 'Irrigated',
    'rainfall_situation': 'Normal',
    'pest_disease_issue': False,
    'organic_fertilizer_used': False,
    'farmer_message': 'Direct test insert',
    'status': 'completed'
}

print(f"📝 Attempting to insert:")
for key, value in test_record.items():
    print(f"   {key}: {value}")

try:
    result = supabase.table('farmer_inputs').insert(test_record).execute()
    
    print(f"\n📊 Raw Response:")
    print(f"   Type: {type(result)}")
    print(f"   Data: {result.data}")
    print(f"   Count: {result.count if hasattr(result, 'count') else 'N/A'}")
    
    if hasattr(result, '__dict__'):
        print(f"   Attributes: {result.__dict__}")
    
    if result.data:
        print(f"\n✅ INSERT SUCCESSFUL!")
        print(f"   Record ID: {result.data[0]['id']}")
        print(f"   Created at: {result.data[0]['created_at']}")
    else:
        print(f"\n❌ INSERT FAILED - No data returned")
        
except Exception as e:
    print(f"\n❌ INSERT ERROR:")
    print(f"   Type: {type(e).__name__}")
    print(f"   Message: {str(e)}")
    
    if hasattr(e, '__dict__'):
        print(f"   Details: {e.__dict__}")
    
    import traceback
    print(f"\n📋 Full Traceback:")
    traceback.print_exc()

# Test 2: Check if we can read from the table
print("\n" + "="*60)
print("TEST 2: Read from farmer_inputs")
print("="*60)

try:
    result = supabase.table('farmer_inputs').select('*').limit(1).execute()
    
    print(f"✅ READ SUCCESSFUL")
    print(f"   Records found: {len(result.data) if result.data else 0}")
    
    if result.data:
        print(f"   Sample record: {result.data[0]}")
    
except Exception as e:
    print(f"❌ READ ERROR: {e}")

# Test 3: Check table structure
print("\n" + "="*60)
print("TEST 3: Verify table exists")
print("="*60)

try:
    # Try to get table info
    result = supabase.table('farmer_inputs').select('id').limit(0).execute()
    print(f"✅ Table 'farmer_inputs' exists and is accessible")
except Exception as e:
    print(f"❌ Table access error: {e}")

print("\n" + "="*60)
print("🏁 TEST COMPLETE")
print("="*60)
