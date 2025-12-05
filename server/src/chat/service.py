from src.core.supabase_client import supabase

# 1️⃣ Get officer in same district
def get_officer_for_district(district: str):
    response = (
        supabase.table("profiles")
        .select("id")
        .eq("role", "officer")
        .eq("district", district)
        .limit(1)
        .execute()
    )

    if not response.data:
        return None

    return response.data[0]


# 2️⃣ Create or get chat room
def get_or_create_chat_room(farmer_id: str, district: str):
    officer = get_officer_for_district(district)
    if officer is None:
        return None, "No officer available for this district"

    officer_id = officer["id"]

    # Check if room already exists
    existing = (
        supabase.table("chat_rooms")
        .select("*")
        .eq("farmer_id", farmer_id)
        .eq("officer_id", officer_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        return existing.data[0], None

    # Create new room
    inserted = (
        supabase.table("chat_rooms")
        .insert({
            "farmer_id": farmer_id,
            "officer_id": officer_id
        })
        .execute()   # ✔ FIXED
    )

    if inserted.data:
        return inserted.data[0], None

    return None, "Failed to create chat room"
