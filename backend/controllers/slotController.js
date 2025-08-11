// controllers/slotController.js
const Slot = require("../models/Slot");

// ✅ Create slots in a date range
exports.createSlotsInRange = async (req, res) => {
  try {
    const { doctorId, startDate, endDate, startTime, endTime, slotDuration } =
      req.body;

    if (
      !doctorId ||
      !startDate ||
      !endDate ||
      !startTime ||
      !endTime ||
      !slotDuration
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    let slots = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      let currentTime = new Date(
        `${d.toISOString().split("T")[0]}T${startTime}`
      );
      let endTimeDate = new Date(`${d.toISOString().split("T")[0]}T${endTime}`);

      while (currentTime < endTimeDate) {
        const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);

        slots.push({
          doctorId,
          date: new Date(d),
          startTime: new Date(currentTime),
          endTime: new Date(nextTime),
          isBooked: false,
        });

        currentTime = nextTime;
      }
    }

    const createdSlots = await Slot.insertMany(slots);
    res.status(201).json({
      success: true,
      message: "Slots created successfully",
      data: createdSlots,
    });
  } catch (err) {
    console.error("createSlotsInRange error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create slots",
      error: err.message,
    });
  }
};

// ✅ Get all slots (admin/doctor view)
exports.getSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.query;
    let filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const slots = await Slot.find(filter)
      .populate("doctorId", "name")
      .sort({ date: 1, startTime: 1 });
    res.status(200).json({ success: true, slots });
  } catch (err) {
    console.error("getSlots error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch slots",
      error: err.message,
    });
  }
};

// ✅ Get available slots for booking (patient view)
exports.getAvailableSlotsByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID and date are required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const slots = await Slot.find({
      doctorId,
      date: { $gte: startOfDay, $lte: endOfDay },
      isBooked: { $ne: true },
    })
      .populate("doctorId", "name")
      .sort({ startTime: 1 });

    res.status(200).json({ success: true, slots });
  } catch (err) {
    console.error("getAvailableSlotsByDate error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
      error: err.message,
    });
  }
};

// ✅ Update slot
exports.updateSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!slot) {
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    }
    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
      data: slot,
    });
  } catch (err) {
    console.error("updateSlot error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update slot",
      error: err.message,
    });
  }
};

// ✅ Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await Slot.findByIdAndDelete(req.params.id);
    if (!slot) {
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Slot deleted successfully" });
  } catch (err) {
    console.error("deleteSlot error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete slot",
      error: err.message,
    });
  }
};
