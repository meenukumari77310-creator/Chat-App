// frontend/utils/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "https://chat-app-backend-dk74.onrender.com"; // ✅ Render backend

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});
