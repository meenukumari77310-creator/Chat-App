import User from "../models/user.js";
import jwt from "jsonwebtoken";

export const verifyOtp = async (req, res, next) => {
  const { otp, token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.otp !== parseInt(otp)) {
      throw new Error("Invalid OTP");
    }

    res.status(200).json({
      message: "OTP verified successfully",
      status: true,
      email: decoded.email,
    });
  } catch (error) {
    next(error);
  }
};
