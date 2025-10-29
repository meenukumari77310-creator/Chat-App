// server/routes/user.js
import bcrypt from "bcrypt";
import User from "../models/user.js";

export const savePasswordMagicLink = async (req, res, next) => {
  try {
    const {name, email, password } = req.body;

    if (!email || !password) {
      const error = new Error("Email and password are required");
      error.statusCode = 400;
      throw error;
    }
    const formattedName = name.toLowerCase();
    const formattedEmail = email.toLowerCase();

    let existingUser = await User.findOne({name:formattedName, email: formattedEmail });

    if (existingUser && existingUser.password) {
      const error = new Error("Password already set. Please log in instead.");
      error.statusCode = 400;
      throw error;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(password)) {
      const error = new Error(
        "Password must be at least 8 characters long and include at least one letter, one number, and one special character"
      );
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
      existingUser.password = hashedPassword;
      existingUser.platform = "magic_link";
      await existingUser.save();
    } else {
      const newUser = new User({
        name,
        email: formattedEmail,
        password: hashedPassword,
        platform: "magic_link",
      });
      await newUser.save();
    }

    return res.status(200).json({
      message: "User created and password saved. You can now log in.",
      status: true,
    });

  } catch (err) {
    next(err);
  }
};
