# src/chat/schemas.py
from pydantic import BaseModel

class FarmerMessage(BaseModel):
    farmer_id: str
    message: str

class OfficerReply(BaseModel):
    farmer_id: str
    officer_id: str
    message: str
