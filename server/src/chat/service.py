# src/chat/service.py
from supabase import create_client
from src.core.config import settings

supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def save_farmer_message(farmer_id: str, message: str):
    data = {
        "farmer_id": farmer_id,
        "sender": "farmer",
        "message": message,
    }
    return supabase.table("messages").insert(data).execute()


def save_officer_reply(farmer_id: str, officer_id: str, message: str):
    data = {
        "farmer_id": farmer_id,
        "officer_id": officer_id,
        "sender": "officer",
        "message": message,
    }
    return supabase.table("messages").insert(data).execute()


def get_chat_history(farmer_id: str):
    return (
        supabase.table("messages")
        .select("*")
        .eq("farmer_id", farmer_id)
        .order("created_at", desc=False)
        .execute()
    )
