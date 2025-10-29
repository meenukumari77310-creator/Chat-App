import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import ChatBox from "./ChatBox";
import { apis } from "../utils/apis";
import { socket } from "../utils/socket";
import { useUser } from "../components/UserContext";

const ChatPage = () => {
  const { userDetails: currentUser } = useUser();
  const [contacts, setContacts] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  // ✅ 1. Fetch contacts
  const fetchContacts = async () => {
    try {
      const res = await fetch(apis().getContacts, { credentials: "include" });
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch contacts:", err);
      setContacts([]);
    }
  };

  // ✅ 2. Handle delete contact
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this contact?")) return;

    try {
      const res = await fetch(apis().deleteContact(id), {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to delete contact");

      fetchContacts(); // refresh contact list
      setSelectedChat(null); // clear current chat if deleted
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete contact");
    }
  };

  // ✅ 3. Connect socket
  useEffect(() => {
    if (!currentUser?._id) return;

    if (!socket.connected) socket.connect();
    socket.emit("join_room", currentUser._id);

    return () => {
      socket.off("contact_unread_update");
      socket.disconnect();
    };
  }, [currentUser]);

  // ✅ 4. Load contacts initially
  useEffect(() => {
    if (currentUser?._id) fetchContacts();
  }, [currentUser]);

  // ✅ 5. Socket listeners
  useEffect(() => {
    socket.on("contact_unread_update", (updatedContact) => {
      setContacts((prev) =>
        prev.map((c) => (c._id === updatedContact._id ? updatedContact : c))
      );
    });

    socket.on("receive_message", (message) => {
      if (!message?.chat?._id) return;
      const chatId = message.chat._id;

      if (selectedChat?._id !== chatId) {
        setContacts((prev) =>
          prev.map((c) =>
            c._id === message.chat._id
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }
    });

    return () => {
      socket.off("contact_unread_update");
      socket.off("receive_message");
    };
  }, [selectedChat]);

  // ✅ 6. Render
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "Inter, sans-serif",
        overflow: "hidden",
        background: "#f5f5f8",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(0,0,0,0.1)",
          background: "#e0e0f0",
        }}
      >
        <Sidebar
          currentUser={currentUser}
          setSelectedChat={setSelectedChat}
          selectedChat={selectedChat}
          contacts={contacts}
          fetchContacts={fetchContacts}
          handleDelete={handleDelete} // ✅ works now
        />
      </div>

      {/* Chat Box */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#fff",
        }}
      >
        <ChatBox
          selectedChat={selectedChat}
          currentUser={currentUser}
          fetchContacts={fetchContacts}
          setContacts={setContacts}
          onDeleteContact={handleDelete}
        />
      </div>
    </div>
  );
};

export default ChatPage;
