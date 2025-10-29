import React, { useState } from "react";
import ForgetPassword from "./ForgetPassword";
import VerifyOtp from "./VerifyOtp";

const ForgetFlow = ({ setIsOtpVerified }) => {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");

  // OTP flow only
  return !token ? (
    <ForgetPassword setOtpToken={setToken} setOtpEmail={setEmail} />
  ) : (
    <VerifyOtp
      token={token}
      email={email}
      setisOtpVerified={setIsOtpVerified}
    />
  );
};

export default ForgetFlow;
