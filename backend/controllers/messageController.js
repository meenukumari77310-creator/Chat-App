import Message from "../models/message.js";
import Chat from "../models/chat.js";
import Contact from "../models/Contact.js";
import { uploadChatFile } from "../config/Cloudinary.js";
import { io } from "../server.js";
import multer from "multer";

// -------------------- SEND MESSAGE --------------------
export const sendMessage = [
  // Handle single file upload
  (req, res, next) => {
    uploadChatFile(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "File is too large!" });
        }
        return res.status(400).json({ message: err.message });
      } else if (err) {
        return res.status(400).json({ message: err.message });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      let { content, chatId, userId } = req.body;
      let chat;

      // -------------------- ONE-TO-ONE CHAT --------------------
      if (!chatId) {
        if (!userId)
          return res.status(400).json({ message: "chatId or userId required" });

        chat = await Chat.findOne({
          isGroupChat: false,
          users: { $all: [req.user._id, userId] },
        });

        if (!chat) {
          chat = await Chat.create({
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId],
          });
        }

        chat = await Chat.findById(chat._id).populate(
          "users",
          "name username profileImage"
        );
        chatId = chat._id;
      } else {
        chat = await Chat.findById(chatId).populate(
          "users",
          "name username profileImage"
        );
        if (!chat) return res.status(404).json({ message: "Chat not found" });
      }

      if (!content && !req.file)
        return res.status(400).json({ message: "Message or file required" });

      // -------------------- CREATE MESSAGE --------------------
      const messageData = { sender: req.user._id, chat: chatId };
      if (content) messageData.content = content;

      if (req.file) {
        messageData.fileUrl = req.file.path;
        const type = req.file.mimetype.split("/")[0];
        messageData.fileType = ["image", "video", "audio"].includes(type)
          ? type
          : "document";
        messageData.fileName = req.file.originalname;
      }

      let message = await Message.create(messageData);
      message = await message.populate("sender", "name username profileImage");

      // -------------------- UPDATE CHAT LATEST MESSAGE --------------------
      chat.latestMessage = message._id;
      await chat.save();

      // -------------------- UNREAD COUNT --------------------
      if (!chat.isGroupChat && chat.users.length === 2) {
        const senderId = req.user._id.toString();
        const receiver = chat.users.find((u) => u._id.toString() !== senderId);

        if (receiver) {
          const updatedContact = await Contact.findOneAndUpdate(
            { owner: receiver._id, user: senderId },
            { $inc: { unreadCount: 1 } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          ).populate("user", "name username profileImage");

          io.to(receiver._id.toString()).emit(
            "contact_unread_update",
            updatedContact
          );
        }
      }

      const populatedMessage = { ...message.toObject(), chat };

      // -------------------- EMIT MESSAGE TO CHAT USERS --------------------
      chat.users.forEach((u) => {
        if (u._id.toString() !== req.user._id.toString()) {
          io.to(u._id.toString()).emit("receive_message", populatedMessage);
        }
      });

      return res.status(200).json(populatedMessage);
    } catch (err) {
      console.error("SendMessage error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
  },
];

// -------------------- FETCH ALL MESSAGES --------------------
export const allMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({
      chat: chatId,
      deletedFor: { $ne: req.user._id }, // Exclude messages deleted for current user
    })
      .populate("sender", "name profileImage username")
      .populate("chat")
      .sort({ createdAt: 1 }); // oldest → newest

    res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

// -------------------- DELETE MESSAGE FOR CURRENT USER --------------------
export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.deletedFor.includes(req.user._id)) {
      message.deletedFor.push(req.user._id);
      await message.save();
    }

    res.status(200).json({ message: "Deleted for you", messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// -------------------- CLEAR ALL MESSAGES FOR CURRENT USER --------------------
export const clearAllMessagesForMe = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chat: chatId });
    const userId = req.user._id;

    await Promise.all(
      messages.map(async (msg) => {
        if (!msg.deletedFor.includes(userId)) {
          msg.deletedFor.push(userId);
          await msg.save();
        }
      })
    );

    res.status(200).json({ message: "All messages cleared for you" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
