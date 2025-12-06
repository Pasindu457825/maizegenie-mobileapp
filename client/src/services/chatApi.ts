import { API_BASE } from "./api";
import axios from "axios";

export const sendFarmerMessage = async (farmerId: string, message: string) => {
  return axios.post(`${API_BASE}/chat/send`, {
    farmer_id: farmerId,
    message,
  });
};

export const sendOfficerReply = async (
  farmerId: string,
  officerId: string,
  message: string
) => {
  return axios.post(`${API_BASE}/chat/reply`, {
    farmer_id: farmerId,
    officer_id: officerId,
    message,
  });
};

export const getChatHistory = async (farmerId: string) => {
  return axios.get(`${API_BASE}/chat/history/${farmerId}`);
};
