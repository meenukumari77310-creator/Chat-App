import dotenv from "dotenv";
dotenv.config();
import { sendMail } from "./config/sendMail.js";

const test = async () => {
  try {
    await sendMail({
      to: "meenukumari77310@gmail.com",
      subject: "Test Email",
      html: "<p>Hello! This is a test email.</p>",
    });
    console.log("✅ Email sent!");
  } catch (err) {
    console.error(err);
  }
};

test();
