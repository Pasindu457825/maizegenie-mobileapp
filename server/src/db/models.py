from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DiseaseDetectionLog(BaseModel):
    id: Optional[int] = None
    class_name: str
    confidence: float
    image_url: Optional[str] = None
    annotated_image_url: Optional[str] = None
    user_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
