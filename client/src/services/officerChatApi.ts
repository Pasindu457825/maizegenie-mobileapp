import axios from "axios";
import { API_BASE } from "./api";

export async function getOfficerRooms(officerId: string) {
  const res = await axios.get(`${API_BASE}/chat/officer/rooms/${officerId}`);
  return res.data;
}
