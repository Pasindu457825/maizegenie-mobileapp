"""
Diagnostic script for testing notifications API endpoints
Run this to debug notification fetching issues

IMPORTANT: This script uses the API address you pass to it, which should match your .env configuration!

Usage:
    python test_notifications.py                    # Uses default localhost
    python test_notifications.py http://192.168.8.134:8000   # Uses your .env API_BASE address
"""

import requests
import sys
from pathlib import Path

# Add parent directory to path for imports
ROOT = Path(__file__).resolve().parent.parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from core.supabase_client import supabase

# Configuration - Use command line argument or default
API_BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000"

def test_notifications_service():
    """Test the notifications service"""
    print("=" * 80)
    print("NOTIFICATIONS API DIAGNOSTIC TOOL")
    print("=" * 80)
    
    # Show which API is being tested
    print(f"\nTesting API endpoint: {API_BASE}")
    print(f"   (Make sure this matches your client's EXPO_PUBLIC_API_BASE)")
    print()
    
    # Test 1: Health check (no authentication required)
    print("\nTest 1: Health Check (No Auth Required)")
    print("-" * 80)
    try:
        response = requests.get(f"{API_BASE}/api/notifications/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {str(e)}")
        print(f"   Make sure server is running at {API_BASE}")
    
    # Test 2: Check Supabase connection
    print("\n Test 2: Supabase Connection")
    print("-" * 80)
    try:
        response = supabase.table("notifications").select("count(id)").limit(1).execute()
        print(f" Successfully connected to notifications table")
        print(f" Response: {response}")
    except Exception as e:
        print(f"❌ Failed to query notifications table: {str(e)}")
    
    # Test 3: Check if notifications table exists and has correct structure
    print("\n Test 3: Notifications Table Structure")
    print("-" * 80)
    try:
        response = supabase.table("notifications").select("*").limit(1).execute()
        if response.data:
            sample = response.data[0]
            print(f" Sample notification structure:")
            for key, value in sample.items():
                print(f"   - {key}: {type(value).__name__}")
        else:
            print(f"  No notifications in database yet (this is OK)")
    except Exception as e:
        print(f" Error querying notifications table: {str(e)}")
    
    # Test 4: Authentication system check
    print("\n Test 4: Authentication System Check")
    print("-" * 80)
    try:
        # Get current user info (this should work if Supabase is configured)
        print(f"  Supabase URL: {supabase.url if hasattr(supabase, 'url') else 'Not available'}")
        print(f"  Attempting to verify Supabase is configured...")
        
        # Try a simple auth check
        from core.auth_dependencies import get_current_user
        print(f" Auth dependencies module loaded successfully")
    except Exception as e:
        print(f" Error with authentication: {str(e)}")
    
    # Test 5: Common issues checklist
    print("\n Test 5: Common Issues Checklist")
    print("-" * 80)
    print(" Check if notifications table exists in Supabase database")
    print(" Check if server is running (test health endpoint)")
    print(" Check if authentication token is valid")
    print(" Check if user has a valid user_id in Supabase auth")
    print(" Check if API_BASE URL is correct in .env file")
    print(" Check CORS settings on server")
    print(" Check firewall/network connectivity to server")
    
    # Test 6: Environment info
    print("\n Test 6: Environment Information")
    print("-" * 80)
    print(f"  Python version: {sys.version}")
    print(f" API Base URL (local): {API_BASE}")
    print(f" Script location: {__file__}")
    
    print("\n" + "=" * 80)
    print("NEXT STEPS:")
    print("=" * 80)
    print("\n  MATCH YOUR CLIENT'S API_BASE:")
    print("   Client uses: EXPO_PUBLIC_API_BASE from .env")
    print("   Currently set to: 192.168.8.134:8000")
    print(f"   Script tested: {API_BASE}")
    print("\n  IF ON A DIFFERENT WIFI:")
    print("   - Find your server's IP on the current network")
    print("   - Run: python test_notifications.py http://<YOUR_SERVER_IP>:8000")
    print("   - OR update EXPO_PUBLIC_API_BASE in .env to the correct IP")
    print("\n  EXAMPLE FOR DIFFERENT NETWORKS:")
    print("   Home WiFi:     python test_notifications.py http://192.168.1.100:8000")
    print("   Office WiFi:   python test_notifications.py http://10.0.0.50:8000")
    print("   Mobile Hotspot: python test_notifications.py http://172.20.10.2:8000")
    print("\n  IF SERVER IS ON SAME MACHINE:")
    print("   python test_notifications.py http://localhost:8000")
    print("=" * 80)

if __name__ == "__main__":
    test_notifications_service()
