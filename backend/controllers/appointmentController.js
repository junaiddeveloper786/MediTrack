const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const sendEmail = require("../utils/sendEmail");
const sendSMS = require("../utils/sendSMS");

// ✅ Book Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate } = req.body;

    const appointment = new Appointment({
      patientId: req.user.id,
      doctorId,
      appointmentDate,
      status: "Pending",
    });

    await appointment.save();

    // 📧 Send Email to Patient
    const patient = await User.findById(req.user.id);
    const doctor = await Doctor.findById(doctorId);

    await sendEmail(
      patient.email,
      "Appointment Booked Successfully",
      `Dear ${patient.name},

Your appointment with Dr. ${doctor.name} (${
        doctor.specialty
      }) has been booked for ${new Date(appointmentDate).toLocaleString()}.

Regards,
MediTrack Team`
    );

    // 📱 Send SMS
    await sendSMS(
      patient.phone,
      `Hi ${patient.name}, your appointment with Dr. ${doctor.name} is booked for ${formattedDate}.`
    );

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment,
    });
  } catch (error) {
    console.error("Book Appointment Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get My Appointments
exports.getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name specialty")
      .sort({ appointmentDate: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get My Appointments Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Get All Appointments (Admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name specialty")
      .populate("patientId", "name email")
      .sort({ appointmentDate: 1 });

    res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    console.error("Get All Appointments Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// ✅ Update Appointment Status (Admin)
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    // 📧 Notify Patient
    const patient = await User.findById(appointment.patientId);
    const doctor = await Doctor.findById(appointment.doctorId);

    await sendEmail(
      patient.email,
      `Appointment ${status}`,
      `Hello ${patient.name},

Your appointment with Dr. ${doctor.name} has been ${status}.

Regards,
MediTrack`
    );

    res.status(200).json({
      success: true,
      message: `Appointment ${status}`,
      data: appointment,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
