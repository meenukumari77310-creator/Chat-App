import svgCaptcha from "svg-captcha";

export const getCaptcha = (req, res) => {
  const captcha = svgCaptcha.create({
    size: 6,
    noise: 2,
    color: true,
    background: "#f0f0f0",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("captcha", captcha.text, {
    httpOnly: true,
    secure: true,
    sameSite: "None",
    domain: "onrender.com",   // ✅ NOTE: remove the dot, Render requires this
    path: "/",
    maxAge: 5 * 60 * 1000,
  });

  console.log("Generated CAPTCHA:", captcha.text);


  res.type("svg");
  res.status(200).send(captcha.data);

};
