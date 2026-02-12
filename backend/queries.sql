-- create database PeerTalks;

-- use PeerTalks;

-- desc Users;

-- create table users(
--     username varchar(20) primary key,
--     password varchar(20),
--     fname varchar(20),
--     lname varchar(20),
--     bio varchar(255),
--     gender enum('Male', 'Female', 'Other'),
--     DOB varchar(20),
--     lastLogin date,
--     regDate date
-- );

-- select
--     *
-- from
--     users;

-- insert into
--     users
-- values
--     (
--         "utkarshtri",
--         "root",
--         "Utkarsh",
--         "Trivedi",
--         "I am a good web designer",
--         "Male",
--         "https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg",
--         NULL,
--         curdate()
--     );

-- create table chats(
--     chat_id bigint primary key,
--     create_time datetime
-- );

-- create table contact(
--     username varchar(20),
--     contactname varchar(20),
--     chat_id bigint,
--     primary key (username, contactname),
--     foreign key(chat_id) references chats(chat_id) on delete cascade,
--     foreign key(username) references users(username) on delete cascade,
--     foreign key(contactname) references users(username) on delete cascade
-- );

-- insert into
--     contact
-- values
--     ("username", "password", curdate());


-- create table message(
--     chat_id bigint,
--     sender varchar(20),
--     content varchar(255),
--     time timestamp,
--     seen boolean,
--     foreign key(chat_id) references chats(chat_id) on delete cascade,
--     foreign key(sender) references users(username) on delete cascade
-- );


-- create table notifications(
--     username varchar(20),
--     senderuser varchar(20),
--     message varchar(255),
--     time timestamp,
--     foreign key(username) references users(username) on delete cascade,
--     foreign key(senderuser) references users(username) on delete cascade
-- );

-- create table friendrequest(
-- 	sender varchar(20),
--     receiver varchar(20),
-- 	time timestamp,
--     primary key(sender, receiver),
--     foreign key(sender) references users(username) on delete cascade,
--     foreign key(receiver) references users(username) on delete cascade
-- );

-- -- alter table
-- --     contact drop column last_con;

-- -- alter table
-- --     contact
-- -- add
-- --     column chat_id bigint;
-- -- alter table
-- --     contact
-- -- add
-- --     foreign key(chat_id) references chats(chat_id) on delete cascade;

-- -- alter table
-- --     message
-- -- add
-- --     foreign key(chat_id) references chats(chat_id) on delete cascade;

-- -- alter table
-- --     message
-- -- add
-- --     foreign key(sender) references users(username) on delete cascade;

-- -- alter table
-- --     contact
-- -- add
-- --     foreign key(username) references users(username) on delete cascade;

-- -- alter table
-- --     contact
-- -- add
-- --     foreign key(contactname) references users(username) on delete cascade;

-- --alter table users
-- --add column DOB varchar(20);

-- --alter table users
-- --drop column pic
USE peertalks;

-- =========================
-- USERS
-- =========================
-- CREATE TABLE IF NOT EXISTS users (
--     username VARCHAR(20) PRIMARY KEY,
--     password VARCHAR(255),
--     fname VARCHAR(20),
--     lname VARCHAR(20),
--     bio VARCHAR(255),
--     gender ENUM('Male', 'Female', 'Other'),
--     DOB VARCHAR(20),
--     lastLogin DATE,
--     regDate DATE
-- );

-- =========================
-- CHATS
-- =========================
-- CREATE TABLE IF NOT EXISTS chats (
--     chat_id BIGINT PRIMARY KEY,
--     create_time DATETIME DEFAULT CURRENT_TIMESTAMP
-- );

-- =========================
-- CONTACTS
-- =========================
-- CREATE TABLE IF NOT EXISTS contact (
--     username VARCHAR(20),
--     contactname VARCHAR(20),
--     chat_id BIGINT,
--     PRIMARY KEY (username, contactname),
--     FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
--     FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
--     FOREIGN KEY (contactname) REFERENCES users(username) ON DELETE CASCADE
-- );

-- =========================
-- MESSAGES
-- =========================
-- CREATE TABLE IF NOT EXISTS message (
--     chat_id BIGINT,
--     sender VARCHAR(20),
--     content VARCHAR(255),
--     time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     seen BOOLEAN DEFAULT FALSE,
--     FOREIGN KEY (chat_id) REFERENCES chats(chat_id) ON DELETE CASCADE,
--     FOREIGN KEY (sender) REFERENCES users(username) ON DELETE CASCADE
-- );

-- =========================
-- NOTIFICATIONS
-- =========================
-- CREATE TABLE IF NOT EXISTS notifications (
--     username VARCHAR(20),
--     senderuser VARCHAR(20),
--     message VARCHAR(255),
--     time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE,
--     FOREIGN KEY (senderuser) REFERENCES users(username) ON DELETE CASCADE
-- );

-- =========================
-- FRIEND REQUESTS
-- =========================
-- CREATE TABLE IF NOT EXISTS friendrequest (
--     sender VARCHAR(20),
--     receiver VARCHAR(20),
--     time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     PRIMARY KEY (sender, receiver),
--     FOREIGN KEY (sender) REFERENCES users(username) ON DELETE CASCADE,
--     FOREIGN KEY (receiver) REFERENCES users(username) ON DELETE CASCADE
-- );

-- Drop the lowercase table
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS friendrequest;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS contact;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS chats;

-- Recreate with UPPERCASE
CREATE TABLE USERS(
    username VARCHAR(20) PRIMARY KEY,
    password VARCHAR(255),
    fname VARCHAR(20),
    lname VARCHAR(20),
    bio VARCHAR(255),
    gender ENUM('Male', 'Female', 'Other'),
    DOB VARCHAR(20),
    lastLogin DATE,
    regDate DATE
);

CREATE TABLE CHATS(
    chat_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CONTACT(
    username VARCHAR(20),
    contactname VARCHAR(20),
    chat_id BIGINT,
    PRIMARY KEY (username, contactname),
    FOREIGN KEY(chat_id) REFERENCES CHATS(chat_id) ON DELETE CASCADE,
    FOREIGN KEY(username) REFERENCES USERS(username) ON DELETE CASCADE,
    FOREIGN KEY(contactname) REFERENCES USERS(username) ON DELETE CASCADE
);

CREATE TABLE MESSAGE(
    chat_id BIGINT,
    sender VARCHAR(20),
    content VARCHAR(255),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    seen BOOLEAN DEFAULT FALSE,
    FOREIGN KEY(chat_id) REFERENCES CHATS(chat_id) ON DELETE CASCADE,
    FOREIGN KEY(sender) REFERENCES USERS(username) ON DELETE CASCADE
);

CREATE TABLE NOTIFICATIONS(
    username VARCHAR(20),
    senderuser VARCHAR(20),
    message VARCHAR(255),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(username) REFERENCES USERS(username) ON DELETE CASCADE,
    FOREIGN KEY(senderuser) REFERENCES USERS(username) ON DELETE CASCADE
);

CREATE TABLE FRIENDREQUEST(
    sender VARCHAR(20),
    receiver VARCHAR(20),
    time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(sender, receiver),
    FOREIGN KEY(sender) REFERENCES USERS(username) ON DELETE CASCADE,
    FOREIGN KEY(receiver) REFERENCES USERS(username) ON DELETE CASCADE
);
