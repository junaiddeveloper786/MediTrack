// controllers/reportController.js
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");

exports.getReport = async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate, status, search } = req.query;

  try {
    let data = [];

    switch (type) {
      case "appointments": {
        let query = {};
        if (status && status !== "All") query.status = status;
        if (startDate || endDate) query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);

        data = await Appointment.find(query)
          .populate("patientId", "name")
          .populate("doctorId", "name specialty")
          .lean();

        data = data.map((a) => ({
          id: a._id.toString(),
          doctor: a.doctorId?.name || "",
          specialty: a.doctorId?.specialty || "",
          patient: a.patientId?.name || "",
          date: a.date.toISOString().split("T")[0],
          status: a.status,
          starttime: a.startTime,
          endtime: a.endTime,
        }));
        break;
      }

      case "patients": {
        let query = { role: "user" };
        if (search) {
          const regex = new RegExp(search, "i");
          query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        data = await User.find(query).lean();

        data = data.map((p) => ({
          id: p._id.toString(),
          name: p.name || "",
          email: p.email || "",
          phone: p.phone || "",
          createdat: p.createdAt ? p.createdAt.toISOString().split("T")[0] : "",
        }));
        break;
      }

      case "doctors": {
        let query = {};
        if (search) {
          const regex = new RegExp(search, "i");
          query.$or = [
            { name: regex },
            { email: regex },
            { phone: regex },
            { specialty: regex },
          ];
        }

        data = await Doctor.find(query).lean();

        data = data.map((d) => ({
          id: d._id.toString(),
          name: d.name || "",
          email: d.email || "",
          specialty: d.specialty || "",
          createdat: d.createdAt ? d.createdAt.toISOString().split("T")[0] : "",
        }));
        break;
      }

      case "slots": {
        let query = {};
        if (startDate || endDate) query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);

        data = await Slot.find(query)
          .populate("doctorId", "name specialty")
          .lean();

        data = data.map((s) => ({
          id: s._id.toString(),
          doctor: s.doctorId?.name || "",
          specialty: s.doctorId?.specialty || "",
          date: s.date.toISOString().split("T")[0],
          day: s.date.toLocaleDateString("en-US", { weekday: "long" }),
          starttime: s.startTime,
          endtime: s.endTime,
        }));
        break;
      }

      default:
        return res.status(400).json({ message: "Invalid report type" });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
