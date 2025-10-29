import express from "express";
import { register } from "../controllers/register.js";
import { login } from "../controllers/login.js";
import { forgetPassword } from "../controllers/forgetPassword.js";
import { verifyOtp } from "../controllers/verifyOtp.js";
import { getOtpTime } from "../controllers/getOtpTime.js";
import { updatePassword } from "../controllers/updatePassword.js";
import { getAccess } from "../controllers/getAccess.js";
import { auth } from "../middleware/auth.js";
import { loginViaFirebase } from "../controllers/auth_controller.js";
import { savePasswordMagicLink } from "../controllers/savePasswordMagicLink.js";
import { getUserInfo } from "../controllers/getUserInfo.js";
import { logoutAllDevices } from "../controllers/logoutAllDevices.js";
import { accessChat, fetchChats } from "../controllers/chatController.js";
import {
  allMessages,
  clearAllMessagesForMe,
  deleteMessageForMe,
  sendMessage,
} from "../controllers/messageController.js";
import {
  getAllUsers,
  getProfile,
  updateProfile,
} from "../controllers/userController.js";
import { uploadChatFile, uploadProfileImage } from "../config/Cloudinary.js";
import {
  addContact,
  deleteContact,
  editContact,
  getContacts,
  resetUnread,
} from "../controllers/contactController.js";
import { getCaptcha } from "../controllers/captchaController.js";

const router = express.Router();

// Existing routes...
router.post("/loginviafirebase", loginViaFirebase);
router.post("/save_password_magic_link", savePasswordMagicLink);
router.post("/register", register);
router.get("/captcha", getCaptcha);
router.post("/login", login);
router.post("/forget/password", forgetPassword);
router.post("/otp/verify", verifyOtp);
router.post("/otp/time", getOtpTime);
router.post("/password/update", updatePassword);
router.post("/get/access", auth, getAccess);
router.get("/user", auth, getUserInfo);
router.post("/logout", auth, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ message: "Logged out successfully" });
});
router.post("/logout-all", auth, logoutAllDevices);

// Chat & Message routes
// Chat routes
router.post("/chat/access", auth, accessChat); // create/access one-to-one chat
router.get("/chat", auth, fetchChats); // fetch all chats

// Message routes
router.post("/chat/message", auth, sendMessage); // send message
router.get("/chat/message/:chatId", auth, allMessages); // get messages for chat

// Contacts
router.post("/contacts/add", auth, addContact);
router.get("/contacts", auth, getContacts);
router.patch("/contacts/:contactId/reset", auth, resetUnread);

router.put("/contacts/:id", auth, editContact); // ✅ edit
router.delete("/contacts/:id", auth, deleteContact);

// ✅ User routes
router.get("/get-user", auth, getAllUsers);
router.get("/profile", auth, getProfile);
router.put(
  "/profile/update",
  auth,
  uploadProfileImage.single("profileImage"), // multer handles image upload
  updateProfile
);
router.delete(
  "/chat/message/:messageId/delete-for-me",
  auth,
  deleteMessageForMe
);
router.delete(
  "/chat/message/:chatId/clear-for-me",
  auth,
  clearAllMessagesForMe
);




export default router;
