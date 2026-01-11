"use client"
import Profilepic from "@/components/Profilepic";
import ProfileLink from "@/components/utils/ProfileLink";
import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function TopHeader({chatid}) {
  const [user, setUser] = useState({});
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  // Format last seen time
  const formatLastSeen = (lastSeenDate) => {
    if (!lastSeenDate) return "offline";
    
    const now = new Date();
    const lastSeen = new Date(lastSeenDate);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    // Today
    if (diffDays === 0) {
      if (diffMins < 1) return "last seen just now";
      if (diffMins < 60) return `last seen ${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      return `last seen today at ${lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // Yesterday
    if (diffDays === 1) {
      return `last seen yesterday at ${lastSeen.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    
    // Within a week
    if (diffDays < 7) {
      return `last seen ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
    
    // More than a week
    return `last seen on ${lastSeen.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Fetch user status
  const fetchUserStatus = async (username) => {
    try {
      const response = await fetch(`/chat/api/user-status/${username}`);
      const data = await response.json();
      
      setIsOnline(data.isOnline);
      setLastSeen(data.lastSeen);
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  useEffect(() => {
    const username = localStorage.getItem("username");
    
    // Fetch user details
    axios
      .get(`/chat/api/chatuser?username=${username}&chatid=${chatid}`)
      .then(function (response) {
        setUser(response.data);
        console.log(response.data);
        
        // Fetch initial status
        if (response.data.username) {
          fetchUserStatus(response.data.username);
        }
      })
      .catch(function (error) {
        console.log(error);
      });

    // Setup Socket.IO for real-time status updates
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    const socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on("connect", () => {
      console.log("TopHeader socket connected");
      
      // Join the chat room to receive status updates
      const currentUser = localStorage.getItem("username");
      if (currentUser) {
        socket.emit("join-chat", { chatId: chatid, username: currentUser });
        console.log("TopHeader joined chat room:", chatid);
      }
    });

// Listen for status changes
socket.on("user-status-changed", (data) => {
  const { username: statusUsername, isOnline: userIsOnline } = data;
  
  console.log("=== STATUS CHANGE EVENT ===");
  console.log("Event data:", data);
  console.log("Current user being viewed:", user);
  console.log("Does it match?", user.username === statusUsername);
  
  // Update status if it matches the current user being viewed
  setUser(currentUser => {
    if (currentUser.username && statusUsername === currentUser.username) {
      console.log(`✅ Updating status for ${statusUsername} to ${userIsOnline ? 'online' : 'offline'}`);
      setIsOnline(userIsOnline);
      
      // If they went offline, fetch their last seen
      if (!userIsOnline) {
        fetchUserStatus(statusUsername);
      }
    } else {
      console.log(`❌ Not updating - current user is ${currentUser.username}, event is for ${statusUsername}`);
    }
    return currentUser;
  });
});

    return () => {
      socket.off("user-status-changed");
      socket.disconnect();
    };
  }, [chatid]);

  return (
    <div className="relative flex items-center p-3 border-b border-gray-300 bg-white w-full">
      <Profilepic gender={user.gender} className="object-cover w-10 h-10 rounded-full" />
      <div className="ml-2 flex-1">
        <ProfileLink 
          fname={user.fname} 
          lname={user.lname} 
          username={user.username} 
          className="block font-bold text-gray-600 capitalize" 
        />
        <div className="text-xs mt-0.5">
          <span className="text-gray-500">
            {isOnline ? 'online' : formatLastSeen(lastSeen)}
          </span>
        </div>
      </div>
    </div>
  );
}