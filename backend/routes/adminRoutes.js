const express = require("express");
const { Parser } = require("json2csv");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/dashboard/kpis", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "user" });
    const totalAppointments = await Appointment.countDocuments();

    const appointmentStats = await Appointment.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statusCounts = {};
    appointmentStats.forEach((stat) => {
      statusCounts[stat._id] = stat.count;
    });

    res.json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      statusCounts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch KPIs" });
  }
});

// ✅ Route 1 – Dashboard Stats
router.get("/dashboard", auth, async (req, res) => {
  try {
    const doctors = await Doctor.countDocuments();
    const patients = await User.countDocuments({ role: "user" });
    const appointments = await Appointment.find()
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .sort({ appointmentDate: -1 });

    const formattedAppointments = appointments.map((a) => ({
      _id: a._id,
      appointmentDate: a.appointmentDate,
      status: a.status,
      patientName: a.patientId?.name,
      doctorName: a.doctorId?.name,
    }));

    res.json({
      stats: { doctors, patients, appointments: appointments.length },
      appointments: formattedAppointments,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
});

// ✅ Route 2 – CSV Export
router.get("/appointments/export", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const appointments = await Appointment.find()
      .populate("patientId", "name email")
      .populate("doctorId", "name specialty");

    const csvData = appointments.map((appt) => ({
      Patient: appt.patientId.name,
      Email: appt.patientId.email,
      Doctor: appt.doctorId.name,
      Specialty: appt.doctorId.specialty,
      Date: new Date(appt.appointmentDate).toLocaleString(),
      Status: appt.status,
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(csvData);

    res.header("Content-Type", "text/csv");
    res.attachment("appointments.csv");
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Export failed" });
  }
});

module.exports = router;
