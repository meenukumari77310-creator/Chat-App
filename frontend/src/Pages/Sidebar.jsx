import React, { useState } from "react";
import UserCard from "./UserCard";
import AddContactModal from "./AddContactModal";
import EditContactModal from "./EditContactModal"; // 👈 import
import { apis } from "../utils/apis";

const Sidebar = ({
  currentUser,
  setSelectedChat,
  selectedChat,
  contacts = [],
  fetchContacts,
  loadingContacts = false,
  handleDelete, // ✅ add this
}) => {

  const [showModal, setShowModal] = useState(false);
  const [editContact, setEditContact] = useState(null); // 👈 state for edit modal

  if (!currentUser) return null;

  const handleSelectChat = async (contact) => {
    try {
      const res = await fetch(apis().accessChat, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: contact.user._id }),
      });
      const chat = await res.json();
      setSelectedChat({
        ...chat,
        contactId: contact._id,
        customName: contact.customName,
      });
    } catch (err) {
      console.error("Failed to access chat:", err);
    }
  };

  // inside ChatPage component, below fetchContacts

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f8",
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          height: 70, // 👈 match ChatBox
          padding: "0 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f5f5f8",
          fontWeight: 600,
          color: "#3a324d",
          borderBottom: "1px solid rgba(224,217,245,0.3)",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span>Chats</span>
      </div>

      {/* Contacts */}
      <div style={{ flex: 1, overflowY: "auto", padding: 10 }}>
        {loadingContacts ? (
          <div className="text-center text-muted mt-3">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="text-center text-muted mt-3">No contacts yet</div>
        ) : (
          contacts.map((contact) => (
            <UserCard
              key={contact._id}
              user={contact.user}
              customName={contact.customName}
              contact={contact}
              onClick={() => handleSelectChat(contact)}
              isSelected={selectedChat?.contactId === contact._id}
              unreadCount={contact.unreadCount}
              onEdit={() => setEditContact(contact)} // 👈 open modal
              onDelete={() => handleDelete(contact._id)} // 👈 delete
            />
          ))
        )}
      </div>

      {/* Add Contact Modal */}
      {showModal && (
        <AddContactModal
          onClose={() => setShowModal(false)}
          onAdded={() => {
            fetchContacts();
            setShowModal(false);
          }}
        />
      )}

      {/* Edit Contact Modal */}
      {editContact && (
        <EditContactModal
          contact={editContact}
          onClose={() => setEditContact(null)}
          onUpdated={() => fetchContacts()}
        />
      )}
    </div>
  );
};

export default Sidebar;
