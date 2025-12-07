"""
Check what users exist in profiles table
"""

import sys
from pathlib import Path

# Add src to path
ROOT = Path(__file__).resolve().parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

from supabase import create_client
from core.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

print("="*60)
print("👥 CHECKING PROFILES TABLE")
print("="*60)

try:
    result = supabase.table('profiles').select('*').execute()
    
    if result.data:
        print(f"✅ Found {len(result.data)} users:\n")
        for user in result.data:
            print(f"ID: {user['id']}")
            print(f"   Name: {user.get('full_name', 'N/A')}")
            print(f"   Email: {user.get('email', 'N/A')}")
            print(f"   Role: {user.get('role', 'N/A')}")
            print(f"   District: {user.get('district', 'N/A')}")
            print()
    else:
        print("❌ No users found in profiles table!")
        print("\n🔧 You need to:")
        print("   1. Create a user account in Supabase Auth")
        print("   2. Add their profile to the profiles table")
        print("   3. Use that user's ID in the test")
        
except Exception as e:
    print(f"❌ Error: {e}")
