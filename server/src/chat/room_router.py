from fastapi import APIRouter
from pydantic import BaseModel
from core.supabase_client import supabase
import uuid


router = APIRouter(prefix="/chat", tags=["Chat Rooms"])


# ---------------------------
# Request body model
# ---------------------------
class RoomRequest(BaseModel):
    farmer_id: str
    district: str


# ---------------------------
# Create or get chat room
# ---------------------------
@router.post("/get-room")
def get_or_create_room(req: RoomRequest):

    farmer_id = req.farmer_id
    district = req.district

    # 1️⃣ Check if room already exists
    existing = (
        supabase
        .table("chat_rooms")
        .select("*")
        .eq("farmer_id", farmer_id)
        .execute()
    )

    if existing.data:
        return existing.data[0]

    # 2️⃣ Assign officer by district (UUID)
    officer = (
        supabase
        .table("profiles")
        .select("id")
        .eq("role", "officer")
        .eq("district", district)
        .limit(1)
        .execute()
    )

    if not officer.data:
        return {"error": "No officer available for this district"}

    officer_id = officer.data[0]["id"]

    # 3️⃣ Create new room
    new_room = {
        "id": str(uuid.uuid4()),
        "farmer_id": farmer_id,     # UUID
        "officer_id": officer_id,   # UUID ✅
        "district": district,
    }

    supabase.table("chat_rooms").insert(new_room).execute()
    return new_room



# ---------------------------
# Delete empty room
# ---------------------------
@router.delete("/delete-if-empty/{room_id}")
def delete_if_empty(room_id: str):

    # Check if any messages exist
    msgs = (
        supabase.table("messages")
        .select("id")
        .eq("room_id", room_id)
        .execute()
    )

    if msgs.data:
        return {"deleted": False, "reason": "Room has messages"}

    # Delete empty room
    supabase.table("chat_rooms").delete().eq("id", room_id).execute()
    return {"deleted": True}

@router.get("/rooms")
def get_all_rooms():
    result = supabase.table("chat_rooms").select("*").execute()
    return result.data

@router.get("/active-rooms")
def get_active_rooms():
    rooms = supabase.rpc("get_active_rooms").execute().data
    return rooms
