import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { Super } from "./components/Super";
import { Register } from "./components/Register";
import Login from "./components/Login";
import FinishSignIn from "./components/FinishSignIn";
import SetPassword from "./components/SetPassword";
import { PasswordProtectedRoute } from "./components/PasswordProtectedRoute";
import UpdatePassword from "./components/UpdatePassword";
import ForgetFlow from "./components/ForgetFlow";
import ProtectedLayout from "./components/ProtectedLayout";
import { UserProvider } from "./components/UserContext";
import ChatPage from "./Pages/ChatPage";
import Profile from "./Pages/Profile";

function App() {
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  return (
    <UserProvider>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/finishSignIn" element={<FinishSignIn />} />
        <Route path="/set-password" element={<SetPassword />} />
        <Route
          path="/forget/password"
          element={<ForgetFlow setIsOtpVerified={setIsOtpVerified} />}
        />
        <Route
          path="/password/update"
          element={
            <PasswordProtectedRoute isOtpVerified={isOtpVerified}>
              <UpdatePassword />
            </PasswordProtectedRoute>
          }
        />

        {/* Protected User Routes */}
        <Route element={<Super />}>
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<ChatPage />} />{" "}
            {/* Main chat interface */}
            <Route path="/profile" element={<Profile />} />{" "}
            {/* Optional profile page */}
          </Route>
        </Route>
      </Routes>
    </UserProvider>
  );
}

export default App;
