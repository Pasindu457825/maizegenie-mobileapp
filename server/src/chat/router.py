from fastapi import APIRouter
from .schema import ChatRoomRequest
from .service import get_or_create_chat_room

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("/get-room")
def create_or_get_room(req: ChatRoomRequest):
    room, error = get_or_create_chat_room(req.farmer_id, req.district)

    if error:
        return {"error": error}

    return {"room": room}
