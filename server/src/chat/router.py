from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
import json
import uuid

from .ws_manager import ConnectionManager
from .schema import ChatMessage
from .service import save_message, load_history

router = APIRouter(prefix="/chat", tags=["Chat"])
manager = ConnectionManager()


@router.get("/history/{room_id}")
async def get_history(room_id: str):
    messages = await load_history(room_id)
    return JSONResponse(messages)


@router.websocket("/ws/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str):
    await manager.connect(room_id, websocket)

    try:
        while True:
            raw = await websocket.receive()

            # 🔥 Ignore ping / pong / binary frames
            if "text" not in raw or raw["text"] is None:
                continue

            # Safe JSON parsing
            data = json.loads(raw["text"])

            # Create message
            msg_obj = {
                "id": str(uuid.uuid4()),
                "room_id": room_id,
                "sender_id": data["sender_id"],
                "message": data["message"],
            }

            # Save to DB
            await save_message(ChatMessage(**msg_obj))

            # Broadcast to room
            await manager.broadcast(room_id, msg_obj)

    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
