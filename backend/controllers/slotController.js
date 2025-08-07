const Slot = require("../models/Slot");

// Add new slot
exports.createSlot = async (req, res) => {
  try {
    const { doctorId, day, startTime, endTime } = req.body;
    const slot = await Slot.create({ doctorId, day, startTime, endTime });
    res.status(201).json({ success: true, slot });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create slot",
      error: error.message,
    });
  }
};

// Get all slots for a specific doctor
exports.getSlotsByDoctor = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const slots = await Slot.find({ doctorId }).sort({ day: 1, startTime: 1 });
    res.status(200).json({ success: true, slots });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get slots",
      error: error.message,
    });
  }
};

// Update slot by ID
exports.updateSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    const updatedSlot = await Slot.findByIdAndUpdate(slotId, req.body, {
      new: true,
    });
    res.status(200).json({ success: true, updatedSlot });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update slot",
      error: error.message,
    });
  }
};

// Delete slot by ID
exports.deleteSlot = async (req, res) => {
  try {
    const slotId = req.params.id;
    await Slot.findByIdAndDelete(slotId);
    res
      .status(200)
      .json({ success: true, message: "Slot deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete slot",
      error: error.message,
    });
  }
};
