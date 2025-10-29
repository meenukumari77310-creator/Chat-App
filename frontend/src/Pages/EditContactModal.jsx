import React, { useState } from "react";
import { apis } from "../utils/apis";

const EditContactModal = ({ contact, onClose, onUpdated }) => {
  const [customName, setCustomName] = useState(contact.customName || "");

  const handleUpdate = async () => {
    try {
      const res = await fetch(apis().editContact(contact._id), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customName }),
      });
      if (!res.ok) throw new Error("Failed to update contact");
      await onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to update contact");
    }
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h5 style={{ marginBottom: "1rem" }}>Edit Contact</h5>
        <input
          type="text"
          className="form-control mb-3"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleUpdate}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ✅ Styles
const backdropStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  width: "400px",
  maxWidth: "90%",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
};

export default EditContactModal;
