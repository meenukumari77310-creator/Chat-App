import React from "react";
import { FaDownload } from "react-icons/fa";

const Message = ({
  message,
  currentUserId,
  selectMode,
  selected,
  toggleSelect,
}) => {
  const isSender = message.sender?._id === currentUserId;

  const bubbleStyle = {
    flexShrink: 0,
    maxWidth: "55%",
    padding: "8px 14px",
    borderRadius: "18px",
    background: isSender
      ? "linear-gradient(135deg, #a18cd1, #fbc2eb)"
      : "#f1f1f1",
    color: isSender ? "#fff" : "#111",
    boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    wordBreak: "break-word",
    whiteSpace: "pre-wrap",
  };

  const mediaStyle = {
    borderRadius: "12px",
    maxWidth: "200px",
    maxHeight: "280px",
    objectFit: "cover",
    marginBottom: message.content ? 5 : 0,
  };

  const timeStyle = {
    fontSize: "0.7rem",
    color: isSender ? "#000" : "#a18cd1",
    marginTop: "2px",
    alignSelf: isSender ? "flex-end" : "flex-start",
  };

  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0077ff", textDecoration: "underline" }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: isSender ? "flex-end" : "flex-start",
        width: "100%",
        gap: 5,
        alignItems: "flex-start",
      }}
    >
      {selectMode && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => toggleSelect(message._id)}
          style={{ marginTop: 8 }}
        />
      )}
      <div style={bubbleStyle}>
        {message.fileType && message.fileUrl ? (
          <>
            {message.fileType === "image" && (
              <img src={message.fileUrl} alt="img" style={mediaStyle} />
            )}
            {message.fileType === "video" && (
              <video controls style={mediaStyle}>
                <source src={message.fileUrl} type="video/mp4" />
              </video>
            )}
            {message.fileType === "audio" && (
              <audio controls style={{ width: 200 }}>
                <source src={message.fileUrl} type="audio/mpeg" />
              </audio>
            )}
            {message.fileType === "document" && (
              <a
                href={message.fileUrl}
                download={message.fileName}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: isSender ? "#fff" : "#000",
                  textDecoration: "none",
                }}
              >
                📄 {message.fileName} <FaDownload />
              </a>
            )}
          </>
        ) : (
          renderTextWithLinks(message.content || "")
        )}
        {message.createdAt && (
          <div style={timeStyle}>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
