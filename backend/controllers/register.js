import User from "../models/user.js";
import bcrypt from "bcrypt";


export const register = async (req, res, next) => {
  const { name, email, password, confirmPassword, captchaInput } = req.body;
  const captchaCookie = req.cookies.captcha;

  console.log("Captcha Cookie:", req.cookies.captcha);
console.log("Captcha Input:", captchaInput);


  try {
    // ✅ CAPTCHA check
    if (!captchaInput || !captchaCookie || captchaInput.toLowerCase() !== captchaCookie.toLowerCase()) {
      return res.status(400).json({ message: "CAPTCHA verification failed" });
    }

    const formattedName = name.trim();
    const formattedEmail = email.trim().toLowerCase();

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingEmail = await User.findOne({ email: formattedEmail });
    if (existingEmail) {
      return res.status(400).json({ message: "This email already exists" });
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, include a letter, a number, and a special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    

    const newUser = new User({
      name: formattedName,
      email: formattedEmail,
      password: hashedPassword,
      platform: "manual",
      profileImage: "/default-avatar.png",
    });

    await newUser.save();
    res.status(200).json({ message: "User Registered Successfully", status: true });
  } catch (error) {
    next(error);
  }
};
