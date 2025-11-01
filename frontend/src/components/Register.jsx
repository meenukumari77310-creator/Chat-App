// frontend/pages/Register.jsx
import React, { useEffect, useState } from "react";
import {
  FaWhatsapp,
  FaEye,
  FaEyeSlash,
  FaMagic,
  FaGoogle,
  FaSyncAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import "bootstrap/dist/css/bootstrap.min.css";
import { apis } from "../utils/apis";
import {
  auth,
  sendSignInLinkToEmail,
  googleProvider,
  signInWithPopup,
} from "./firebase";
import { useUser } from "./UserContext";

export const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [notRobot, setNotRobot] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const navigate = useNavigate();
  const { setUserDetails } = useUser();

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!captchaInput) return toast.error("Please enter CAPTCHA");
    if (!notRobot) return toast.error("Please confirm you are not a robot");

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const response = await fetch(apis().registerUser, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
          captchaInput,
        }),
        headers: { "Content-type": "application/json" },
      });
      const result = await response.json();
      setLoading(false);
      if (!response.ok) throw new Error(result?.message);
      if (result?.status) {
        toast.success(result?.message);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchCaptcha = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(apis().captcha, { credentials: "include" });
      const svg = await res.text();
      setCaptchaSvg(svg);
      setCaptchaInput(""); // clear input when refreshed
    } catch (error) {
      toast.error("Failed to load captcha");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const sendMagicLink = async () => {
      if (!email || !name) return toast.error("Enter your name and email first");
      try {
        await sendSignInLinkToEmail(auth, email, {
          url: `https://chat-app-frontend-ogk2.onrender.com/finishSignIn?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`,

          handleCodeInApp: true,
        });
        setUserDetails({ email, name });
        toast.success("Magic link sent! Check your email.");
      } catch (error) {
        toast.error("Failed to send magic link: " + error.message);
      }
    };
  

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

  return (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ minHeight: "100vh", padding: "40px 0" }}
    >
      <div
        className="card shadow-lg p-4 rounded-4 mx-auto"
        style={{ width: "100%", maxWidth: "600px" }}
      >
        <div className="text-center mb-4">
          <FaWhatsapp size={55} color="#a18cd1" />
          <h2 className="fw-bold mt-2" style={{ color: "#3a324d" }}>
            Chat Application
          </h2>
          <p className="text-muted">Create your account to start chatting</p>
        </div>

        <form onSubmit={submitHandler}>
          <div className="form-floating mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Your Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <label>Name</label>
          </div>

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

          <div className="form-floating mb-4 position-relative">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <label>Confirm Password</label>
            <span
              onClick={toggleShowPassword}
              className="position-absolute top-50 end-0 translate-middle-y me-3"
              style={{ cursor: "pointer" }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

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
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <button
          className="btn btn-outline-warning w-100 mb-2 rounded-3"
          onClick={sendMagicLink}
        >
          <FaMagic className="me-2" /> Send Magic Link
        </button>

        <button
          className="btn btn-outline-danger w-100 rounded-3"
          onClick={handleGoogleLogin}
        >
          <FaGoogle className="me-2" /> Sign in with Google
        </button>

        <p className="text-center text-muted mt-3">
          Already have an account?{" "}
          <span
            className=" fw-semibold"
            style={{ cursor: "pointer", color: "#a18cd1" }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};
