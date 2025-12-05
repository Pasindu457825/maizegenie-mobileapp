# src/chat/router.py
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .schema import ChatRoomRequest, ChatMessageSend
from .service import (
    get_or_create_chat_room,
    save_chat_message,
    get_chat_messages,
)

router = APIRouter(prefix="/chat", tags=["Chat"])

# Store WebSocket connections in-memory
active_connections = {}  # room_id -> list of WebSocket objects


# 1️⃣ Create or get chat room
@router.post("/get-room")
def create_or_get_room(req: ChatRoomRequest):
    room, error = get_or_create_chat_room(req.farmer_id, req.district)

    if error:
        return {"error": error}

    return {"room": room}


# 2️⃣ Get messages for room (history)
@router.get("/messages/{room_id}")
def fetch_messages(room_id: str):
    msgs = get_chat_messages(room_id)
    return {"messages": msgs}


# 3️⃣ Send message via REST (fallback, also saves to DB)
@router.post("/send")
def send_message(msg: ChatMessageSend):
    saved = save_chat_message(msg.room_id, msg.sender_id, msg.message)

    # Broadcast over WebSockets if connected
    if msg.room_id in active_connections:
        for ws in active_connections[msg.room_id]:
            try:
                ws.send_json({
                    "sender_id": msg.sender_id,
                    "message": msg.message,
                    "timestamp": saved["timestamp"],
                })
            except:
                pass

    return {"success": True, "message": saved}


# 4️⃣ WebSocket endpoint for **real-time chat**
@router.websocket("/ws/{room_id}")
async def websocket_chat(websocket: WebSocket, room_id: str):
    await websocket.accept()

    if room_id not in active_connections:
        active_connections[room_id] = []

    active_connections[room_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()

            # Save message to DB
            saved = save_chat_message(
                room_id=room_id,
                sender_id=data["sender_id"],
                message=data["message"]
            )

            # Broadcast to all connected clients (farmer + officer)
            for ws in active_connections[room_id]:
                await ws.send_json({
                    "sender_id": saved["sender_id"],
                    "message": saved["message"],
                    "timestamp": saved["timestamp"]
                })

    except WebSocketDisconnect:
        active_connections[room_id].remove(websocket)
