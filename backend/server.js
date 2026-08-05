require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const { executeQuery } = require("./lib/db");

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true
}));

app.use(express.json());

const onlineUsers = new Map();
const userSessions = new Map();

async function updateLastSeen(username) {
    if (!username) return;

    await executeQuery(
        "UPDATE USERS SET last_seen = NOW() WHERE username = ?",
        [username]
    );
}

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "PeerTalks Backend API",
        timestamp: new Date().toISOString()
    });
});

app.get("/api/login", async (req, res) => {
    const { username, password } = req.query;
    const users = await executeQuery(
        "SELECT * FROM USERS WHERE username = ?",
        [username]
    );

    if (users.error) return res.json(users);

    res.json({
        success: users.length > 0 && users[0].password === password
    });
});

app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;
    const response = await executeQuery(
        "INSERT INTO USERS (username, password, regDate) VALUES (?, ?, CURDATE())",
        [username, password]
    );

    if (!response.error) {
        response.username = username;
        response.password = password;
    }

    res.json(response);
});

app.post("/api/register/setprofile", async (req, res) => {
    const { fname, lname, gender, bio, dob, username, password } = req.body;
    const response = await executeQuery(
        `UPDATE USERS
         SET FNAME = ?, LNAME = ?, GENDER = ?, BIO = ?, DOB = COALESCE(?, DOB)
         WHERE USERNAME = ?`,
        [fname, lname, gender, bio, dob || null, username]
    );

    if (!response.error) {
        response.username = username;
        response.password = password;
    }

    res.json(response);
});

app.get("/api/profile", async (req, res) => {
    const { username } = req.query;
    const users = await executeQuery(
        "SELECT * FROM USERS WHERE USERNAME = ? LIMIT 1",
        [username]
    );

    if (users.error) return res.json(users);

    res.json(users.length === 0 ? {} : users[0]);
});

app.get("/api/chat", async (req, res) => {
    const { username, password } = req.query;
    const authUsers = await executeQuery(
        "SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?",
        [username, password]
    );

    if (authUsers.error) return res.json(authUsers);
    if (authUsers.length === 0) return res.json({ success: false });

    const users = await executeQuery(
        `SELECT *
         FROM USERS U
         JOIN CONTACT C ON U.USERNAME = C.CONTACTNAME
         WHERE C.USERNAME = ?`,
        [username]
    );

    res.json({ users });
});

app.get("/api/chat/chatuser", async (req, res) => {
    const { username, chatid } = req.query;
    const users = await executeQuery(
        `SELECT *
         FROM USERS
         WHERE USERNAME IN (
             SELECT CONTACTNAME FROM CONTACT WHERE CHAT_ID = ? AND USERNAME = ?
         )`,
        [chatid, username]
    );

    if (users.error) return res.json(users);

    res.json(users[0] || {});
});

app.get("/api/chat/messages", async (req, res) => {
    const { chatid, sender } = req.query;
    const messages = await executeQuery(
        `SELECT *, IF(SENDER = ?, true, false) AS is_sender
         FROM MESSAGE
         WHERE CHAT_ID = ?
         ORDER BY time ASC`,
        [sender, chatid]
    );

    if (messages.error) return res.json(messages);

    res.json({ messages });
});

app.post("/api/chat/messages", async (req, res) => {
    const { message, chatid, sender } = req.body;
    const response = await executeQuery(
        "INSERT INTO MESSAGE VALUES (?, ?, ?, NOW(), false)",
        [chatid, sender, message]
    );

    if (response.error) return res.json(response);

    res.json({
        is_sender: true,
        content: message
    });
});

app.get("/api/user-status/:username", async (req, res) => {
    const { username } = req.params;

    if (onlineUsers.has(username)) {
        return res.json({
            isOnline: true,
            lastSeen: null
        });
    }

    const users = await executeQuery(
        "SELECT last_seen FROM USERS WHERE username = ?",
        [username]
    );

    if (users.error) return res.json(users);
    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    res.json({
        isOnline: false,
        lastSeen: users[0].last_seen
    });
});

app.get("/api/search", async (req, res) => {
    const { username, search } = req.query;
    const users = await executeQuery(
        `SELECT *
         FROM USERS
         WHERE USERNAME LIKE ?
           AND USERNAME <> ?
           AND USERNAME NOT IN (
               SELECT CONTACTNAME FROM CONTACT WHERE USERNAME = ?
           )
           AND USERNAME NOT IN (
               SELECT RECEIVER FROM FRIENDREQUEST WHERE SENDER = ?
           )`,
        [`%${search || ""}%`, username, username, username]
    );

    res.json({ users });
});

