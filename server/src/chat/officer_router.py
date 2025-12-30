from fastapi import APIRouter
from core.supabase_client import supabase

router = APIRouter(prefix="/chat/officer", tags=["Officer Chat"])

@router.get("/rooms/{officer_id}")
def get_assigned_rooms(officer_id: str):

    res = (
        supabase
        .table("chat_rooms")
        .select("""
            id,
            farmer_id,
            officer_id,
            district,
            created_at,
            farmer:profiles!chat_rooms_farmer_id_fkey (
                full_name
            )
        """)
        .eq("officer_id", officer_id)
        .execute()
    )

    return res.data or []
