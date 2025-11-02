import React, { useEffect, useState, useRef, useCallback } from "react";
import Message from "./Message";
import { apis } from "../utils/apis";
import { socket } from "../utils/socket";
import EmojiPicker from "emoji-picker-react";
import { FaSmile, FaTrash, FaRegCopy, FaTimes } from "react-icons/fa";
import EditContactModal from "./EditContactModal"; // 👈 make sure to import
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../App.css"
import Avatar from "react-avatar";


const ChatBox = ({
  selectedChat,
  currentUser,
  fetchContacts,
  setContacts,
  onDeleteContact,
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeBtn, setActiveBtn] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editContactModalOpen, setEditContactModalOpen] = useState(false);

  const messagesRef = useRef(null);
  const cacheRef = useRef({});
  const menuRef = useRef(null);
  const resetRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  const dotStyle = {
    width: 6,
    height: 6,
    background: "#555",
    borderRadius: "50%",
    margin: "0 2px",
    animation: "typing 1.2s infinite",
  };

  const dot1 = { ...dotStyle, animationDelay: "0s" };
  const dot2 = { ...dotStyle, animationDelay: "0.2s" };
  const dot3 = { ...dotStyle, animationDelay: "0.4s" };

  const filePreview = file ? URL.createObjectURL(file) : null;
  useEffect(() => {
    return () => filePreview && URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (selectedChat?._id) {
      socket.emit("join_chat", selectedChat._id);
    }
  }, [selectedChat]);

  const loadMessages = useCallback(async () => {
    if (!selectedChat?._id) return;
    setLoading(true);
    try {
      const res = await fetch(apis().getMessages(selectedChat._id), {
        credentials: "include",
      });
      const data = await res.json();
      cacheRef.current[selectedChat._id] = data;
      setMessages(data);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Load messages failed:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedChat, scrollToBottom]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Reset unread
  useEffect(() => {
    if (!selectedChat?.contactId || selectedChat?.isGroupChat) return;
    if (resetRef.current.has(selectedChat.contactId)) return;
    (async () => {
      try {
        await fetch(apis().resetUnread(selectedChat.contactId), {
          method: "PATCH",
          credentials: "include",
        });
        setContacts?.((prev) =>
          prev.map((c) =>
            c._id === selectedChat.contactId ? { ...c, unreadCount: 0 } : c
          )
        );
        fetchContacts?.();
        resetRef.current.add(selectedChat.contactId);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedChat, fetchContacts, setContacts]);

  // Socket listeners
  useEffect(() => {
    const onReceive = (msg) => {
      if (!msg?.chat?._id || msg.sender?._id === currentUser._id) return;
      if (msg.deletedFor?.includes(currentUser._id)) return;

      cacheRef.current[msg.chat._id] = cacheRef.current[msg.chat._id] || [];
      if (!cacheRef.current[msg.chat._id].some((m) => m._id === msg._id)) {
        cacheRef.current[msg.chat._id].push(msg);
        if (selectedChat?._id === msg.chat._id)
          setMessages([...cacheRef.current[msg.chat._id]]);
        setTimeout(scrollToBottom, 50);
      }
    };

    const onTyping = ({ userId }) => {
      if (userId !== currentUser._id) setIsTyping(true);
    };

    const onStopTyping = ({ userId }) => {
      if (userId !== currentUser._id) setIsTyping(false);
    };

    socket.on("receive_message", onReceive);
    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);

    return () => {
      socket.off("receive_message", onReceive);
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
    };
  }, [currentUser._id, selectedChat, scrollToBottom]);

  // Typing emitter
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!selectedChat?._id) return;

    socket.emit("typing", {
      chatId: selectedChat._id,
      userId: currentUser._id,
    });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", {
        chatId: selectedChat._id,
        userId: currentUser._id,
      });
    }, 2000);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() && !file) return;
    if (!selectedChat?._id) return;

    setShowEmojiPicker(false);

    const tempId = `temp_${Date.now()}`;
    const msgObj = {
      _id: tempId,
      content: newMessage?.trim() || "",
      fileType: file ? file.type.split("/")[0] : null,
      fileName: file?.name,
      fileUrl: filePreview || null,
      sender: currentUser,
      chat: { _id: selectedChat._id },
      createdAt: new Date().toISOString(),
      sending: true,
    };

    cacheRef.current[selectedChat._id] =
      cacheRef.current[selectedChat._id] || [];
    cacheRef.current[selectedChat._id].push(msgObj);
    setMessages([...cacheRef.current[selectedChat._id]]);
    setNewMessage("");
    setSending(true);

    const form = new FormData();
    if (msgObj.content) form.append("content", msgObj.content);
    if (file) form.append("file", file);
    form.append("chatId", selectedChat._id);

    try {
      const res = await fetch(apis().sendMessage, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      const data = await res.json();

      // Show error toast if file is too large
      if (!res.ok) {
        toast.error(data.message || "Failed to send message");
        cancelMessage(tempId); // remove temp message if upload failed
        setSending(false);
        return;
      }

      cacheRef.current[selectedChat._id] = cacheRef.current[
        selectedChat._id
      ].map((m) => (m._id === tempId ? data : m));
      setMessages([...cacheRef.current[selectedChat._id]]);
      setFile(null);
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error(err);
      toast.error("Server error. Try again.");
    } finally {
      setSending(false);
    }
  };

  // Message selection
  const toggleSelectMessage = (id) => {
    const setCopy = new Set(selectedMessages);
    if (setCopy.has(id)) setCopy.delete(id);
    else setCopy.add(id);
    setSelectedMessages(setCopy);
    setSelectMode(setCopy.size > 0);
  };

  const clearAllMessages = async () => {
    if (!selectedChat?._id) return;
    try {
      await fetch(apis().clearAllMessages(selectedChat._id), {
        method: "DELETE",
        credentials: "include",
      });
      setMessages([]);
      setSelectedMessages(new Set());
      setSelectMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSelectedMessages = async () => {
    if (selectedMessages.size === 0) return;
    const ids = Array.from(selectedMessages);
    try {
      await Promise.all(
        ids.map((id) =>
          fetch(apis().deleteMessageForMe(id), {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
      setMessages(messages.filter((m) => !selectedMessages.has(m._id)));
      setSelectedMessages(new Set());
      setSelectMode(false);
    } catch (err) {
      console.error(err);
    }
  };

  const copySelectedMessages = () => {
    const texts = messages
      .filter((m) => selectedMessages.has(m._id))
      .map((m) => m.content)
      .join("\n");
    if (texts) navigator.clipboard.writeText(texts);
  };

  const cancelSelectedMessages = () => {
    setSelectedMessages(new Set());
    setSelectMode(false);
  };

  const cancelMessage = (tempId) => {
    if (!selectedChat?._id) return;
    cacheRef.current[selectedChat._id] = cacheRef.current[
      selectedChat._id
    ].filter((m) => m._id !== tempId);
    setMessages([...cacheRef.current[selectedChat._id]]);
  };

  if (!selectedChat) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Select a chat
      </div>
    );
  }

  const otherUser =
    !selectedChat?.isGroupChat &&
    selectedChat?.users?.find((u) => u._id !== currentUser._id);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
          <img
            src={otherUser?.profileImage || "/group.png"}
            alt="avatar"
            style={avatarStyle}
          />
          <div>
            <div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {selectedChat.customName ||
                otherUser?.name ||
                selectedChat.chatName}
            </div>
            {isTyping && (
              <div style={{ fontSize: "0.85rem", color: "#888" }}>Typing…</div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selectMode && selectedMessages.size > 0 ? (
            <>
              <button
                onClick={deleteSelectedMessages}
                style={{
                  ...iconBtnStyle,
                  ...(activeBtn === "delete" ? iconBtnActiveStyle : {}),
                }}
                title="Delete selected messages"
                onMouseDown={() => setActiveBtn("delete")}
                onMouseUp={() => setActiveBtn("")}
              >
                <FaTrash color="red" />
              </button>
              <button
                onClick={copySelectedMessages}
                style={{
                  ...iconBtnStyle,
                  ...(activeBtn === "copy" ? iconBtnActiveStyle : {}),
                }}
                title="Copy selected messages"
                onMouseDown={() => setActiveBtn("copy")}
                onMouseUp={() => setActiveBtn("")}
              >
                <FaRegCopy color="green" />
              </button>
              <button
                onClick={cancelSelectedMessages}
                style={{
                  ...iconBtnStyle,
                  ...(activeBtn === "cancel" ? iconBtnActiveStyle : {}),
                }}
                title="Cancel selection"
                onMouseDown={() => setActiveBtn("cancel")}
                onMouseUp={() => setActiveBtn("")}
              >
                <FaTimes color="orange" />
              </button>
            </>
          ) : (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={menuBtnStyle}
              >
                ⋮
              </button>
              {menuOpen && (
                <div style={{ ...menuListStyle, width: 200 }}>
                  <button
                    onClick={() => {
                      setSelectMode(true);
                      setMenuOpen(false);
                    }}
                    style={menuItemStyle}
                  >
                    Select Messages
                  </button>
                  <button
                    onClick={() => {
                      clearAllMessages();
                      setMenuOpen(false);
                    }}
                    style={menuItemStyle}
                  >
                    Clear All
                  </button>

                  {!selectedChat.isGroupChat && (
                    <>
                      <button
                        onClick={() => {
                          setEditContactModalOpen(true);
                          setMenuOpen(false);
                        }}
                        style={menuItemStyle}
                      >
                        Edit Contact
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm("Delete this contact?")) {
                            onDeleteContact?.(selectedChat.contactId);
                          }
                          setMenuOpen(false);
                        }}
                        style={{ ...menuItemStyle, color: "red" }}
                      >
                        Delete Contact
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesRef} style={messagesContainerStyle}>
        {loading ? (
          <div style={emptyMsgStyle}>⏳ Loading messages…</div>
        ) : messages.length === 0 ? (
          <div style={emptyMsgStyle}>Say hi 👋</div>
        ) : (
          messages.map((msg) => (
            <Message
              key={msg._id}
              message={msg}
              currentUserId={currentUser._id}
              selectMode={selectMode}
              selected={selectedMessages.has(msg._id)}
              toggleSelect={toggleSelectMessage}
              cancelMessage={cancelMessage}
              setMessages={setMessages}
            />
          ))
        )}
      </div>

      {/* Typing */}
      {isTyping && (
        <div style={typingIndicatorStyle}>
          <span>{otherUser?.name || "User"} is typing</span>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={dot1}></span>
            <span style={dot2}></span>
            <span style={dot3}></span>
          </div>
        </div>
      )}

      {/* File preview */}
      {file && (
        <div style={filePreviewStyle}>
          {file.type.startsWith("image/") ? (
            <img
              src={filePreview}
              alt={file.name}
              style={{
                width: 60,
                height: 60,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ) : (
            <div
              style={{
                padding: 10,
                background: "#eee",
                borderRadius: 8,
                flex: 1,
              }}
            >
              {file.name}
            </div>
          )}
          <button
            onClick={() => setFile(null)}
            style={{
              border: "none",
              background: "red",
              color: "#fff",
              padding: "5px 10px",
              borderRadius: 6,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={sendMessage} style={inputBarStyle}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInputChange}
          style={inputStyle}
        />
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 22,
              cursor: "pointer",
            }}
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div
              style={{
                position: "absolute",
                bottom: "50px",
                right: 0,
                zIndex: 1000,
              }}
            >
              <EmojiPicker
                onEmojiClick={(emoji) =>
                  setNewMessage((prev) => prev + emoji.emoji)
                }
              />
            </div>
          )}
        </div>
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label htmlFor="fileInput" style={fileLabelStyle}>
          ➕
        </label>
        <button type="submit" disabled={sending} style={sendBtnStyle}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

      {/* --- EDIT CONTACT MODAL --- */}
      {editContactModalOpen && otherUser && (
        <EditContactModal
          contact={{
            _id: selectedChat.contactId,
            user: otherUser,
            customName: selectedChat.customName,
          }}
          onClose={() => setEditContactModalOpen(false)}
          onUpdated={() => {
            fetchContacts();
            setEditContactModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

// --- Styles ---
const headerStyle = {
  position: "sticky",
  top: 0,
  flexShrink: 0,
  padding: "0 20px",
  height: 70,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#f5f5f8",
  borderBottom: "1px solid rgba(224,217,245,0.3)",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  backdropFilter: "blur(10px)",
  zIndex: 10,
};
const avatarStyle = {
  width: 50,
  height: 50,
  borderRadius: "50%",
  border: "2px solid rgba(0,0,0,0.1)",
};
const menuBtnStyle = {
  border: "none",
  background: "transparent",
  fontSize: 22,
  cursor: "pointer",
};
const menuListStyle = {
  position: "absolute",
  top: "100%",
  right: 0,
  background: "#fff",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  borderRadius: 8,
  overflow: "hidden",
  zIndex: 100,
};
const menuItemStyle = {
  display: "block",
  width: "100%",
  padding: "10px 16px",
  border: "none",
  background: "none",
  textAlign: "left",
  cursor: "pointer",
  fontSize: 14,
};
const messagesContainerStyle = {
  flex: 1,
  overflowY: "auto",
  padding: "20px",
  paddingTop: "80px",
  display: "flex",
  flexDirection: "column",
  gap: 10,
  background: "#f5f5f8",
  paddingBottom: "150px",
};
const emptyMsgStyle = { textAlign: "center", color: "#888", marginTop: 20 };
const filePreviewStyle = {
  position: "fixed",
  bottom: 70,
  left: 320,
  right: 0,
  padding: 10,
  background: "#fff",
  borderTop: "1px solid #ddd",
  display: "flex",
  alignItems: "center",
  gap: 10,
};
const inputBarStyle = {
  position: "fixed",
  bottom: 0,
  left: 320,
  right: 0,
  display: "flex",
  gap: 10,
  padding: "12px 20px",
  background: "#fff",
  boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
  zIndex: 1000,
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
};
const inputStyle = {
  flex: 1,
  padding: "12px 16px",
  borderRadius: 25,
  border: "1px solid #ddd",
  outline: "none",
  fontSize: "0.95rem",
  background: "#f0f0f5",
};
const fileLabelStyle = { cursor: "pointer", padding: "10px", borderRadius: 8 };
const sendBtnStyle = {
  borderRadius: 25,
  padding: "10px 30px",
  background: "linear-gradient(45deg, #a18cd1, #fbc2eb)",
  color: "#fff",
  fontWeight: 600,
  border: "none",
  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
};
const iconBtnStyle = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 20,
  marginLeft: 5,
  transition: "transform 0.1s, opacity 0.2s",
};
const iconBtnActiveStyle = { transform: "scale(0.9)" };
const typingIndicatorStyle = {
  position: "absolute", // stick near messages input
  bottom: 90,
  left: 20,
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "6px 12px",
  background: "#f0f0f5",
  borderRadius: 20,
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
  fontSize: "0.9rem",
  color: "#333",
  minWidth: 80,
};

export default ChatBox;
