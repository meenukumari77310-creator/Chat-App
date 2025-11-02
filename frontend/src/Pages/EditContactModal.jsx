import React, { useState } from "react";
import { apis } from "../utils/apis";

const EditContactModal = ({ contact, onClose, onUpdated }) => {
  const [customName, setCustomName] = useState(contact.customName || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(apis().editContact(contact._id), {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      onUpdated?.();
      onClose?.();
    } catch (err) {
      alert(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" style={{ display: "block", background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={handleUpdate}>
            <div className="modal-header">
              <h5 className="modal-title">Edit Contact</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Email (read-only)</label>
                <input className="form-control" value={contact.user.email} disabled />
              </div>

              <div className="mb-3">
                <label className="form-label">Custom Name</label>
                <input
                  className="form-control"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditContactModal;
