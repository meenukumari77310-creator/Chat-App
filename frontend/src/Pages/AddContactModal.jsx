// src/Pages/AddContactModal.jsx
import React, { useState } from "react";
import { apis } from "../utils/apis";

const AddContactModal = ({ onClose, onAdded }) => {
  const [email, setEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apis().addContact, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, customName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");

      // call parent refresh
      onAdded?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" style={{ display: "block", background: "rgba(0,0,0,0.4)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={submit}>
            <div className="modal-header">
              <h5 className="modal-title">Add Contact</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Registered Email</label>
                <input type="email" required className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">Custom Name (optional)</label>
                <input type="text" className="form-control" value={customName} onChange={(e) => setCustomName(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={loading}>{loading ? "Adding..." : "Add Contact"}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddContactModal;
