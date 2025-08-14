const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    res.json(req.user); // req.user already set by protect middleware
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

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedAdmin = await admin.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
      createdAt: updatedAdmin.createdAt,
    });
  } catch (err) {
    console.error("Error updating admin profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};
