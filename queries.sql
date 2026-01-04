create database PeerTalks;

use PeerTalks;

desc Users;

create table users(
    username varchar(20) primary key,
    password varchar(20),
    fname varchar(20),
    lname varchar(20),
    bio varchar(255),
    gender enum('Male', 'Female', 'Other'),
    DOB varchar(20),
    lastLogin date,
    regDate date
);

select
    *
from
    users;

insert into
    users
values
    (
        "utkarshtri",
        "root",
        "Utkarsh",
        "Trivedi",
        "I am a good web designer",
        "Male",
        "https://cdn.pixabay.com/photo/2018/09/12/12/14/man-3672010__340.jpg",
        NULL,
        curdate()
    );

create table chats(
    chat_id bigint primary key,
    create_time datetime
);

create table contact(
    username varchar(20),
    contactname varchar(20),
    chat_id bigint,
    primary key (username, contactname),
    foreign key(chat_id) references chats(chat_id) on delete cascade,
    foreign key(username) references users(username) on delete cascade,
    foreign key(contactname) references users(username) on delete cascade
);

insert into
    contact
values
    ("username", "password", curdate());


create table message(
    chat_id bigint,
    sender varchar(20),
    content varchar(255),
    time timestamp,
    seen boolean,
    foreign key(chat_id) references chats(chat_id) on delete cascade,
    foreign key(sender) references users(username) on delete cascade
);


create table notifications(
    username varchar(20),
    senderuser varchar(20),
    message varchar(255),
    time timestamp,
    foreign key(username) references users(username) on delete cascade,
    foreign key(senderuser) references users(username) on delete cascade
);

create table friendrequest(
	sender varchar(20),
    receiver varchar(20),
	time timestamp,
    primary key(sender, receiver),
    foreign key(sender) references users(username) on delete cascade,
    foreign key(receiver) references users(username) on delete cascade
);

-- alter table
--     contact drop column last_con;

-- alter table
--     contact
-- add
--     column chat_id bigint;
-- alter table
--     contact
-- add
--     foreign key(chat_id) references chats(chat_id) on delete cascade;

-- alter table
--     message
-- add
--     foreign key(chat_id) references chats(chat_id) on delete cascade;

-- alter table
--     message
-- add
--     foreign key(sender) references users(username) on delete cascade;

-- alter table
--     contact
-- add
--     foreign key(username) references users(username) on delete cascade;

-- alter table
--     contact
-- add
--     foreign key(contactname) references users(username) on delete cascade;

--alter table users
--add column DOB varchar(20);

--alter table users
--drop column pic