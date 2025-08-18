const Appointment = require("../models/Appointment");
const Slot = require("../models/Slot");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const twilio = require("twilio");

// Twilio client setup
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"MediTrack" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
};

// Function to send SMS
const sendSMS = async (to, message) => {
  try {
    const from = process.env.TWILIO_PHONE_NUMBER.trim();
    const formattedTo = to.startsWith("+") ? to : `+91${to}`;
    console.log("📨 Sending SMS...");
    console.log("FROM:", from);
    console.log("TO:", formattedTo);
    console.log("MESSAGE:", message);

    await client.messages.create({
      body: message,
      from,
      to: formattedTo,
    });

    console.log(`✅ SMS sent to ${formattedTo}`);
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${to}:`, error);
  }
};

// 📌 Book Appointment
exports.createAppointment = async (req, res) => {
  try {
    const { patientId, doctorId, slotId, date, startTime, endTime, reason } =
      req.body;

    if (!patientId || !doctorId || !slotId || !date || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const slot = await Slot.findById(slotId);
    if (!slot)
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    if (slot.isBooked)
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked" });

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      slotId,
      date,
      startTime,
      endTime,
      reason,
    });

    await Slot.findByIdAndUpdate(slotId, { isBooked: true });

    const patient = await User.findById(patientId);
    const doctor = await Doctor.findById(doctorId);

    if (patient?.email) {
      await sendEmail(
        patient.email,
        "Appointment Booked - MediTrack",
        `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.name} has been booked.\nDate: ${date}\nTime: ${startTime} - ${endTime}\n\nThank you,\nMediTrack Team`
      );
    }

    if (patient?.phone) {
      await sendSMS(
        patient.phone,
        `Hello ${patient.name}, your appointment with Dr. ${doctor.name} is booked for ${date} at ${startTime}.`
      );
    }

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error("createAppointment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to book appointment",
      error: err.message,
    });
  }
};

// 📌 Get All Appointments (Admin gets all, normal users get only their own)
exports.getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, status, fromDate, toDate } = req.query;
    const filter = {};

    if (req.user.role === "admin") {
      if (doctorId) filter.doctorId = doctorId;
      if (patientId) filter.patientId = patientId;
    } else {
      filter.patientId = req.user._id;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "Cancelled" };
    }

    // 📌 Date filter logic
    if (fromDate && toDate) {
      filter.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    } else if (fromDate) {
      filter.date = { $gte: new Date(fromDate) };
    } else if (toDate) {
      filter.date = { $lte: new Date(toDate) };
    }

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email phone")
      .populate("doctorId", "name speciality")
      .populate("slotId")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("getAppointments error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: err.message,
    });
  }
};

// 📌 Confirm Appointment
exports.confirmAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    appointment.status = "Confirmed";
    await appointment.save();

    const patient = await User.findById(appointment.patientId);
    const doctor = await Doctor.findById(appointment.doctorId);

    if (patient?.email) {
      await sendEmail(
        patient.email,
        "Appointment Confirmed - MediTrack",
        `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.startTime} has been confirmed.\n\nThank you,\nMediTrack Team`
      );
    }

    if (patient?.phone) {
      await sendSMS(
        patient.phone,
        `Hello ${patient.name}, your appointment with Dr. ${doctor.name} on ${appointment.date} at ${appointment.startTime} is confirmed.`
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Appointment confirmed successfully" });
  } catch (err) {
    console.error("confirmAppointment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to confirm appointment",
      error: err.message,
    });
  }
};

// 📌 Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    if (appointment.slotId) {
      await Slot.findByIdAndUpdate(appointment.slotId, { isBooked: false });
    }

    appointment.status = "Cancelled";
    await appointment.save();

    const patient = await User.findById(appointment.patientId);
    const doctor = await Doctor.findById(appointment.doctorId);

    if (patient?.email) {
      await sendEmail(
        patient.email,
        "Appointment Cancelled - MediTrack",
        `Dear ${patient.name},\n\nYour appointment with Dr. ${doctor.name} on ${appointment.date} has been cancelled.\n\nThank you,\nMediTrack Team`
      );
    }

    if (patient?.phone) {
      await sendSMS(
        patient.phone,
        `Hello ${patient.name}, your appointment with Dr. ${doctor.name} on ${appointment.date} has been cancelled.`
      );
    }

    res
      .status(200)
      .json({ success: true, message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("cancelAppointment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
      error: err.message,
    });
  }
};

// 📌 Reschedule Appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { newSlotId, newDate, newStartTime, newEndTime } = req.body;

    // Find appointment
    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    // Free old slot
    if (appointment.slotId) {
      try {
        await Slot.findByIdAndUpdate(appointment.slotId, { isBooked: false });
      } catch (err) {
        console.warn("Failed to free old slot:", err.message);
      }
    }

    // Check new slot
    const newSlot = await Slot.findById(newSlotId);
    if (!newSlot)
      return res
        .status(404)
        .json({ success: false, message: "New slot not found" });
    if (newSlot.isBooked)
      return res
        .status(400)
        .json({ success: false, message: "New slot already booked" });

    // Update appointment
    appointment.slotId = newSlotId;
    appointment.date = new Date(newDate);
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = "Rescheduled";
    await appointment.save();

    // Mark new slot as booked
    await Slot.findByIdAndUpdate(newSlotId, { isBooked: true });

    // Notify patient
    const patient = await User.findById(appointment.patientId);
    const doctor = await Doctor.findById(appointment.doctorId);

    try {
      if (patient?.email) {
        await sendEmail(
          patient.email,
          "Appointment Rescheduled - MediTrack",
          `Dear ${patient.name},\n\nYour appointment with Dr. ${
            doctor?.name || "Doctor"
          } has been rescheduled.\nNew Date: ${appointment.date.toDateString()}\nNew Time: ${newStartTime} - ${newEndTime}\n\nThank you,\nMediTrack Team`
        );
      }
      if (patient?.phone) {
        await sendSMS(
          patient.phone,
          `Hello ${patient.name}, your appointment with Dr. ${
            doctor?.name || "Doctor"
          } has been rescheduled to ${appointment.date.toDateString()} at ${newStartTime}.`
        );
      }
    } catch (notifyErr) {
      console.warn("Notification failed:", notifyErr.message);
    }

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (err) {
    console.error("rescheduleAppointment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reschedule appointment",
      error: err.message,
    });
  }
};

// Complete appointment
exports.completeAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "Completed" },
      { new: true }
    );
    res.status(200).json({ message: "Appointment Completed", appointment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to complete appointment", error: err.message });
  }
};

// 📌 Get Appointments by Patient
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    if (!patientId) {
      return res
        .status(400)
        .json({ success: false, message: "Patient ID required" });
    }
    const appointments = await Appointment.find({ patientId })
      .populate("doctorId", "name specialty")
      .populate("patientId", "name email phone")
      .populate("slotId")
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({ success: true, appointments });
  } catch (err) {
    console.error("getAppointmentsByPatient error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
      error: err.message,
    });
  }
};

// 📌 Get Recent Appointments
exports.getRecentAppointments = async (req, res) => {
  try {
    const patientId = req.user._id;

    const recentAppointments = await Appointment.find({ patientId })
      .sort({ date: -1 })
      .limit(5)
      .populate("doctorId", "name");

    const formatted = recentAppointments.map((appt) => ({
      doctorName: appt.doctorId?.name || "N/A",
      date: appt.date,
      status: appt.status,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch recent appointments" });
  }
};
