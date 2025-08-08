const Appointment = require("../models/Appointment");
const Slot = require("../models/Slot");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

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

    // Check if slot is available
    const slot = await Slot.findById(slotId);
    if (!slot)
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    if (slot.isBooked)
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked" });

    // Create appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      slotId,
      date,
      startTime,
      endTime,
      reason,
    });

    // Mark slot as booked
    await Slot.findByIdAndUpdate(slotId, { isBooked: true });

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

// 📌 Get All Appointments (optional filters: doctorId, patientId, status)
exports.getAppointments = async (req, res) => {
  try {
    const { doctorId, patientId, status } = req.query;
    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate("patientId", "name email")
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

// 📌 Cancel Appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params; // appointment ID

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    // Free the slot
    if (appointment.slotId) {
      await Slot.findByIdAndUpdate(appointment.slotId, { isBooked: false });
    }

    appointment.status = "Cancelled";
    await appointment.save();

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
    const { id } = req.params; // appointment ID
    const { newSlotId, newDate, newStartTime, newEndTime } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    // Free old slot
    if (appointment.slotId) {
      await Slot.findByIdAndUpdate(appointment.slotId, { isBooked: false });
    }

    // Check if new slot is available
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
    appointment.date = newDate;
    appointment.startTime = newStartTime;
    appointment.endTime = newEndTime;
    appointment.status = "Rescheduled";
    await appointment.save();

    // Book new slot
    await Slot.findByIdAndUpdate(newSlotId, { isBooked: true });

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

// 📌 Delete Appointment (permanent delete)
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params; // appointment ID

    const appointment = await Appointment.findById(id);
    if (!appointment)
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });

    // Free the slot
    if (appointment.slotId) {
      await Slot.findByIdAndUpdate(appointment.slotId, { isBooked: false });
    }

    await Appointment.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Appointment deleted successfully" });
  } catch (err) {
    console.error("deleteAppointment error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete appointment",
      error: err.message,
    });
  }
};
