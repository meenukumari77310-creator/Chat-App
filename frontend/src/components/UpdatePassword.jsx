// src/pages/UpdatePassword.jsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FaLock } from "react-icons/fa6";
import {
  useLocation,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { apis } from "../utils/apis";
import "bootstrap/dist/css/bootstrap.min.css";

const UpdatePassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = location.state?.token || searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error(
        "Token missing. Please use the reset link or request OTP again."
      );
    }
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    try {
      setLoading(true);
      const response = await fetch(apis().updatePassword, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword, token }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) throw new Error(result?.message);

      toast.success(result?.message || "Password updated successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card p-4 shadow-lg border-0 rounded-3">
            <div className="text-center mb-4">
              <FaLock size={40} style={{ color: "#a18cd1" }} />
              <h3 className="mt-2 fw-bold" style={{ color: "#3a324d" }}>
                Reset Password
              </h3>
              <p className="text-muted">Enter and confirm your new password</p>
            </div>

            <form onSubmit={submitHandler}>
              {/* New Password */}
              <div className="mb-3 position-relative">
                <label className="form-label fw-semibold">New Password*</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "15px",
                    cursor: "pointer",
                    color: "#555",
                  }}
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  style={{
                    position: "absolute",
                    top: "38px",
                    right: "15px",
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {/* Submit button */}
              <div className="d-grid mb-3">
                <button
                  type="submit"
                  className="btn"
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
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>

              {/* Back to login */}
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

export default UpdatePassword;
