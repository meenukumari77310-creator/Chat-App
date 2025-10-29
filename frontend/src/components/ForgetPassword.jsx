// src/pages/ForgetPassword.jsx
import React, { useState } from "react";
import { MdMarkEmailRead } from "react-icons/md";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apis } from "../utils/apis";
import "bootstrap/dist/css/bootstrap.min.css";

const ForgetPassword = ({ setOtpToken, setOtpEmail }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState("otp"); // default: OTP

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);

      const response = await fetch(apis().forgetPassword, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, method }),
        headers: { "Content-Type": "application/json" },
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Invalid JSON from server");
      }

      setLoading(false);

      if (!response.ok) throw new Error(result?.message);

      if (result?.status) {
        

        if (method === "otp") {
          // OTP flow → go to VerifyOtp
          toast.success(result?.message);
          setOtpToken(result?.token);
          setOtpEmail(email);
        } else if (method === "link") {
          toast.success(
            `We sent a reset link to ${email}. Please check your inbox.`
          );
        }
      }
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "420px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <MdMarkEmailRead size={55} style={{ color: "#a18cd1" }} />
          <h2 className="fw-bold mt-3" style={{ color: "#3a324d" }}>
            Forgot Password?
          </h2>
          <p className="text-muted">
            {method === "otp"
              ? "We'll send you a one-time code to reset your password"
              : "We'll send you a reset link to your email"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler}>
          <div className="form-floating mb-4">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <button
            type="submit"
            className="btn w-100 mb-2"
            disabled={loading}
            style={{
              background: "linear-gradient(45deg, #a18cd1, #fbc2eb)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Sending...
              </>
            ) : method === "otp" ? (
              "Send OTP"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Switch method */}
        <p className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link text-decoration-none"
            onClick={() =>
              setMethod((prev) => (prev === "otp" ? "link" : "otp"))
            }
          >
            {method === "otp"
              ? "Try another way (Email Link)"
              : "Try another way (OTP)"}
          </button>
        </p>

        {/* Back to login */}
        <p className="text-center mt-2">
          <Link to="/login" className="text-decoration-none text-muted">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgetPassword;
