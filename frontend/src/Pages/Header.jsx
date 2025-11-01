import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { BsThreeDotsVertical } from "react-icons/bs";
import { apis } from "../utils/apis";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import AddContactModal from "./AddContactModal";
import Avatar from "react-avatar";

const Header = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // ✅ Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(apis().getProfile, { credentials: "include" });
        const data = await res.json();
        setCurrentUser(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentUser) return null;

  // ✅ Validate profile image
  const hasImage =
    currentUser?.profileImage &&
    currentUser.profileImage !== "null" &&
    currentUser.profileImage !== "undefined" &&
    currentUser.profileImage.trim() !== "";

  return (
    <div
      className="px-4 py-3 d-flex justify-content-between align-items-center"
      style={{
        background: "linear-gradient(90deg, #a18cd1, #fbc2eb)",
        color: "#333",
        fontWeight: "600",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        position: "relative",
      }}
    >
      <h4 style={{ margin: 0 }}>Chat Application</h4>

      <div className="d-flex align-items-center">
        <i className="bi bi-search me-3" style={{ cursor: "pointer" }}></i>

        {/* Three Dots Menu */}
        <div className="me-3 position-relative" ref={menuRef}>
          <BsThreeDotsVertical
            size={22}
            style={{ cursor: "pointer" }}
            onClick={() => setShowMenu((prev) => !prev)}
            title="Menu"
          />

          {showMenu && (
            <div
              style={{
                position: "absolute",
                top: "120%",
                right: 0,
                background: "white",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "12px",
                boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                zIndex: 1001,
                minWidth: "180px",
                overflow: "hidden",
              }}
            >
              {/* Add Chat */}
              <div
                style={menuItemStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(0,0,0,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={() => {
                  setShowModal(true);
                  setShowMenu(false);
                }}
              >
                ➕ Add Chat
              </div>

              {/* Logout */}
              <div
                style={{ ...menuItemStyle, color: "#e74c3c", fontWeight: 600 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(231,76,60,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={async () => {
                  await fetchWithAuth(apis().logout, { method: "POST" });
                  window.location.href = "/login";
                }}
              >
                🚪 Logout
              </div>

              {/* Logout All Devices */}
              <div
                style={{ ...menuItemStyle, color: "#c0392b", fontWeight: 600 }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(192,57,43,0.1)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
                onClick={async () => {
                  await fetchWithAuth(apis().logoutAllDevices, {
                    method: "POST",
                  });
                  window.location.href = "/login";
                }}
              >
                🔒 Logout All Devices
              </div>
            </div>
          )}
        </div>

        {/* ✅ Profile Avatar */}
        <Link to="/profile" style={{ textDecoration: "none" }}>
          <Avatar
            name={currentUser?.name || "User"}
            src={hasImage ? currentUser.profileImage : undefined}
            size="42"
            round={true}
            color="#a18cd1"
          />
        </Link>
      </div>

      {showModal && <AddContactModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

const menuItemStyle = {
  padding: "12px 16px",
  cursor: "pointer",
  fontSize: "14px",
  transition: "background 0.2s, color 0.2s",
};

export default Header;
