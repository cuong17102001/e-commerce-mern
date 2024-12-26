const express = require("express");
const http = require("http"); // Required for setting up Socket.IO
const { Server } = require("socket.io");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Import Router
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const brainTreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/orders");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
const paymentRouter = require("./routes/payment");
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");
const Message = require("./models/message");

/* Create All Uploads Folder if not exists | For Uploading Images */
CreateAllFolder();

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!"));

// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.use("/api", authRouter);
app.use("/api/user", usersRouter);
app.use("/api/category", categoryRouter);
app.use("/api/product", productRouter);
app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);
app.use("/api/payment", paymentRouter);

// Set up HTTP server and Socket.IO
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Điều chỉnh origin phù hợp với ứng dụng của bạn
    methods: ["GET", "POST"],
  },
});
// Lưu trữ danh sách người dùng đang online
const users = {};
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Lưu thông tin người dùng khi họ đăng nhập
  socket.on("register", ({ userId }) => {
    users[userId] = socket.id;
    console.log("Registered user:", userId, "with socket ID:", socket.id);
  });

  // Admin hoặc user tham gia phòng
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Xử lý gửi tin nhắn
  socket.on("sendMessage", async ({ roomId, sender, message }) => {
    io.to(roomId).emit("receiveMessage", { sender, message });
    console.log(`Message from ${sender} to room ${roomId}: ${message}`);

    const newMessage = new Message({
      roomId,
      sender,
      message
    });

    await newMessage.save();
  });

  // Khi user ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [key, value] of Object.entries(users)) {
      if (value === socket.id) {
        delete users[key];
        break;
      }
    }
  });
});

// Run Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
