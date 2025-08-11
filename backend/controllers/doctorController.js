const Doctor = require("../models/Doctor");

// Create new doctor
exports.createDoctor = async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    console.error("createDoctor error:", error);
    res.status(500).json({ message: "Error creating doctor" });
  }
};

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}, "name specialty email phone");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("getAllDoctors error:", error);
    res.status(500).json({ message: "Error fetching doctors" });
  }
};

// Get doctor by ID (with availableSlots)
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("getDoctorById error:", error);
    res.status(500).json({ message: "Error fetching doctor" });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    console.error("updateDoctor error:", error);
    res.status(500).json({ message: "Error updating doctor" });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("deleteDoctor error:", error);
    res.status(500).json({ message: "Error deleting doctor" });
  }
};
