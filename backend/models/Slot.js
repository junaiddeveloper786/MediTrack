const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    day: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slot", slotSchema);
