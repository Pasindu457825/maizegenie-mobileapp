import axios from "axios";
import { API_BASE } from "./api";

export async function getChatHistory(roomId: string) {
  try {
    const res = await axios.get(`${API_BASE}/chat/history/${roomId}`);
    return res.data;
  } catch (err) {
    console.error("Failed to load chat history", err);
    return [];
  }
}
