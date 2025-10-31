import svgCaptcha from "svg-captcha";

export const getCaptcha = (req, res) => {
  const { type } = req.query; // login or register

  if (!type || !["login", "register"].includes(type)) {
    return res.status(400).json({ message: "Captcha type required" });
  }

  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true,
    background: "#f0f0f0",
  });

  const cookieName = type === "login" ? "captcha_login" : "captcha_register";

  res.cookie(cookieName, captcha.text, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 5 * 60 * 1000,
  });

  res.type("svg").status(200).send(captcha.data);
};
