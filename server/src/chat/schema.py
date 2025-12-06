from pydantic import BaseModel
from datetime import datetime
import uuid


class ChatMessage(BaseModel):
    id: str = str(uuid.uuid4())
    room_id: str
    sender_id: str
    message: str
    created_at: datetime = datetime.utcnow()


class CreateMessage(BaseModel):
    sender_id: str
    message: str
