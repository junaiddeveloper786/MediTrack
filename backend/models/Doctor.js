const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    specialty: { type: String, required: true },
    availableSlots: [Date], // Array of available date-times
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
