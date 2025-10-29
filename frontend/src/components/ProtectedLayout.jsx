// components/ProtectedLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../Pages/Header";

const ProtectedLayout = () => {
  return (
    <div
      className="d-flex vh-100"
      style={{
        background: "#eeeefdff",
        overflow: "hidden",
      }}
    >
      {/* Main Area */}
      <div className="d-flex flex-column flex-grow-1">
        <Header />
        <div className="flex-grow-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;
