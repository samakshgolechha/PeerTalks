const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "PeerTalks Backend API",
        timestamp: new Date().toISOString()
    });
});

const httpServer = createServer(app);

// Store online users: { username: socketId }
const onlineUsers = new Map();

// Store user's active chats: { socketId: { username, chatId } }
const userSessions = new Map();

// Setup Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Handle user coming online
    socket.on("user-online", (username) => {
        console.log(`${username} is now online`);
        onlineUsers.set(username, socket.id);
        userSessions.set(socket.id, { username });
        
        io.emit("user-status-change", {
            username: username,
            status: "online"
        });
    });

    // Handle joining a chat room
    socket.on("join-chat", (data) => {
        const { chatId, username } = data;
        socket.join(chatId);
        console.log(`User ${username} joined chat room: ${chatId}`);
        
        const session = userSessions.get(socket.id);
        if (session) {
            session.chatId = chatId;
            userSessions.set(socket.id, session);
        }
        
        socket.to(chatId).emit("user-joined-chat", {
            username: username,
            chatId: chatId
        });
    });

    // Handle leaving a chat room
    socket.on("leave-chat", (data) => {
        const { chatId, username } = data;
        socket.leave(chatId);
        console.log(`User ${username} left chat room: ${chatId}`);
        
        socket.to(chatId).emit("user-left-chat", {
            username: username,
            chatId: chatId
        });
    });

    // Handle sending messages
    socket.on("send-message", (data) => {
        console.log("Message received:", data);
        io.to(data.chatId).emit("receive-message", data);
    });

    // Handle typing indicator
    socket.on("typing", (data) => {
        socket.to(data.chatId).emit("user-typing", data);
    });

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
        const session = userSessions.get(socket.id);
        if (session && session.username) {
            const username = session.username;
            onlineUsers.delete(username);
            userSessions.delete(socket.id);
            
            io.emit("user-status-change", {
                username: username,
                status: "offline"
            });
            
            console.log(`${username} is now offline`);
        }
    });

    // Get online users list
    socket.on("get-online-users", (callback) => {
        const usernames = Array.from(onlineUsers.keys());
        callback(usernames);
    });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready for connections`);
});