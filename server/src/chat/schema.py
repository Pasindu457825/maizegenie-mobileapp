from pydantic import BaseModel

class ChatRoomRequest(BaseModel):
    farmer_id: str
    district: str  # Use this to find correct officer
