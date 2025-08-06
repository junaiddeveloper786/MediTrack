const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: String,
  email: String,
  specialty: String,
  phone: String,
  availableSlots: [String], // Array of ISO Date-Time strings
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Doctor", doctorSchema);
