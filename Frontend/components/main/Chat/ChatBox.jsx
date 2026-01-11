"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io } from "socket.io-client"

export default function ChatBox({ chatid }) {
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sending, setSending] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState("connecting");
    const [typingUser, setTypingUser] = useState(null);
    
    const chatboxRef = useRef();
    const textboxRef = useRef();
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const debounceTimeout = useRef(null);

    // Scroll to bottom helper
    const scrollToBottom = useCallback(() => {
        if (chatboxRef.current) {
            chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
    }, []);

    // Fetch initial messages via HTTP
    const fetchInitialMessages = useCallback(async () => {
        try {
            const user = typeof window !== 'undefined' ? localStorage.getItem("username") : null;
            if (!user) {
                setError("Username not found");
                setLoading(false);
                return;
            }

            const response = await fetch(
                `/chat/api/messages?chatid=${chatid}&sender=${user}`
            );
            const data = await response.json();

            if (!data.error) {
                setMessages(data.messages || []);
                setTimeout(scrollToBottom, 100);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages");
        } finally {
            setLoading(false);
        }
    }, [chatid, scrollToBottom]);

    // Initialize Socket.IO connection
    useEffect(() => {
        // Get username from localStorage
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem("username");
            setUsername(user || "");
            
            if (!user) {
                setError("Username not found");
                return;
            }

            // Fetch initial messages
            fetchInitialMessages();

            // Initialize Socket.IO connection
            const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

            const socket = io(BACKEND_URL, {
                transports: ['websocket', 'polling']
            });

            socketRef.current = socket;

            // Connection event handlers
            socket.on("connect", () => {
                console.log("Socket.IO connected:", socket.id);
                setConnectionStatus("connected");
                
                // Join the chat room
                socket.emit("join-chat", { chatId: chatid, username: user });
            });

            socket.on("connect_error", (error) => {
                console.error("Socket.IO connection error:", error);
                setConnectionStatus("error");
            });

            socket.on("disconnect", (reason) => {
                console.log("Socket.IO disconnected:", reason);
                setConnectionStatus("disconnected");
            });

            // Listen for incoming messages
            socket.on("receive-message", (data) => {
                console.log("Received message:", data);
                
                // Add the message to state
                setMessages(prev => [...prev, {
                    content: data.message,
                    is_sender: data.sender === user,
                    SENDER: data.sender,
                    CHAT_ID: data.chatId
                }]);
                
                setTimeout(scrollToBottom, 100);
            });

            // Listen for typing indicator
            socket.on("user-typing", (data) => {
                const { username: typingUsername, chatId } = data;
                
                // Only show if it's this chat and not the current user
                if (chatId === chatid && typingUsername !== user) {
                    setTypingUser(typingUsername);
                    
                    // Clear after 2 seconds
                    if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                    }
                    typingTimeoutRef.current = setTimeout(() => {
                        setTypingUser(null);
                    }, 2000);
                }
            });

            // Cleanup on unmount
            return () => {
                console.log("Cleaning up socket connection");
                socket.off("receive-message");
                socket.off("user-typing");
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }
                if (debounceTimeout.current) {
                    clearTimeout(debounceTimeout.current);
                }
                socket.disconnect();
            };
        }
    }, [chatid, fetchInitialMessages, scrollToBottom]);

    // Handle typing events with debouncing
    const handleTyping = () => {
        if (!socketRef.current?.connected || !username) return;
        
        // Clear existing timeout
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }
        
        // Emit typing event
        socketRef.current.emit("typing", {
            chatId: chatid,
            username: username
        });
        
        // Debounce to avoid sending too many events
        debounceTimeout.current = setTimeout(() => {
            // Typing stopped
        }, 1000);
    };

    // Send message via Socket.IO
    const sendMessage = async (event) => {
        event.preventDefault();

        const messageText = textboxRef.current?.value?.trim();
        if (!messageText || !username) return;

        if (!socketRef.current?.connected) {
            alert("Connection lost. Trying to reconnect...");
            return;
        }

        setSending(true);

        try {
            // Save message to database first
            const response = await fetch(`/chat/api/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    chatid: chatid,
                    sender: username
                })
            });

            const data = await response.json();

            if (!data.error) {
                // Emit to Socket.IO for real-time broadcast
                socketRef.current.emit("send-message", {
                    chatId: chatid,
                    message: messageText,
                    sender: username
                });

                // Clear typing indicator
                setTypingUser(null);
                if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                }

                // Clear input
                textboxRef.current.value = '';
            } else {
                console.error("Error saving message:", data.error);
                alert("Failed to send message. Please try again.");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    // Handle Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e);
        }
    };

    // Connection status helpers
    const getStatusColor = () => {
        switch(connectionStatus) {
            case 'connected': return 'bg-green-500';
            case 'connecting': return 'bg-yellow-500';
            case 'disconnected': return 'bg-orange-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusText = () => {
        switch(connectionStatus) {
            case 'connected': return 'Connected';
            case 'connecting': return 'Connecting...';
            case 'disconnected': return 'Reconnecting...';
            case 'error': return 'Connection Error';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-primary-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading messages...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-[80vh] bg-primary-50">
                <div className="text-center text-red-600">
                    <p className="text-xl mb-2">⚠️ Error</p>
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                        Refresh Page
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="relative flex flex-col justify-end bg-primary-50 text-[0.93rem] w-full pb-3 h-[80vh] flex-grow"
                style={{
                    background: `url("/image/chatbg.jpg")`,
                    backgroundColor: "hsl(278 100% 95%)",
                    backgroundSize: "50%",
                    backgroundBlendMode: "screen"
                }}
            >
                {/* Connection Status Bar */}
                {connectionStatus !== 'connected' && (
                    <div className="absolute top-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-4 py-2 flex items-center justify-center gap-2 text-sm border-b border-gray-200 z-10">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`}></div>
                        <span className="text-gray-700">{getStatusText()}</span>
                    </div>
                )}

                <div className="w-full px-6 overflow-y-scroll" ref={chatboxRef}>
                    <ul className="flex flex-col pt-3 pb-2">
                        {messages.length === 0 ? (
                            <li className="text-center text-gray-500 py-8">
                                No messages yet. Start the conversation!
                            </li>
                        ) : (
                            messages.map((elem, key, arr) => {
                                const isNewSender = arr[key - 1] && arr[key - 1].is_sender !== elem.is_sender;
                                return (
                                    <li
                                        key={key}
                                        className={`${isNewSender ? "mt-4" : "mt-0.5"} flex ${
                                            elem.is_sender ? "justify-end" : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`relative max-w-xl px-4 py-2 ${
                                                elem.is_sender
                                                    ? "bg-primary-600/90 text-white rounded-s-xl rounded-e-md"
                                                    : "text-gray-700 bg-white/90 rounded-e-xl rounded-s-md"
                                            } shadow-chat break-words`}
                                        >
                                            <span className="block whitespace-pre-wrap">{elem.content}</span>
                                        </div>
                                    </li>
                                );
                            })
                        )}
                    </ul>

                    {/* Typing Indicator */}
                    {typingUser && (
                        <div className="flex justify-start pb-3 pt-1">
                            <div className="bg-white/90 rounded-e-xl rounded-s-md shadow-chat px-4 py-2 text-gray-600 text-sm">
                                <span className="italic">typing</span>
                                <span className="inline-flex ml-1 gap-0.5 items-end">
                                    <span className="text-xl leading-none" style={{ 
                                        animation: 'smoothBounce 1.4s ease-in-out infinite',
                                        animationDelay: '0s'
                                    }}>.</span>
                                    <span className="text-xl leading-none" style={{ 
                                        animation: 'smoothBounce 1.4s ease-in-out infinite',
                                        animationDelay: '0.2s'
                                    }}>.</span>
                                    <span className="text-xl leading-none" style={{ 
                                        animation: 'smoothBounce 1.4s ease-in-out infinite',
                                        animationDelay: '0.4s'
                                    }}>.</span>
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-between gap-x-4 w-full p-3 bg-white border-t border-gray-300">
                <input
                    ref={textboxRef}
                    type="text"
                    placeholder="Message"
                    disabled={sending || connectionStatus !== 'connected'}
                    onKeyDown={handleKeyDown}
                    onChange={handleTyping}
                    className="block w-full py-2 px-4 mx-2 bg-gray-100 transition-colors rounded-lg outline-none focus:text-gray-700 focus:bg-gray-200 disabled:opacity-50"
                    autoComplete="off"
                />
                <button
                    type="button"
                    onClick={sendMessage}
                    disabled={sending || connectionStatus !== 'connected'}
                    className="disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    title={connectionStatus !== 'connected' ? 'Waiting for connection...' : 'Send message'}
                >
                    {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                    ) : (
                        <svg
                            className="w-5 h-5 text-primary-500 origin-center transform rotate-90"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                    )}
                </button>
            </div>
        </>
    );
}