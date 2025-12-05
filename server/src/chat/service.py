# src/chat/service.py
from src.core.supabase_client import supabase
from datetime import datetime


# Officer lookup
def get_officer_for_district(district: str):
    response = (
        supabase.table("profiles")
        .select("id")
        .eq("role", "officer")
        .eq("district", district)
        .limit(1)
        .execute()
    )

    return response.data[0] if response.data else None


# Create / Get chat room
def get_or_create_chat_room(farmer_id: str, district: str):
    officer = get_officer_for_district(district)
    if not officer:
        return None, "No officer available for this district."

    officer_id = officer["id"]

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

    # create
    inserted = (
        supabase.table("chat_rooms")
        .insert({
            "farmer_id": farmer_id,
            "officer_id": officer_id
        })
        .execute()
    )

    if inserted.data:
        return inserted.data[0], None

    return None, "Failed to create chat room"


# Save a message to DB
def save_chat_message(room_id: str, sender_id: str, message: str):
    timestamp = datetime.utcnow().isoformat()

    row = (
        supabase.table("chat_messages")
        .insert({
            "room_id": room_id,
            "sender_id": sender_id,
            "message": message,
            "timestamp": timestamp,
        })
        .execute()
    )

    return row.data[0]


# Get message history
def get_chat_messages(room_id: str):
    result = (
        supabase.table("chat_messages")
        .select("*")
        .eq("room_id", room_id)
        .order("timestamp", desc=False)
        .execute()
    )
    return result.data or []
