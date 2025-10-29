import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customName: { type: String },
    unreadCount: { type: Number, default: 0 }, // ✅ only unseen messages
  },
  { timestamps: true }
);

export default mongoose.model("Contact", contactSchema);
