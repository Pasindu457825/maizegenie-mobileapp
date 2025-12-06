from core.supabase_client import supabase
from .schema import ChatMessage

async def save_message(msg: ChatMessage):
    supabase.table("messages").insert({
        "id": msg.id,
        "room_id": msg.room_id,
        "sender_id": msg.sender_id,
        "message": msg.message,
        "created_at": msg.created_at.isoformat(),
    }).execute()
    return True


async def load_history(room_id: str):
    res = supabase.table("messages")\
        .select("*")\
        .eq("room_id", room_id)\
        .order("created_at", desc=False)\
        .execute()

    return res.data or []
