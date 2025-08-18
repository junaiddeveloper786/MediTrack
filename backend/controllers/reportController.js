// controllers/reportController.js
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");
const Slot = require("../models/Slot");

// Helper: parse yyyy-mm-dd to local date
const parseLocalDate = (dateStr, endOfDay = false) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  if (endOfDay) {
    return new Date(y, m - 1, d, 23, 59, 59, 999); // end of day
  }
  return new Date(y, m - 1, d, 0, 0, 0, 0); // start of day
};

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
        if (startDate) query.date.$gte = parseLocalDate(startDate);
        if (endDate) query.date.$lte = parseLocalDate(endDate, true);

        data = await Appointment.find(query)
          .populate("patientId", "name")
          .populate("doctorId", "name specialty")
          .lean();

        data = data.map((a) => {
          const localDate = new Date(a.date);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");

          return {
            id: a._id.toString(),
            doctor: a.doctorId?.name || "",
            specialty: a.doctorId?.specialty || "",
            patient: a.patientId?.name || "",
            date: `${day}/${month}/${year}`, // local date
            day: localDate.toLocaleDateString("en-US", { weekday: "long" }),
            status: a.status,
            starttime: a.startTime,
            endtime: a.endTime,
          };
        });
        break;
      }

      case "patients": {
        let query = { role: "user" };
        if (search) {
          const regex = new RegExp(search, "i");
          query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        data = await User.find(query).lean();

        data = data.map((p) => {
          const localDate = new Date(p.createdAt);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");

          return {
            id: p._id.toString(),
            name: p.name || "",
            email: p.email || "",
            phone: p.phone || "",
            createdat: p.createdAt ? `${day}/${month}/${year}` : "",
          };
        });
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

        data = data.map((d) => {
          const localDate = new Date(d.createdAt);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");

          return {
            id: d._id.toString(),
            name: d.name || "",
            email: d.email || "",
            specialty: d.specialty || "",
            createdat: d.createdAt ? `${day}/${month}/${year}` : "",
          };
        });
        break;
      }

      case "slots": {
        let query = {};
        if (startDate || endDate) query.date = {};
        if (startDate) query.date.$gte = parseLocalDate(startDate);
        if (endDate) query.date.$lte = parseLocalDate(endDate, true);

        data = await Slot.find(query)
          .populate("doctorId", "name specialty")
          .lean();

        data = data.map((s) => {
          const localDate = new Date(s.date);
          const year = localDate.getFullYear();
          const month = String(localDate.getMonth() + 1).padStart(2, "0");
          const day = String(localDate.getDate()).padStart(2, "0");

          return {
            id: s._id.toString(),
            doctor: s.doctorId?.name || "",
            specialty: s.doctorId?.specialty || "",
            date: `${day}/${month}/${year}`, // local date
            day: localDate.toLocaleDateString("en-US", { weekday: "long" }),
            starttime: s.startTime,
            endtime: s.endTime,
          };
        });
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
