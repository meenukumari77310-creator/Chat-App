import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/mongodb.js";
import userRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://chat-app-frontend-ogk2.onrender.com"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Create server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://chat-app-frontend-ogk2.onrender.com"
    ],
    credentials: true
  }
});

// ✅ Export io for controllers
export { io };

// Routes
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("✅ Chat App Backend is running");
});


// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server error" });
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (userId) => {
    if (userId) socket.join(userId.toString());
  });

  socket.on("send_message", (message) => {
    if (!message.chat?.users) return;
    message.chat.users.forEach((u) => {
      if (u._id !== message.sender._id) {
        io.to(u._id).emit("receive_message", message);
      }
    });
  });

  socket.on("join_chat", (chatId) => {
    if (chatId) {
      socket.join(chatId); // join the chat room
      console.log(`Socket ${socket.id} joined chat room ${chatId}`);
    }
  });

  socket.on("typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("typing", { userId });
  });

  socket.on("stop_typing", ({ chatId, userId }) => {
    socket.to(chatId).emit("stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};
startServer();
