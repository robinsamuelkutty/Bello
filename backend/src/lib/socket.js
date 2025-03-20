import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle call initiation
  socket.on("callUser", (data) => {
    const receiverSocketId = userSocketMap[data.to];
    console.log("Receiver socket ID:", receiverSocketId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("incomingCall", {
        from: data.from,
        type: data.type // 'video' or 'voice'
      });
      console.log("Incoming call sent to receiver:", data);
    } else {
      console.log("Receiver not found or not connected");
    }
  });

  // Handle call acceptance
  socket.on("callAccepted", (data) => {
    const callerSocketId = userSocketMap[data.to];
    if (callerSocketId) {
      console.log("Relaying callAccepted to caller:", callerSocketId);
      io.to(callerSocketId).emit("callAccepted", {
        from: data.from  // Pass the receiver info to the caller
      });
    }
  });

  // Handle call rejection
  socket.on("callRejected", (data) => {
    const callerSocketId = userSocketMap[data.to];
    if (callerSocketId) {
      io.to(callerSocketId).emit("callRejected");
    }
  });

  // Handle call end
  socket.on("callEnded", (data) => {
    const otherUserSocketId = userSocketMap[data.to];
    if (otherUserSocketId) {
      io.to(otherUserSocketId).emit("callEnded");
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };