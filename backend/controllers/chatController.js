import Chat from "../models/chat.js";

// Access or create a one-to-one chat
export const accessChat = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ message: "UserId required" });

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    }).populate("users", "-password").populate("latestMessage");

    if (!chat) {
      chat = await Chat.create({
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      });
      chat = await Chat.findById(chat._id).populate("users", "-password");
    }

    res.status(200).json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch all chats for logged-in user
export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({ users: req.user._id })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