app.post("/api/search", async (req, res) => {
    const { username, contactuser } = req.body;
    const response = await executeQuery(
        "INSERT INTO FRIENDREQUEST VALUES (?, ?, NOW())",
        [username, contactuser]
    );

    res.json(response);
});

app.get("/api/friendrequest", async (req, res) => {
    const { username } = req.query;
    const users = await executeQuery(
        `SELECT *
         FROM USERS
         WHERE USERNAME IN (
             SELECT SENDER FROM FRIENDREQUEST WHERE RECEIVER = ?
         )`,
        [username]
    );

    res.json(users);
});

app.post("/api/friendrequest", async (req, res) => {
    const { sender, receiver, accepted } = req.body;

    const deleted = await executeQuery(
        `DELETE FROM FRIENDREQUEST
         WHERE (SENDER = ? AND RECEIVER = ?)
            OR (SENDER = ? AND RECEIVER = ?)`,
        [sender, receiver, receiver, sender]
    );

    if (deleted.error) return res.json(deleted);

    const msg = accepted
        ? "accepted Your Friend Request"
        : "declined Your Friend Request";

    await executeQuery(
        "INSERT INTO NOTIFICATIONS VALUES (?, ?, ?, NOW())",
        [receiver, sender, msg]
    );

    if (!accepted) return res.json({ success: true });

    const chat = await executeQuery(
        "INSERT INTO CHATS (create_time) VALUES (NOW())"
    );

    if (chat.error) return res.json(chat);

    const chatId = chat.insertId;
    const contacts = await executeQuery(
        "INSERT INTO CONTACT VALUES (?, ?, ?), (?, ?, ?)",
        [receiver, sender, chatId, sender, receiver, chatId]
    );

    if (!contacts.error) contacts.id = chatId;

    res.json(contacts);
});

app.get("/api/notification", async (req, res) => {
    const { username } = req.query;
    const notifications = await executeQuery(
        `SELECT *
         FROM NOTIFICATIONS N
         JOIN USERS U ON N.SENDERUSER = U.USERNAME
         WHERE N.USERNAME = ?
         ORDER BY N.time DESC`,
        [username]
    );

    res.json(notifications);
});

app.delete("/api/notification", async (req, res) => {
    const { username } = req.query;
    const response = await executeQuery(
        "DELETE FROM NOTIFICATIONS WHERE USERNAME = ?",
        [username]
    );

    res.json(response);
});

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("user-online", async (username) => {
        console.log(`${username} is now online`);
        onlineUsers.set(username, socket.id);
        userSessions.set(socket.id, { username });

        await updateLastSeen(username);

        io.emit("user-status-change", {
            username,
            status: "online"
        });
    });

    socket.on("join-chat", async (data) => {
        const { chatId, username } = data;
        socket.join(chatId);
        console.log(`User ${username} joined chat room: ${chatId}`);

        onlineUsers.set(username, socket.id);

        const session = userSessions.get(socket.id);
        userSessions.set(socket.id, {
            ...session,
            username,
            chatId
        });

        await updateLastSeen(username);

        socket.to(chatId).emit("user-status-changed", {
            username,
            isOnline: true
        });

        socket.to(chatId).emit("user-joined-chat", {
            username,
            chatId
        });
    });

    socket.on("leave-chat", (data) => {
        const { chatId, username } = data;
        socket.leave(chatId);
        console.log(`User ${username} left chat room: ${chatId}`);

        socket.to(chatId).emit("user-left-chat", {
            username,
            chatId
        });
    });

    socket.on("send-message", (data) => {
        console.log("Message received:", data);
        io.to(data.chatId).emit("receive-message", data);
    });

    socket.on("typing", (data) => {
        socket.to(data.chatId).emit("user-typing", data);
    });

    socket.on("disconnect", async () => {
        console.log("User disconnected:", socket.id);

        const session = userSessions.get(socket.id);
        if (session && session.username) {
            const { username, chatId } = session;

            onlineUsers.delete(username);
            await updateLastSeen(username);

            if (chatId) {
                socket.to(chatId).emit("user-status-changed", {
                    username,
                    isOnline: false
                });
            }

            io.emit("user-status-change", {
                username,
                status: "offline"
            });

            userSessions.delete(socket.id);
            console.log(`${username} is now offline`);
        }
    });

    socket.on("get-online-users", (callback) => {
        callback(Array.from(onlineUsers.keys()));
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log("📡 Socket.IO ready for connections");
});
