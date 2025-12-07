import axios from "axios";
import { API_BASE } from "./api";

export async function getOrCreateRoom(farmerId: string, district: string) {
  const res = await axios.post(`${API_BASE}/chat/get-room`, {
    farmer_id: farmerId,
    district: district,
  });
  return res.data;
}

export async function deleteRoomIfEmpty(roomId: string) {
  return axios.delete(`${API_BASE}/chat/delete-if-empty/${roomId}`);
}
