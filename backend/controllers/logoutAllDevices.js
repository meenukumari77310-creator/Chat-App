import User from "../models/user.js";

export const logoutAllDevices = async (req, res) => {
  try {
    const userId = req.user._id;

    // invalidate all jwt by bumping version
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,       // ✅ required on Render
      sameSite: "None",   // ✅ required on Render
      path: "/"           // ✅ must match cookie
    });

    res.status(200).json({ message: "Logged out from all devices" });
  } catch (error) {
    res.status(500).json({ error: "Server error during logout" });
  }
};
