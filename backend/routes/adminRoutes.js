const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const User = require("../models/User");

// ✅ Get logged-in admin profile
router.get("/profile", protect, admin, async (req, res) => {
  res.json(req.user);
});

// ✅ Update logged-in admin profile
router.put("/profile", protect, admin, async (req, res) => {
  try {
    const adminUser = await User.findById(req.user._id);
    if (!adminUser) {
      return res.status(404).json({ message: "Admin not found" });
    }

    adminUser.name = req.body.name || adminUser.name;
    adminUser.email = req.body.email || adminUser.email;
    adminUser.phone = req.body.phone || adminUser.phone;

    if (req.body.password) {
      adminUser.password = req.body.password; // will be hashed in model pre-save
    }

    const updatedAdmin = await adminUser.save();

    res.json({
      _id: updatedAdmin._id,
      name: updatedAdmin.name,
      email: updatedAdmin.email,
      phone: updatedAdmin.phone,
      role: updatedAdmin.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
