import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// store online users
const userSocketMap = {}; // { userId: socketId }

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  },
});

// helper
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  // add user
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  // broadcast online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // =========================
  // ✍️ Typing Indicator
  // =========================
  socket.on("typing", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderId: userId });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping", { senderId: userId });
    }
  });

  // =========================
  // ❤️ Message Reaction
  // =========================
  socket.on("reactMessage", ({ messageId, reaction, receiverId }) => {
    const receiverSocketId = userSocketMap[receiverId];

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageReaction", {
        messageId,
        reaction,
        userId,
      });
    }
  });

  // =========================
  // ⏱️ Last Seen
  // =========================
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (userId) {
      delete userSocketMap[userId];

      io.emit("userLastSeen", {
        userId,
        lastSeen: Date.now(),
      });
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
