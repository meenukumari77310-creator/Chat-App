// controllers/contactController.js
import Contact from "../models/Contact.js";
import User from "../models/user.js";

/**
 * POST /contacts/add
 * body: { email, customName }
 * Adds a contact (owner = logged-in user)
 */
export const addContact = async (req, res) => {
  try {
    const { email, customName } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const target = await User.findOne({ email: email.toLowerCase().trim() });
    if (!target) return res.status(404).json({ message: "User not found" });

    // cannot add yourself
    

    const existing = await Contact.findOne({
      owner: req.user._id,
      user: target._id,
    });

    if (existing) {
      return res.status(400).json({ message: "Contact already exists" });
    }

    const contact = await Contact.create({
      owner: req.user._id,
      user: target._id,
      customName: customName?.trim() || "",
    });

    await contact.populate("user", "name username email profileImage");

    res.status(201).json(contact);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/**
 * GET /contacts
 * returns contacts for logged-in user (owner)
 */
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ owner: req.user._id })
      .populate("user", "name username email profileImage")
      .sort({ createdAt: -1 });

    res.json(contacts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const resetUnread = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    contact.unreadCount = 0;  // <-- use the correct field name
    await contact.save();

    res.status(200).json({ message: "Unread reset" });
  } catch (err) {
    console.error("Error resetting unread:", err);
    res.status(500).json({ message: "Server error resetting unread" });
  }
};

// Edit contact
export const editContact = async (req, res) => {
  try {
    const { id } = req.params; // contactId
    const { customName } = req.body;

    const contact = await Contact.findOneAndUpdate(
      { _id: id, owner: req.user._id }, // only owner can edit
      { customName },
      { new: true }
    ).populate("user", "name username profileImage");

    if (!contact) return res.status(404).json({ message: "Contact not found" });

    res.json(contact);
  } catch (err) {
    console.error("editContact error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Contact.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!deleted) return res.status(404).json({ message: "Contact not found" });

    res.json({ success: true, message: "Contact deleted" });
  } catch (err) {
    console.error("deleteContact error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
