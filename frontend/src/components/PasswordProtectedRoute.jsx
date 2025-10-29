import React from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";

export const PasswordProtectedRoute = ({ children, isOtpVerified }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // token could come from state or query string
  const token = location.state?.token || searchParams.get("token");

  if (!isOtpVerified && !token) {
    return <Navigate to="/forget/password" replace />;
  }

  return children;
};
