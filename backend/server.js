// const { createServer } = require("http");
// const { Server } = require("socket.io");
// const express = require("express");
// const cors = require("cors");

// const app = express();

// // Enable CORS for frontend
// app.use(cors({
//     origin: process.env.FRONTEND_URL || "*",
//     credentials: true
// }));

// app.use(express.json());

// // Health check endpoint
// app.get("/", (req, res) => {
//     res.json({ 
//         status: "ok", 
//         message: "PeerTalks Backend API",
//         timestamp: new Date().toISOString()
//     });
// });

// const httpServer = createServer(app);

// // Store online users: { username: socketId }
// const onlineUsers = new Map();

// // Store user's active chats: { socketId: { username, chatId } }
// const userSessions = new Map();

// // Setup Socket.IO
// const io = new Server(httpServer, {
//     cors: {
//         origin: process.env.FRONTEND_URL || "*",
//         methods: ["GET", "POST"],
//         credentials: true
//     },
//     transports: ['websocket', 'polling']
// });

// io.on("connection", (socket) => {
//     console.log("User connected:", socket.id);

//     // Handle user coming online
//     socket.on("user-online", (username) => {
//         console.log(`${username} is now online`);
//         onlineUsers.set(username, socket.id);
//         userSessions.set(socket.id, { username });
        
//         io.emit("user-status-change", {
//             username: username,
//             status: "online"
//         });
//     });

//     // Handle joining a chat room
//     socket.on("join-chat", (data) => {
//         const { chatId, username } = data;
//         socket.join(chatId);
//         console.log(`User ${username} joined chat room: ${chatId}`);
        
//         const session = userSessions.get(socket.id);
//         if (session) {
//             session.chatId = chatId;
//             userSessions.set(socket.id, session);
//         }
        
//         socket.to(chatId).emit("user-joined-chat", {
//             username: username,
//             chatId: chatId
//         });
//     });

//     // Handle leaving a chat room
//     socket.on("leave-chat", (data) => {
//         const { chatId, username } = data;
//         socket.leave(chatId);
//         console.log(`User ${username} left chat room: ${chatId}`);
        
//         socket.to(chatId).emit("user-left-chat", {
//             username: username,
//             chatId: chatId
//         });
//     });

//     // Handle sending messages
//     socket.on("send-message", (data) => {
//         console.log("Message received:", data);
//         io.to(data.chatId).emit("receive-message", data);
//     });

//     // Handle typing indicator
//     socket.on("typing", (data) => {
//         socket.to(data.chatId).emit("user-typing", data);
//     });

//     // Handle disconnection
//     socket.on("disconnect", () => {
//         console.log("User disconnected:", socket.id);
        
//         const session = userSessions.get(socket.id);
//         if (session && session.username) {
//             const username = session.username;
//             onlineUsers.delete(username);
//             userSessions.delete(socket.id);
            
//             io.emit("user-status-change", {
//                 username: username,
//                 status: "offline"
//             });
            
//             console.log(`${username} is now offline`);
//         }
//     });

//     // Get online users list
//     socket.on("get-online-users", (callback) => {
//         const usernames = Array.from(onlineUsers.keys());
//         callback(usernames);
//     });
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// httpServer.listen(PORT, () => {
//     console.log(`🚀 Backend server running on port ${PORT}`);
//     console.log(`📡 Socket.IO ready for connections`);
// });

require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

// Enable CORS for frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.use(express.json());

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
pool.getConnection()
    .then(connection => {
        console.log('✅ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err);
    });

// Helper function to update last_seen in database
async function updateLastSeen(username) {
    try {
        await pool.query(
            'UPDATE users SET last_seen = NOW() WHERE username = ?',
            [username]
        );
        console.log(`Updated last_seen for ${username}`);
    } catch (error) {
        console.error('Error updating last_seen:', error);
    }
}

// Health check endpoint
app.get("/", (req, res) => {
    res.json({ 
        status: "ok", 
        message: "PeerTalks Backend API",
        timestamp: new Date().toISOString()
    });
});

// API endpoint to get user status and last seen
app.get('/api/user-status/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Check if user is online
        const isOnline = onlineUsers.has(username);
        
        if (isOnline) {
            return res.json({
                isOnline: true,
                lastSeen: null
            });
        }
        
        // Get last_seen from database
        const [users] = await pool.query(
            'SELECT last_seen FROM users WHERE username = ?',
            [username]
        );
        
        if (users.length > 0) {
            return res.json({
                isOnline: false,
                lastSeen: users[0].last_seen
            });
        }
        
        res.status(404).json({ error: 'User not found' });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// API endpoint to get the other user in a one-on-one chat
app.get('/api/chat-contact/:chatId/:username', async (req, res) => {
    try {
        const { chatId, username } = req.params;
        
        const [contacts] = await pool.query(
            'SELECT contactname, u.fname, u.lname FROM contact c JOIN users u ON c.contactname = u.username WHERE c.username = ? AND c.chat_id = ?',
            [username, chatId]
        );
        
        if (contacts.length > 0) {
            return res.json({
                username: contacts[0].contactname,
                fname: contacts[0].fname,
                lname: contacts[0].lname
            });
        }
        
        res.status(404).json({ error: 'Contact not found' });
    } catch (error) {
        console.error('Error fetching chat contact:', error);
        res.status(500).json({ error: 'Server error' });
    }
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
    socket.on("user-online", async (username) => {
        console.log(`${username} is now online`);
        onlineUsers.set(username, socket.id);
        userSessions.set(socket.id, { username });
        
        // Update last_seen in database
        await updateLastSeen(username);
        
        io.emit("user-status-change", {
            username: username,
            status: "online"
        });
    });

    // Handle joining a chat room
    socket.on("join-chat", async (data) => {
        const { chatId, username } = data;
        socket.join(chatId);
        console.log(`User ${username} joined chat room: ${chatId}`);
        
        // Mark user as online
        onlineUsers.set(username, socket.id);
        
        const session = userSessions.get(socket.id);
        if (session) {
            session.chatId = chatId;
            session.username = username;
            userSessions.set(socket.id, session);
        } else {
            userSessions.set(socket.id, { username, chatId });
        }
        
        // Update last_seen in database
        await updateLastSeen(username);
        
        // Notify others in the chat that this user is online
        socket.to(chatId).emit("user-status-changed", {
            username: username,
            isOnline: true
        });
        
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
    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);
        
        const session = userSessions.get(socket.id);
        if (session && session.username) {
            const username = session.username;
            const chatId = session.chatId;
            
            // Remove from online users
            onlineUsers.delete(username);
            
            // Update last_seen in database
            await updateLastSeen(username);
            
            // IMPORTANT: Broadcast to chat room BEFORE removing session
            if (chatId) {
                socket.to(chatId).emit("user-status-changed", {
                    username: username,
                    isOnline: false
                });
                console.log(`Notified chat ${chatId} that ${username} is offline`);
            }
            
            // Broadcast globally
            io.emit("user-status-change", {
                username: username,
                status: "offline"
            });
            
            // Remove session AFTER broadcasting
            userSessions.delete(socket.id);
            
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