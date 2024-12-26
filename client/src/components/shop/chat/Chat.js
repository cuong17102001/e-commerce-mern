import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { getMessageByRoom } from "../../admin/dashboardAdmin/FetchApi";
const Chat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false); // Trạng thái hiển thị chat
  const jwt = JSON.parse(localStorage.getItem("jwt"));
  const user = jwt.user;

  const getMessages = async () => {
    const getMessages = await getMessageByRoom(`admin-${user._id}`);
    setMessages(getMessages.message);
  }
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
    const newSocket = io("http://localhost:8000");
    setSocket(newSocket);

    // Đăng ký user với socket server
    newSocket.emit("register", { userId: user._id });

    // Tham gia phòng chat với admin
    const roomId = `admin-${user._id}`;
    newSocket.emit("joinRoom", { roomId });

    // Nghe tin nhắn từ server
    newSocket.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (message.trim()) {
      const roomId = `admin-${user._id}`;
      socket.emit("sendMessage", {
        roomId,
        sender: user._id,
        message,
      });
      setMessage("");
    }
  };

  const openChat = () => {
    setIsChatOpen(!isChatOpen);
    getMessages();
  };

  return (
    <div style={{height: 300}}>
      {/* Nút mở chat */}
      <button
        style={{
          display: "flex",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "#2c2424",
          color: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "24px",
          cursor: "pointer",
          justifyContent: "center",
          alignItems: "center",
        }}
        onClick={() => openChat()}
      >
        <ChatBubbleLeftRightIcon style={{width: "40px", height: "40px"}}/>
      </button>

      {/* Hộp chat */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "20px",
            width: "300px",
            maxHeight: "400px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "10px", overflowY: "auto", flex: 1, height: 300, display: "flex", flexDirection: "column" }}>
            {messages.map((msg, index) => (
              <div key={index}
              style={{ maxWidth: 200}}
              className={`message ${msg.sender === user._id ? "self" : "other" }`}
              >
                {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #ccc" }}>
            <input
              style={{ flex: 1, border: "none", padding: "10px" }}
              type="text"
              value={message}
              placeholder="Type a message..."
              onChange={(e) => setMessage(e.target.value)}
            />
            <PaperAirplaneIcon
              style={{
                border: "none",
                backgroundColor: "#2c2424",
                color: "#fff",
                width: "60px",
                height: "60px",
                padding: "10px 15px",
                cursor: "pointer",
              }}
              onClick={sendMessage}
            >
              Send
            </PaperAirplaneIcon>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
