# PeerTalks: Real-Time Peer-to-Peer Chat Platform

PeerTalks is a modern real-time messaging application that enables users to connect, chat, and build meaningful conversations with peers. Built with Next.js and Socket.IO, it provides instant messaging, friend requests, notifications, and a seamless chat experience.

---

## Features

- **User Authentication:** Secure sign-up and login system with session management.
- **Real-Time Messaging:** Instant message delivery powered by Socket.IO.
- **Peer-to-Peer Communication:** Direct communication between peers for a more personal experience.
- **Live Notifications:** Get notified of new messages and friend requests in real-time.
- **Chat History:** Persistent message storage for all conversations.
- **User-Friendly Interface:** Intuitive design for easy navigation and a pleasant user experience.

---

## Project Structure
```
PeerTalks/
├── Frontend/     # Next.js client application
├── backend/      # Express + Socket.IO server
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (React)
- **Styling:** Tailwind CSS
- **Real-time:** Socket.IO Client
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js + Express
- **Real-time:** Socket.IO Server
- **Database:** MySQL
- **ORM:** serverless-mysql + mysql2
- **Deployment:** Railway

---

## Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- MySQL database
- npm or yarn

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd PeerTalks
```

### 2. Install Dependencies

#### Frontend
```sh
cd frontend
npm install
```

#### Backend
```sh
cd ../backend
npm install
```

### 3. Configure Environment Variables

Create `.env` files in both `frontend/` and `backend/` directories.

#### Frontend/.env.example
```env
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"
DB_HOST="localhost"
DB_PORT="31434"
DB_USER="root"
DB_PASSWORD="your-password"
DB_NAME="PeerTalks"
```

#### Backend/.env.example
```env
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

Copy these files to `.env` and fill in your actual database credentials.

### 4. Set Up Database

Run the SQL schema to create required tables:
```sh
cd backend
mysql -u root -p < queries.sql
```

Or manually run the SQL commands from `queries.sql` in your MySQL client.

### 5. Run the Project

#### Start Backend
```sh
cd backend
npm start
```

#### Start Frontend
```sh
cd ../frontend
npm run dev
```

- Frontend will run on [http://localhost:3000](http://localhost:3000)
- Backend will run on [http://localhost:3001](http://localhost:3001)

---

## How the Project Functions

1. **Registration & Authentication:**  
   New users sign up with username, password, and profile details. Existing users can log in to access their account.

2. **Friend Discovery:**  
   Users can search for other users and send friend requests. Accepted requests create bidirectional friendships.

3. **Real-Time Chat:**  
   Once connected as friends, users can engage in real-time conversations. Messages are instantly delivered via Socket.IO.

4. **Online Presence:**  
   The application tracks and displays which friends are currently online, enabling timely conversations.

5. **Notifications:**  
   Users receive instant notifications for new messages, friend requests, and other important events.

6. **Chat History:**  
   All conversations are persistently stored in the MySQL database, allowing users to review past messages.

---

## Deployment

### Production Deployment

**Frontend (Vercel):**
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Environment variables configured in Vercel dashboard
- Live at: [https://peer-talks.vercel.app](https://peer-talks.vercel.app)

**Backend (Railway):**
- Connected to GitHub repository
- Auto-deploys on push to main branch
- Environment variables configured in Railway dashboard
- MySQL database provisioned on Railway

---

## Database Schema

The application uses the following tables:

- **users:** User accounts and profiles
- **chats:** Chat room metadata
- **contact:** Friend connections and chat mappings
- **message:** Individual chat messages
- **friendrequest:** Pending friend requests
- **notifications:** User notifications

See `backend/queries.sql` for detailed schema definitions.

---

## Contributing

Pull requests and suggestions are welcome! Please open issues for bugs or feature requests.
