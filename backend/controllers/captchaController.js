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
    maxAge: 5 * 60 * 1000,
    secure: true,
    sameSite: "None",
    path: "/",
  });


  res.type("svg");
  res.status(200).send(captcha.data);
};
