const User = require("../models/userModel");

// GET /api/admin/profile
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/admin/profile
const updateAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    admin.name = req.body.name || admin.name;
    admin.email = req.body.email || admin.email;
    admin.phone = req.body.phone || admin.phone;

    if (req.body.password) {
      admin.password = req.body.password; // bcrypt will hash it from pre-save hook
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
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAdminProfile, updateAdminProfile };
