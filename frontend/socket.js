import { io } from "socket.io-client";

const token = localStorage.getItem("token"); // Ensure the token is available

const socket = io(import.meta.env.VITE_API_URL, {
  transports: ["websocket"],
  auth: { token },
});

export default socket;