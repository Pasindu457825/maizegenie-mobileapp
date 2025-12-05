from src.core.supabase_client import supabase

# -----------------------------
# Get officer for district
# -----------------------------
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
        return None   # No officer found in this district

    return response.data[0]   # Officer row


# -----------------------------
# Create or get chat room
# -----------------------------
def get_or_create_chat_room(farmer_id: str, district: str):

    # 1️⃣ Get the officer for this district
    officer = get_officer_for_district(district)
    if officer is None:
        return None, "No officer available for this district"

    officer_id = officer["id"]

    # 2️⃣ Check if a chat room already exists
    existing = (
        supabase.table("chat_rooms")
        .select("*")
        .eq("farmer_id", farmer_id)
        .eq("officer_id", officer_id)
        .limit(1)
        .execute()
    )

    if existing.data:
        return existing.data[0], None   # Return existing room

    # 3️⃣ Create new chat room
    created = (
        supabase.table("chat_rooms")
        .insert({
            "farmer_id": farmer_id,
            "officer_id": officer_id
        })
        .select("*")
        .execute()
    )

    if created.data:
        return created.data[0], None

    return None, "Failed to create chat room"
