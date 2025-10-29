// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaWhatsapp,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaSyncAlt,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import { apis } from "../utils/apis";
import { auth, googleProvider, signInWithPopup } from "./firebase";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notRobot, setNotRobot] = useState(false);

  const navigate = useNavigate();

  // Toggle password visibility
  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await fetch(apis().loginviaFirebase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: user.displayName || "Google User",
          email: user.email,
          platform: "google",
        }),
      });
      toast.success(`Welcome ${user.displayName}`);
      navigate("/");
    } catch (error) {
      toast.error("Google login failed: " + error.message);
    }
  };


  // Fetch captcha from server
  const fetchCaptcha = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(apis().captcha, { credentials: "include" });
      const svg = await res.text();
      setCaptchaSvg(svg);
    } catch (err) {
      toast.error("Failed to load captcha");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Login submit
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!captchaInput) {
      return toast.error("Please enter CAPTCHA");
    }

    if (!notRobot) {
      return toast.error("Please confirm you are not a robot");
    }

    try {
      setLoading(true);
      const response = await fetch(apis().loginUser, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaInput }),
      });

      const result = await response.json();
      setLoading(false);

      if (!response.ok) {
        toast.error(result?.message || "Login failed");
        fetchCaptcha(); // refresh captcha on failure
        setCaptchaInput("");
        return;
      }

      toast.success(result?.message);
      navigate("/");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
      fetchCaptcha();
      setCaptchaInput("");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center py-4 bg-light">
      <div className="card shadow-lg p-4 rounded-4" style={{ width: "420px" }}>
        {/* Header */}
        <div className="text-center mb-4">
          <FaWhatsapp size={55} color="#a18cd1" />
          <h2 className="fw-bold mt-2" style={{ color: "#3a324d" }}>
            Chat Application
          </h2>
          <p className="text-muted">Login to continue chatting</p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler}>
          <div className="form-floating mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="name@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>

          <div className="form-floating mb-3 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span
              onClick={toggleShowPassword}
              className="position-absolute top-50 end-0 translate-middle-y me-3"
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* CAPTCHA */}
          <div className="mb-3">
            <div className="d-flex align-items-center mb-2">
              <div dangerouslySetInnerHTML={{ __html: captchaSvg }} />
              <button
                type="button"
                className="btn btn-link ms-2 p-0"
                onClick={fetchCaptcha}
                disabled={refreshing}
                title="Refresh captcha"
              >
                <FaSyncAlt className={refreshing ? "spin" : ""} />
              </button>
            </div>
            <input
              type="text"
              className="form-control"
              placeholder="Enter CAPTCHA"
              required
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
            />
            <style>{`
              .spin {
                animation: spin 0.8s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="notRobotCheck"
              checked={notRobot}
              onChange={(e) => setNotRobot(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="notRobotCheck">
              I’m not a robot
            </label>
          </div>

          <button
            type="submit"
            className="btn w-100 mb-3"
            disabled={loading}
            style={{
              background: "linear-gradient(45deg, #a18cd1, #fbc2eb)",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Social Login */}
        <button
          className="btn btn-outline-danger w-100 mb-2 rounded-3"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="me-2" /> Sign in with Google
        </button>


        {/* Links */}
        <p className="text-center text-muted mt-3">
          Don’t have an account?{" "}
          <span
            className="fw-semibold"
            style={{ cursor: "pointer", color: "#a18cd1" }}
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
        <p className="text-center">
          <Link
            to="/forget/password"
            className="text-decoration-none text-muted"
          >
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
