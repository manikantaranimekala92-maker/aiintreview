import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

logger = logging.getLogger(__name__)

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, interview_id: str, websocket: WebSocket):
        await websocket.accept()
        if interview_id not in self.active_connections:
            self.active_connections[interview_id] = []
        self.active_connections[interview_id].append(websocket)
        logger.info(f"WebSocket client connected to interview session {interview_id}")

    def disconnect(self, interview_id: str, websocket: WebSocket):
        if interview_id in self.active_connections:
            if websocket in self.active_connections[interview_id]:
                self.active_connections[interview_id].remove(websocket)
            if not self.active_connections[interview_id]:
                del self.active_connections[interview_id]

    async def broadcast(self, interview_id: str, message: dict):
        if interview_id in self.active_connections:
            for connection in self.active_connections[interview_id]:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to client: {e}")

manager = ConnectionManager()

@router.websocket("/ws/interviews/{interview_id}")
async def websocket_endpoint(websocket: WebSocket, interview_id: str):
    await manager.connect(interview_id, websocket)
    try:
        # Send initial status
        await websocket.send_json({
            "event": "connection_status",
            "status": "connected",
            "interview_id": interview_id,
            "message": "Connected to real-time AI interview pipeline."
        })

        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                event_type = payload.get("event")

                if event_type == "ping":
                    await websocket.send_json({"event": "pong", "timestamp": payload.get("timestamp")})
                elif event_type == "transcript_chunk":
                    await manager.broadcast(interview_id, {
                        "event": "transcript_update",
                        "speaker": payload.get("speaker", "candidate"),
                        "text": payload.get("text", "")
                    })
                elif event_type == "timer_sync":
                    await manager.broadcast(interview_id, {
                        "event": "timer_update",
                        "seconds_remaining": payload.get("seconds_remaining")
                    })
                else:
                    await websocket.send_json({"event": "ack", "received": payload})
            except json.JSONDecodeError:
                await websocket.send_json({"event": "error", "message": "Invalid JSON format"})

    except WebSocketDisconnect:
        manager.disconnect(interview_id, websocket)
        logger.info(f"WebSocket client disconnected from interview session {interview_id}")
