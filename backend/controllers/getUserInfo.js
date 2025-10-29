import User from "../models/user.js";

export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("name email _id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user info:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
