# src/chat/schema.py
from pydantic import BaseModel

class ChatRoomRequest(BaseModel):
    farmer_id: str
    district: str


class ChatMessageSend(BaseModel):
    room_id: str
    sender_id: str
    message: str
