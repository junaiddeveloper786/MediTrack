const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get all patients with optional search by name, email or phone
exports.getPatients = async (req, res) => {
  try {
    const search = req.query.search || "";
    const regex = new RegExp(search, "i"); // case insensitive

    const patients = await User.find({
      role: "user",
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

// Create new patient with password hashing
exports.createPatient = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const patient = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
    });
    await patient.save();

    // Return patient without password
    const patientSafe = patient.toObject();
    delete patientSafe.password;

    res.status(201).json({ message: "Patient created", patient: patientSafe });
  } catch (err) {
    console.error("createPatient error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update patient by ID with optional password update
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email already exists (except current patient)
    const existing = await User.findOne({ email, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Prepare update object
    const updateData = { name, email, phone };

    // Only hash and update password if password provided and not empty
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    // Update patient document
    const updatedPatient = await User.findOneAndUpdate(
      { _id: id, role: "user" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

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
  console.log("Updating profile for:", req.user);
  console.log("Request body:", req.body);

  try {
    const userId = req.user._id;
    const { name, email, phone, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await User.findOne({ email, _id: { $ne: userId } });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const updateData = { name, email, phone };
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    console.log("Updating with data:", updateData);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, role: "user" },
      updateData,
      { new: true, runValidators: true }
    ).select("-password -__v");

    console.log("Updated user:", updatedUser);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("updateProfile error:", err);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};
