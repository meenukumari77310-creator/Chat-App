import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const updatePassword = async (req, res, next) => {
  const { password, confirmPassword, token } = req.body;

  try {
    if (!token) throw new Error("Token missing");

    // Verify JWT token using your single secret
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new Error("Invalid or expired token");
    }

    // Find user by email from token payload
    const user = await User.findOne({ email: decoded.email });
    if (!user) throw new Error("User not found");

    // Password confirmation
    if (password !== confirmPassword) throw new Error("Passwords do not match");

    // Strong password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character"
      );
    }

    // Hash password and update
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

    res.status(200).json({
      message: "Password updated successfully",
      status: true,
    });
  } catch (error) {
    next(error);
  }
};
