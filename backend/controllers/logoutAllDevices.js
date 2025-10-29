import User from "../models/user.js";

export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    // Increment tokenVersion to invalidate all existing tokens
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

    // Optionally clear cookie on this device
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
      path: "/login"
    });

    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ error: "Server error during logout" });
  }
};
