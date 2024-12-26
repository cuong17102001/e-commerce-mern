const Message = require("./models/Message");

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("sendMessage", async (data) => {
    console.log("Message received:", data);

    // Lưu tin nhắn vào MongoDB
    const newMessage = new Message({
      sender: data.sender,
      receiver: data.receiver,
      message: data.message,
    });

    await newMessage.save();

    // Gửi tin nhắn lại cho tất cả client
    io.emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
