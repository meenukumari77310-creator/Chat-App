import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

// Create socket only once
export const socket = io(SOCKET_URL, {
  withCredentials: true, // important if you use cookies/sessions
  autoConnect: false,    // don’t auto connect immediately
});

// later in your app (e.g. in ChatPage useEffect):
// socket.connect();
// socket.emit("join_room", currentUser._id);
