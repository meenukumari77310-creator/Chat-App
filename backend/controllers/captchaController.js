import svgCaptcha from "svg-captcha";

export const getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true,
    background: "#f0f0f0",
  });

  res.cookie("captcha", captcha.text, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  path: "/",
  maxAge: 5 * 60 * 1000,
});


  res.type("svg");
  res.status(200).send(captcha.data);
};
