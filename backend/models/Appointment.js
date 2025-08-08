const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
    },
    date: { type: Date, required: true }, // appointment date (ISO)
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true }, // "10:00"
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Rescheduled"],
      default: "Pending",
    },
    reason: { type: String }, // optional note
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
