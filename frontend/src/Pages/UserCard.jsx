import React from "react";
import Avatar from "react-avatar";

const UserCard = ({
  user,
  customName,
  onClick,
  isSelected,
  unreadCount = 0,
  onDelete,
  onEdit,
}) => {
  return (
    <div
      onClick={onClick}
      className={`d-flex align-items-center p-2 mb-2 rounded ${
        isSelected ? "text-white" : "text-dark"
      }`}
      style={{
        cursor: "pointer",
        background: isSelected
          ? "linear-gradient(90deg, #a18cd1, #fbc2eb)"
          : "#fff",
        transition: "all 0.3s ease",
        boxShadow: isSelected ? "0 3px 6px rgba(0,0,0,0.15)" : "none",
        position: "relative",
      }}
    >
      {/* Avatar (shows initials if no image) */}
      <Avatar
        name={customName || user?.name || "User"}
        src={
          user?.profileImage &&
          user.profileImage !== "null" &&
          user.profileImage !== "undefined"
            ? user.profileImage
            : undefined
        }
        size="42"
        round={true}
        color="#a18cd1"
      />

      <div className="ms-2 flex-grow-1">
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold">{customName || user.name}</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#6f42c1",
                color: "#fff",
                borderRadius: "12px",
                padding: "2px 6px",
                fontSize: "0.75rem",
              }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        {user.latestMessage && (
          <small className="text-muted">
            {user.latestMessage.content.length > 25
              ? user.latestMessage.content.slice(0, 25) + "..."
              : user.latestMessage.content}
          </small>
        )}
      </div>
    </div>
  );
};

export default UserCard;
