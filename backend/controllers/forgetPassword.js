import User from "../models/user.js";
import { sendMail } from "../config/sendMail.js";
import jwt from "jsonwebtoken";

export const forgetPassword = async (req, res, next) => {
  const { email, method } = req.body; // method: "otp" or "link"

  try {
    const formattedEmail = email.toLowerCase();
    const findUser = await User.findOne({ email: formattedEmail });
    if (!findUser) throw new Error("No user found");

    if (method === "otp") {
      // OTP Flow
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpToken = jwt.sign(
        { email: formattedEmail, otp },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );

      await sendMail({
        to: formattedEmail,
        subject: "Reset Password OTP",
        html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
      });

      return res.status(200).json({
        message: "Please check your email for OTP",
        status: true,
        token: otpToken,
      });
    } else if (method === "link") {
      // Email Link Flow
      const linkToken = jwt.sign(
        { email: formattedEmail },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const resetLink = `${process.env.CLIENT_URL}/password/update?token=${linkToken}`;

      await sendMail({
        to: formattedEmail,
        subject: "Reset Password Link",
        html: `<p>Click this link to reset your password: <a href="${resetLink}">Reset Password</a></p>`,
      });

      return res.status(200).json({
        message: "Reset password link sent to your email",
        status: true,
      });
    } else {
      throw new Error("Invalid method");
    }
  } catch (error) {
    next(error);
  }
};
