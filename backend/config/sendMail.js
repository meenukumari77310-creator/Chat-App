import nodemailer from 'nodemailer'

export const sendMail = async ({ to, subject, html }) => {
  try {
    const transport = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send email");
  }
};

