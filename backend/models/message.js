import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String },
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  fileUrl: { type: String },
  fileType: { type: String },
  fileName: { type: String },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // new
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
