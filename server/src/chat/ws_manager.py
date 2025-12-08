from fastapi import WebSocket
from typing import Dict, List


class ConnectionManager:
    def __init__(self):
        # room_id → list of connections
        self.active_rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room_id: str, websocket: WebSocket):
        await websocket.accept()

        if room_id not in self.active_rooms:
            self.active_rooms[room_id] = []

        self.active_rooms[room_id].append(websocket)
        print(f"🔌 WebSocket connected: room={room_id}")

    def disconnect(self, room_id: str, websocket: WebSocket):
        if room_id in self.active_rooms:
            self.active_rooms[room_id].remove(websocket)
            print(f"❌ WebSocket disconnected: room={room_id}")

    async def broadcast(self, room_id: str, message: dict):
        if room_id not in self.active_rooms:
            return

        for connection in self.active_rooms[room_id]:
            await connection.send_json(message)
