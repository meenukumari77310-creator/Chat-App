import React, { useState, useEffect } from "react";
import Avatar from "react-avatar";
import { apis } from "../utils/apis";

const Profile = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch current user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(apis().getProfile, { credentials: "include" });
        const data = await res.json();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          profileImage: data.profileImage || "",
        });
        setPreviewImage(data.profileImage || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    fetchProfile();
  }, []);

  // ✅ Handle file upload preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    setFormData({ ...formData, profileImage: file });
  };

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle save (upload to backend)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("email", formData.email);
      if (formData.profileImage instanceof File) {
        form.append("profileImage", formData.profileImage);
      }

      const res = await fetch(apis().updateProfile, {
        method: "PUT",
        credentials: "include",
        body: form,
      });

      const result = await res.json();
      if (res.ok) {
        alert("✅ Profile updated successfully!");
        setPreviewImage(result.profileImage);
      } else {
        alert("❌ Failed to update profile: " + (result.message || "Error"));
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container mt-4"
      style={{
        maxWidth: "500px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        padding: "20px 30px",
      }}
    >
      <h3 className="text-center mb-4">My Profile</h3>

      <form onSubmit={handleSubmit}>
        {/* ✅ Avatar with preview */}
        <div className="mb-3 text-center">
          <Avatar
            name={formData.name || "User"}
            src={previewImage || undefined}
            size="120"
            round={true}
            color="#a18cd1"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control mt-3"
            />
          </div>
        </div>

        {/* Name Field */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Full Name</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Email Address</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="btn btn-primary px-4 py-2"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
