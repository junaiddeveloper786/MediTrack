const Appointment = require("../models/Appointment");

// ✅ Get Patient Dashboard Stats
exports.getPatientStats = async (req, res) => {
  try {
    const patientId = req.user._id;

    const totalAppointments = await Appointment.countDocuments({ patientId });

    const upcoming = await Appointment.countDocuments({
      patientId,
      status: { $in: ["Pending", "Rescheduled", "Confirmed"] },
    });

    const completed = await Appointment.countDocuments({
      patientId,
      status: { $in: ["Completed"] },
    });

    const cancelled = await Appointment.countDocuments({
      patientId,
      status: { $in: ["Cancelled"] },
    });

    res.status(200).json({ totalAppointments, upcoming, completed, cancelled });
  } catch (err) {
    console.error("getPatientStats error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch patient stats", error: err.message });
  }
};

// ✅ Get Recent 4 Appointments
exports.getRecentAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    const recentAppointments = await Appointment.find({ patientId })
      .sort({ date: -1, startTime: -1 })
      .limit(4)
      .populate("doctorId", "name")
      .lean();

    const formatted = recentAppointments.map((appt) => {
      const apptDate = new Date(appt.date);
      const formattedDate = apptDate.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      return {
        doctor: appt.doctorId?.name || "N/A",
        date: formattedDate,
        startTime: appt.startTime,
        endTime: appt.endTime,
        status: appt.status,
      };
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error("getRecentAppointments error:", err);
    res.status(500).json({
      message: "Failed to fetch recent appointments",
      error: err.message,
    });
  }
};
