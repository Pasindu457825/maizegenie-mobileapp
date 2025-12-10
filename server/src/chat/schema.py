from pydantic import BaseModel
from datetime import datetime
import uuid
from typing import Optional

class ChatMessage(BaseModel):
    id: str = str(uuid.uuid4())
    room_id: str
    sender_id: str
    message: Optional[str] = None
    image_url: Optional[str] = None
    created_at: str = datetime.utcnow().isoformat()  # <-- FIXED
