# src/chat/router.py
from fastapi import APIRouter, HTTPException
from src.chat.schema import FarmerMessage, OfficerReply
from src.chat.service import (
    save_farmer_message,
    save_officer_reply,
    get_chat_history,
)


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/send")
def send_message(payload: FarmerMessage):
    result = save_farmer_message(payload.farmer_id, payload.message)

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save message")

    return {"status": "sent"}


@router.post("/reply")
def officer_reply(payload: OfficerReply):
    result = save_officer_reply(
        payload.farmer_id, payload.officer_id, payload.message
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save reply")

    return {"status": "sent"}


@router.get("/history/{farmer_id}")
def history(farmer_id: str):
    result = get_chat_history(farmer_id)
    return result.data
