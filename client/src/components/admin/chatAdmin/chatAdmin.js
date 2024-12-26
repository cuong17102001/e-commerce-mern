import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getAllUsers, getMessageByRoom } from "../dashboardAdmin/FetchApi";
//css
import "./chatStyle.css";

const ChatAdmin = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [users, setUsers] = useState([]);
    const jwt = JSON.parse(localStorage.getItem("jwt"));
    const admin = jwt.user;
    const [userId, setUserId] = useState("");

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom(); // Scroll when messages change
    }, [messages]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const userDatas = await getAllUsers();
                console.log(userDatas);
                console.log(userDatas.Users);

                setUsers(userDatas.Users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const newSocket = io("http://localhost:8000");
        setSocket(newSocket);

        // Register admin with socket server
        newSocket.emit("register", { userId: admin._id });

        // Listen for messages from the server
        newSocket.on("receiveMessage", (data) => {
            console.log("Received message:", data);
            setMessages((prev) => [...prev, data]);
        });

        return () => newSocket.close();
    }, []);

    const joinChat = (userId) => {
        const roomId = `admin-${userId}`;
        socket.emit("joinRoom", { roomId });
        console.log(`Joined room: ${roomId}`);
    };

    const sendMessage = () => {
        if (message.trim()) {
            const roomId = `admin-${userId}`;
            socket.emit("sendMessage", {
                roomId,
                sender: admin._id,
                message,
            });
            setMessage("");
        }
    };

    const setChat = async (user) => {
        setUserId(user._id);
        joinChat(user._id);
        const getMessages = await getMessageByRoom(`admin-${user._id}`);
        console.log(getMessages);
        setMessages(getMessages.message);
    };

    return (
        <div className="container">
            {userId === "" ? (
                <>
                    <div className="user-list">
                        {users.map((user) => (
                            <div key={user._id}>
                                <button onClick={() => setChat(user)}>{user.name}</button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <>
                    <button
                        className="back-button"
                        onClick={() => {
                            setUserId("");
                            setMessages([]);
                        }}
                    >
                        Back
                    </button>

                    <div className="chat-box">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender === userId ? "other" : "self"
                                    }`}
                            >
                                {msg.message}
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            value={message}
                            placeholder="Type your message..."
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={sendMessage}>Send</button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ChatAdmin;
