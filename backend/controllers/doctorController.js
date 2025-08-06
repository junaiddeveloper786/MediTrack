const Doctor = require("../models/Doctor");

// Add new doctor
exports.addDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ msg: "Error adding doctor" });
  }
};

// Get all doctors
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.status(200).json(doctors);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching doctors" });
  }
};

// ✅ Get single doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ msg: "Doctor not found" });
    }
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching doctor" });
  }
};

// Update doctor
exports.updateDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(doctor);
  } catch (err) {
    res.status(500).json({ msg: "Error updating doctor" });
  }
};

// Delete doctor
exports.deleteDoctor = async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.status(200).json({ msg: "Doctor deleted" });
  } catch (err) {
    res.status(500).json({ msg: "Error deleting doctor" });
  }
};
