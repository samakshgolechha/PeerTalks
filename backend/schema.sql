-- ============================================================
-- PeerTalks PostgreSQL Schema for Supabase
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(30),
    password_hash VARCHAR(255),
    auth_provider VARCHAR(50) DEFAULT 'local',
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until TIMESTAMPTZ DEFAULT NULL,
    last_seen TIMESTAMPTZ DEFAULT NULL,
    fname VARCHAR(50),
    lname VARCHAR(50),
    bio TEXT,
    gender VARCHAR(20),
    DOB VARCHAR(20),
    lastLogin TIMESTAMPTZ,
    regDate DATE DEFAULT CURRENT_DATE
);

-- 2. CHATS TABLE
CREATE TABLE IF NOT EXISTS chats (
    chat_id BIGSERIAL PRIMARY KEY,
    create_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. CONTACT TABLE (User to Contact mapping)
CREATE TABLE IF NOT EXISTS contact (
    username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    contactname VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    PRIMARY KEY (username, contactname)
);

-- 4. MESSAGE TABLE
CREATE TABLE IF NOT EXISTS message (
    id BIGSERIAL PRIMARY KEY,
    chat_id BIGINT NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    content TEXT NOT NULL,
    time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    seen BOOLEAN DEFAULT FALSE
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    senderuser VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    message VARCHAR(255) NOT NULL,
    time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. FRIEND REQUEST TABLE
CREATE TABLE IF NOT EXISTS friendrequest (
    sender VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    receiver VARCHAR(50) NOT NULL REFERENCES users(username) ON DELETE CASCADE,
    time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sender, receiver)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_contact_username ON contact(username);
CREATE INDEX IF NOT EXISTS idx_contact_chat_id ON contact(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_chat_id ON message(chat_id);
CREATE INDEX IF NOT EXISTS idx_message_time ON message(time);
CREATE INDEX IF NOT EXISTS idx_friendrequest_receiver ON friendrequest(receiver);
CREATE INDEX IF NOT EXISTS idx_notifications_username ON notifications(username);
