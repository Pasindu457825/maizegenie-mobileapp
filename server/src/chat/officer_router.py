from fastapi import APIRouter
from core.supabase_client import supabase

router = APIRouter(prefix="/chat/officer", tags=["Officer Chat"])

# Get all rooms
@router.get("/rooms/{officer_id}")
def get_assigned_rooms(officer_id: str):

    # Officer ID no longer used
    res = (
        supabase.table("chat_rooms")
        .select("*")
        .execute()
    )

    return res.data or []

