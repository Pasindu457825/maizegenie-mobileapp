import { useEffect, useRef } from "react";

export function useChatWebSocket(
  roomId: string | null,
  onMessage: (msg: any) => void
) {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return; // stop when roomId not ready

    const wsUrl = `ws://192.168.1.12:8000/chat/ws/${roomId}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => console.log("WS Connected:", wsUrl);
    ws.current.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch (e) {
        console.log("WS parse error:", e);
      }
    };
    ws.current.onerror = (err) => console.log("WebSocket error:", err);
    ws.current.onclose = () => console.log("WS closed");

    return () => ws.current?.close();
  }, [roomId]);
  const sendTextMessage = (senderId: string, message: string) => {
    if (!ws.current) return;
    ws.current.send(JSON.stringify({ sender_id: senderId, message }));
  };

  const sendImageMessage = (senderId: string, imageUrl: string) => {
    if (!ws.current) return;
    ws.current.send(
      JSON.stringify({ sender_id: senderId, image_url: imageUrl })
    );
  };

  return { sendTextMessage, sendImageMessage };
}
