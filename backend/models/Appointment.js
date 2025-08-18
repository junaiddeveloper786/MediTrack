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
      required: true,
    },
    date: { type: Date, required: true },
    startTime: String,
    endTime: String,
    reason: String,
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Rescheduled", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ patientId: 1, date: -1 });

module.exports =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
