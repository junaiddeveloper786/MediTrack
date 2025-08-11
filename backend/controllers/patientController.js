const User = require("../models/User"); // Use User model instead of Patient

// Get all patients with optional search by name, email or phone
exports.getPatients = async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i"); // case insensitive

    const patients = await User.find({
      role: "user", // Only users with role "user" (patients)
      $or: [{ name: regex }, { email: regex }, { phone: regex }],
    }).sort({ createdAt: -1 });

    res.json({ patients });
  } catch (err) {
    console.error("getPatients error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single patient by id (optional)
exports.getPatientById = async (req, res) => {
  try {
    const patient = await User.findOne({ _id: req.params.id, role: "user" });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    console.error("getPatientById error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create new patient without gender and DOB
exports.createPatient = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const patient = new User({ name, email, phone, role: "user" });
    await patient.save();

    res.status(201).json({ message: "Patient created", patient });
  } catch (err) {
    console.error("createPatient error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update patient by ID (no gender or dob)
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check email uniqueness except current patient
    const existing = await User.findOne({ email, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const updatedPatient = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      { name, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient updated", patient: updatedPatient });
  } catch (err) {
    console.error("updatePatient error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete patient by ID
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await User.findOneAndDelete({ _id: id, role: "user" });
    if (!deleted) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({ message: "Patient deleted" });
  } catch (err) {
    console.error("deletePatient error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get logged-in patient profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id, role: "user" }).select(
      "-password -__v"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update logged-in patient profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone } = req.body;

    // Check email uniqueness except current user
    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: "user" },
      { name, email, phone },
      { new: true, runValidators: true }
    ).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    console.error("updateProfile error:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};
