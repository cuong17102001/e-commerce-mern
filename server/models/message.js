const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const MessageSchema = new mongoose.Schema({
    roomId: { type: String, required: true }, // admin-userId
    sender: { type: ObjectId, required: true }, // ID của người gửi
    message: { type: String, required: true }, // Nội dung tin nhắn
    timestamp: { type: Date, default: Date.now }, // Thời gian gửi
  });

module.exports = mongoose.model("Message", MessageSchema);