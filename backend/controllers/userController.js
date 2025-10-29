// controllers/userController.js
import User from "../models/user.js";
import { cloudinary } from "../config/Cloudinary.js"; // if you're using Cloudinary
import bcrypt from "bcrypt";

// ✅ Get all users (search by name/email/username, exclude password)
// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
            { username: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    let users = await User.find(keyword).select("-password");

    // ✅ make sure every user has profileImage
    users = users.map((u) => ({
      ...u._doc,
      profileImage: u.profileImage || "/default-avatar.png",
    }));

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

// Get logged-in user profile
export const getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user._doc,
      profileImage: user.profileImage || "/default-avatar.png", // ✅ always return
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile", error: err.message });
  }
};

// ✅ Update profile (name, about, profileImage)
export const updateProfile = async (req, res) => {
  try {
    const { name, about } = req.body;
    let profileImage;

    if (req.file) {
      // If using multer + cloudinary
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "ProfileImages",
        resource_type: "image",
      });
      profileImage = uploaded.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        ...(name && { name }),
        ...(about && { about }),
        ...(profileImage && { profileImage }),
      },
      { new: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Error updating profile", error: err.message });
  }
};

// ✅ Delete user (optional, if you want admin feature)
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};
