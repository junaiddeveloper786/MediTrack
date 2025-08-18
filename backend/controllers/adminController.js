const User = require("../models/User");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// GET admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      createdAt: req.user.createdAt,
    });
  } catch (err) {
    console.error("Error fetching admin profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE admin profile
exports.updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Email duplication check
    if (req.body.email && req.body.email !== admin.email) {
      const emailExists = await User.findOne({ email: req.body.email });
      if (emailExists) {
        return res.status(400).json({ message: "Email already in use" });
      }
      admin.email = req.body.email;
    }

    admin.name = req.body.name || admin.name;
    admin.phone = req.body.phone || admin.phone;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedAdmin = await admin.save();

    // ✅ generate new token after update
    const token = generateToken(updatedAdmin._id);

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
      createdAt: updatedAdmin.createdAt,
      token, // send new token
    });
  } catch (err) {
    console.error("Error updating admin profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
