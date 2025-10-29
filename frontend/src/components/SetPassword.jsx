// src/pages/SetPassword.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { apis } from "../utils/apis";
import { FaEye, FaEyeSlash, FaKey } from "react-icons/fa";
import { useUser } from "./UserContext"; // ✅ Import context
import "bootstrap/dist/css/bootstrap.min.css";

const SetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userDetails } = useUser(); // ✅ Access user context
  const { email, name } = userDetails || {};

  const toggleShowPassword = () => setShowPassword((prev) => !prev);
  const toggleShowConfirmPassword = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !name) {
      toast.error("User info not found. Please use the magic link again.");
      return navigate("/register");
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(apis().savePasswordMagicLink, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, name, password }),
      });

      const result = await res.json();
      setLoading(false);

      if (!res.ok) throw new Error(result.message || "Failed to set password");

      toast.success("Password saved! Redirecting...");
      navigate("/login");
    } catch (err) {
      setLoading(false);
      toast.error(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 shadow-lg border-0 rounded-3">
            <div className="text-center mb-4">
              <FaKey size={40} style={{ color: "#a18cd1" }} />
              <h3 className="mt-2 fw-bold" style={{ color: "#3a324d" }}>
                Create Password
              </h3>
              <p className="text-muted">
                Set a strong password for your new account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Password */}
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">Password*</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <span
                  onClick={toggleShowPassword}
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "15px",
                    cursor: "pointer",
                    color: "#555",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Confirm Password */}
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">
                  Confirm Password*
                </label>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="form-control"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <span
                  onClick={toggleShowConfirmPassword}
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "15px",
                    cursor: "pointer",
                    color: "#555",
                  }}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Submit button */}
              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-success"
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
                      Saving...
                    </>
                  ) : (
                    "Set Password"
                  )}
                </button>
              </div>

              {/* Extra Links */}
              <div className="text-center">
                <Link to="/login" className="text-decoration-none">
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
