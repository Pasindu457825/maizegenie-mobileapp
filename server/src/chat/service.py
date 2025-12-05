from src.core.supabase_client import supabase

def get_officer_for_district(district: str):
    response = supabase.table("profiles") \
        .select("*") \
        .eq("role", "officer") \
        .eq("district", district) \
        .maybe_single()
    
    if response is None:
        return None
    
    return response


def get_or_create_chat_room(farmer_id: str, district: str):
    # 1. Find officer in same district
    officer = get_officer_for_district(district)
    if officer is None:
        return None, "No officer available for this district"

    officer_id = officer["id"]

    # 2. Check if room already exists
    existing = supabase.table("chat_rooms") \
        .select("*") \
        .eq("farmer_id", farmer_id) \
        .eq("officer_id", officer_id) \
        .maybe_single()

    if existing:
        return existing, None

    # 3. Create new room
    new_room = supabase.table("chat_rooms") \
        .insert({
            "farmer_id": farmer_id,
            "officer_id": officer_id
        }) \
        .select("*") \
        .single() \
        .execute()

    return new_room.data, None
