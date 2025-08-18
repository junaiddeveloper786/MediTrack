// controllers/adminDashboardController.js
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");

// 📌 Get dashboard stats (KPIs)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const totalPatients = await User.countDocuments({ role: "user" });
    const totalAppointments = await Appointment.countDocuments({
      status: { $ne: "Cancelled" },
    });
    const upcomingSlots = await Slot.countDocuments({
      isBooked: false,
      date: { $gte: new Date() },
    });

    res.status(200).json({
      totalDoctors,
      totalPatients,
      totalAppointments,
      upcomingSlots,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

// 📌 Get recent appointments (last 4)
exports.getRecentAppointments = async (req, res) => {
  try {
    const recentAppointments = await Appointment.find({
      status: { $ne: "Cancelled" },
    })
      .sort({ date: -1 })
      .limit(4)
      .populate("patientId", "name")
      .populate("doctorId", "name");

    const formatted = recentAppointments.map((appt) => ({
      patientName: appt.patientId?.name || "N/A",
      doctorName: appt.doctorId?.name || "N/A",
      date: appt.date,
      status: appt.status,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getRecentAppointments error:", err);
    res.status(500).json({ message: "Failed to fetch recent appointments" });
  }
};

// 📌 Get appointments for a specific date
exports.getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: "Date is required" });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const appointments = await Appointment.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: "Cancelled" },
    })
      .populate("patientId", "name")
      .populate("doctorId", "name")
      .sort({ startTime: 1 });

    const formatted = appointments.map((appt) => ({
      patient: appt.patientId,
      doctor: appt.doctorId,
      startTime: appt.startTime,
      endTime: appt.endTime,
    }));

    res.status(200).json({ appointments: formatted });
  } catch (err) {
    console.error("getAppointmentsByDate error:", err);
    res.status(500).json({ message: "Failed to fetch appointments for date" });
  }
};
