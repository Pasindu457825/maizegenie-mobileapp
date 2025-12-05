from fastapi import APIRouter, HTTPException
from src.chat.schema import ChatRoomRequest
from src.chat.service import get_or_create_chat_room

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/get-room")
def create_or_get_room(req: ChatRoomRequest):
    room, error = get_or_create_chat_room(req.farmer_id, req.district)

    if error:
        raise HTTPException(status_code=400, detail=error)

    return {
        "room_id": room["id"],
        "officer_id": room["officer_id"]
    }
