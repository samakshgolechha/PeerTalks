require("dotenv").config();

const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");
const { parsePhoneNumber } = require("libphonenumber-js");
const { executeQuery } = require("./lib/db");

const BCRYPT_SALT_ROUNDS = 12;

const app = express();

app.use(cors({
    origin: function (origin, callback) {
        // Echo the origin back to support credentials without hardcoding all possible local IPs
        callback(null, origin || true);
    },
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

// ── Legacy GET /api/login (kept for backward compat with existing chat pages) ──
app.get("/api/login", async (req, res) => {
    const { username, password } = req.query;
    const users = await executeQuery(
        "SELECT * FROM USERS WHERE username = ?",
        [username]
    );

    if (users.error) return res.json(users);

    if (users.length === 0) {
        return res.json({ success: false, message: "Invalid credentials." });
    }

    const user = users[0];

    // If user has a bcrypt hash, verify against it
    if (user.password_hash) {
        try {
            const match = await bcrypt.compare(password, user.password_hash);
            return res.json({ success: match, message: match ? undefined : "Invalid credentials." });
        } catch (err) {
            return res.json({ success: false, message: "Authentication error." });
        }
    }

    // Fallback: legacy plaintext comparison
    res.json({
        success: user.password === password,
        message: user.password === password ? undefined : "Invalid credentials."
    });
});

// ── NEW POST /api/login (used by the /auth page) ──
app.post("/api/login", async (req, res) => {
    try {
        const identifier = req.body.identifier || req.body.username;
        const password = req.body.password;

        if (!identifier || !password) {
            return res.status(400).json({ success: false, message: "Username/email and password are required." });
        }

        // Look up by username OR email
        const users = await executeQuery(
            "SELECT * FROM USERS WHERE username = ? OR email = ?",
            [identifier.trim(), identifier.trim().toLowerCase()]
        );

        if (users.error) {
            return res.status(500).json({ success: false, message: "Server error. Please try again." });
        }

        if (users.length === 0) {
            return res.json({ success: false, message: "Invalid username/email or password." });
        }

        const user = users[0];

        // Check if account is locked
        if (user.account_locked_until && new Date(user.account_locked_until) > new Date()) {
            const minutesLeft = Math.ceil((new Date(user.account_locked_until) - new Date()) / 60000);
            return res.json({
                success: false,
                message: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`
            });
        }

        let passwordValid = false;

        // Check bcrypt hash first (new accounts)
        if (user.password_hash) {
            passwordValid = await bcrypt.compare(password, user.password_hash);
        } else if (user.password) {
            // Backward compat: legacy plaintext comparison
            passwordValid = user.password === password;

            // Auto-migrate: hash the plaintext password for this legacy user
            if (passwordValid) {
                const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
                await executeQuery(
                    "UPDATE USERS SET password_hash = ? WHERE username = ?",
                    [hash, user.username]
                );
            }
        }

        if (!passwordValid) {
            // Increment failed attempts
            const newAttempts = (user.failed_login_attempts || 0) + 1;
            const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

            await executeQuery(
                "UPDATE USERS SET failed_login_attempts = ?, account_locked_until = ? WHERE username = ?",
                [newAttempts, lockUntil, user.username]
            );

            if (newAttempts >= 5) {
                return res.json({
                    success: false,
                    message: "Too many failed attempts. Account locked for 15 minutes."
                });
            }

            return res.json({ success: false, message: "Invalid username/email or password." });
        }

        // Success — reset failed attempts
        await executeQuery(
            "UPDATE USERS SET failed_login_attempts = 0, account_locked_until = NULL, lastLogin = CURRENT_DATE WHERE username = ?",
            [user.username]
        );

        return res.json({ success: true, username: user.username });
    } catch (error) {
        console.error("POST /api/login error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
});

// ── NEW POST /api/register (bcrypt + validation) ──
app.post(
    "/api/register",
    [
        body("username")
            .trim()
            .isLength({ min: 3, max: 20 })
            .withMessage("Username must be 3-20 characters.")
            .matches(/^[a-zA-Z0-9_]+$/)
            .withMessage("Username can only contain letters, numbers, and underscores."),
        body("email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email address.")
            .normalizeEmail(),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters."),
        body("phone")
            .trim()
            .notEmpty()
            .withMessage("Phone number is required."),
    ],
    async (req, res) => {
        try {
            // Validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                const firstError = errors.array()[0];
                return res.status(400).json({ success: false, message: firstError.msg });
            }

            const { username, email, phone, password } = req.body;

            // Validate phone number with libphonenumber-js
            try {
                // Try parsing as-is (may include country code like +91 1234567890)
                const phoneNumber = parsePhoneNumber(phone, "IN"); // default region IN
                if (!phoneNumber || !phoneNumber.isValid()) {
                    return res.status(400).json({ success: false, message: "Please provide a valid phone number." });
                }
            } catch (phoneErr) {
                return res.status(400).json({ success: false, message: "Please provide a valid phone number." });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

            // Insert user (password column set to NULL for new users, only password_hash is used)
            const response = await executeQuery(
                `INSERT INTO USERS (username, email, phone, password_hash, auth_provider, regDate)
                 VALUES (?, ?, ?, ?, 'local', CURRENT_DATE)`,
                [username.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
            );

            if (response.error) {
                // Handle duplicate entry errors (MySQL and PostgreSQL)
                const errStr = String(response.error).toLowerCase();
                if (errStr.includes("er_dup_entry") || errStr.includes("duplicate") || errStr.includes("unique constraint")) {
                    if (errStr.includes("username") || errStr.includes("primary") || errStr.includes("users_pkey")) {
                        return res.status(409).json({ success: false, message: "Username already taken. Please choose another." });
                    }
                    if (errStr.includes("email") || errStr.includes("users_email_key")) {
                        return res.status(409).json({ success: false, message: "Email already registered. Try signing in instead." });
                    }
                    return res.status(409).json({ success: false, message: "An account with these details already exists." });
                }
                return res.status(500).json({ success: false, message: "Registration failed. Please try again." });
            }

            return res.json({ success: true, username: username.trim() });
        } catch (error) {
            console.error("POST /api/register error:", error);
            return res.status(500).json({ success: false, message: "Server error. Please try again." });
        }
    }
);

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
    const { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, message: "Username is required." });
    }

    const authUsers = await executeQuery(
        "SELECT username FROM USERS WHERE USERNAME = ?",
        [username]
    );

    if (authUsers.error) return res.status(500).json(authUsers);
    if (!authUsers || authUsers.length === 0) {
        return res.json({ success: false, users: [] });
    }

    const users = await executeQuery(
        `SELECT 
            U.username,
            U.fname,
            U.lname,
            U.gender,
            U.bio,
            C.chat_id,
            C.contactname
         FROM USERS U
         JOIN CONTACT C ON U.USERNAME = C.CONTACTNAME
         WHERE C.USERNAME = ?`,
        [username]
    );

    if (users.error) return res.status(500).json(users);

    res.json({ success: true, users: users || [] });
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
        `SELECT *, CASE WHEN SENDER = ? THEN true ELSE false END AS is_sender
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
        "INSERT INTO MESSAGE (chat_id, sender, content, time, seen) VALUES (?, ?, ?, NOW(), false)",
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
         WHERE USERNAME ILIKE ?
           AND USERNAME <> ?
           AND USERNAME NOT IN (
               SELECT CONTACTNAME FROM CONTACT WHERE USERNAME = ?
           )
           AND USERNAME NOT IN (
               SELECT USERNAME FROM CONTACT WHERE CONTACTNAME = ?
           )
           AND USERNAME NOT IN (
               SELECT RECEIVER FROM FRIENDREQUEST WHERE SENDER = ?
           )
           AND USERNAME NOT IN (
               SELECT SENDER FROM FRIENDREQUEST WHERE RECEIVER = ?
           )`,
        [`%${search || ""}%`, username, username, username, username, username]
    );

    res.json({ users: users || [] });
});

app.post("/api/search", async (req, res) => {
    const { username, contactuser } = req.body;
    const response = await executeQuery(
        "INSERT INTO FRIENDREQUEST (sender, receiver, time) VALUES (?, ?, NOW())",
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
        "INSERT INTO NOTIFICATIONS (username, senderuser, message, time) VALUES (?, ?, ?, NOW())",
        [receiver, sender, msg]
    );

    if (!accepted) return res.json({ success: true });

    const chat = await executeQuery(
        "INSERT INTO CHATS (create_time) VALUES (NOW()) RETURNING chat_id"
    );

    if (chat.error) return res.json(chat);

    const chatId = chat.insertId || (chat[0] && chat[0].chat_id);
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
        origin: function (origin, callback) {
            callback(null, origin || true);
        },
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

    socket.on("stop-typing", (data) => {
        socket.to(data.chatId).emit("user-stop-typing", data);
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
httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log("📡 Socket.IO ready for connections");
});
