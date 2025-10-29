// src/components/VerifyOtp.jsx
import React, { useEffect, useRef, useState } from "react";
import { MdMarkEmailRead } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { apis } from "../utils/apis";
import "bootstrap/dist/css/bootstrap.min.css";

const VerifyOtp = ({ token, email, setisOtpVerified }) => {
  // refs for OTP input
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);

  const refs = [ref1, ref2, ref3, ref4, ref5, ref6];
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes = 300s
  const [expired, setExpired] = useState(false);

  const navigate = useNavigate();

  // focus first input
  useEffect(() => {
    refs[0].current?.focus();
    // eslint-disable-next-line
  }, []);

  // countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setExpired(true);
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    if (value && index < 5) refs[index + 1].current.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const newOtp = [...otpValues];
      newOtp[index - 1] = "";
      setOtpValues(newOtp);
      refs[index - 1].current.focus();
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (expired) return toast.error("OTP expired. Please resend.");

    const finalOtp = otpValues.join("");
    try {
      setLoading(true);
      const response = await fetch(apis().otpVerify, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: finalOtp, token }),
      });
      const result = await response.json();
      setLoading(false);

      if (!response.ok) throw new Error(result?.message);

      toast.success(result?.message || "OTP verified");
      setisOtpVerified(true);
      navigate("/password/update", { state: { token } });
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    try {
      const response = await fetch(apis().forgetPassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) throw new Error(result?.message);

      toast.success("New OTP sent to your email");
      setExpired(false);
      setTimeLeft(300); // reset 5 mins
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "420px" }}>
        <div className="text-center mb-4">
          <MdMarkEmailRead size={55} className=" mb-2" style={{color: "#a18cd1"}} />
          <h2 className="fw-bold " style={{ color: "#3a324d"}}>Verify OTP</h2>
          <p className="text-muted">
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={submitHandler}>
          <div className="d-flex justify-content-between mb-3">
            {refs.map((ref, i) => (
              <input
                key={i}
                ref={ref}
                type="text"
                maxLength="1"
                value={otpValues[i]}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="form-control text-center fs-4"
                style={{ width: "3rem", height: "3rem" }}
                disabled={expired}
              />
            ))}
          </div>

          {!expired ? (
            <p className="text-center text-muted mb-3">
              OTP will expire in <strong>{formatTime(timeLeft)}</strong>
            </p>
          ) : (
            <div className="text-center mb-3">
              <p className="text-danger fw-semibold">OTP expired</p>
              <button
                type="button"
                className="btn btn-link text-decoration-none"
                onClick={resendOtp}
              >
                Resend OTP
              </button>
            </div>
          )}

          <button
            type="submit"
            className="btn w-100"
            disabled={loading || expired}
            style={{
              background: "linear-gradient(45deg, #a18cd1, #fbc2eb)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;
