const Slot = require("../models/Slot");
const Doctor = require("../models/Doctor");

// Helper to format date to yyyy-mm-dd (UTC / local-consistent)
const fmtDateKey = (d) => {
  const dt = new Date(d);
  return dt.toISOString().slice(0, 10); // "2025-08-10"
};

// Create slots for every date in range (avoid duplicates)
exports.createSlotsInRange = async (req, res) => {
  try {
    const { doctorId, startDate, endDate, startTime, endTime } = req.body;

    if (!doctorId || !startDate || !endDate || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    // verify doctor exists
    const docExists = await Doctor.findById(doctorId).select("_id name");
    if (!docExists)
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });

    let from = new Date(startDate);
    let to = new Date(endDate);
    if (isNaN(from) || isNaN(to) || from > to) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid date range" });
    }

    const slotsToInsert = [];
    const existingKeys = new Set();

    // Fetch existing slots in the range for this doctor to avoid duplicates
    const existing = await Slot.find({
      doctorId,
      date: { $gte: from, $lte: to },
      startTime,
    }).lean();

    existing.forEach((s) => existingKeys.add(fmtDateKey(s.date)));

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const key = fmtDateKey(d);
      if (existingKeys.has(key)) continue; // skip duplicate date for same startTime

      slotsToInsert.push({
        doctorId,
        day: dayName,
        date: new Date(d),
        startTime,
        endTime,
      });
    }

    if (slotsToInsert.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new slots to add (duplicates skipped)",
      });
    }

    const created = await Slot.insertMany(slotsToInsert);

    // populate doctor name for response
    const populated = await Slot.find({
      _id: { $in: created.map((c) => c._id) },
    }).populate("doctorId", "name");

    res.status(201).json({ success: true, inserted: populated });
  } catch (err) {
    console.error("createSlotsInRange error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create slots",
      error: err.message,
    });
  }
};

// Get slots (optional query: doctorId, fromDate, toDate)
exports.getSlots = async (req, res) => {
  try {
    const { doctorId, fromDate, toDate } = req.query;
    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      filter.date = { $gte: from, $lte: to };
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

// Delete slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Slot.findByIdAndDelete(id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    res.status(200).json({ success: true, message: "Slot deleted" });
  } catch (err) {
    console.error("deleteSlot error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete slot",
      error: err.message,
    });
  }
};

// (Optional) update single slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updated = await Slot.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("doctorId", "name");
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Slot not found" });
    res.status(200).json({ success: true, slot: updated });
  } catch (err) {
    console.error("updateSlot error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update slot",
      error: err.message,
    });
  }
};

// Get available slots for a doctor by date (for patient booking)
exports.getAvailableSlotsByDate = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res
        .status(400)
        .json({ success: false, message: "Doctor ID and date are required" });
    }

    const selectedDate = new Date(date);

    // Fetch slots that are not already booked
    const slots = await Slot.find({
      doctorId,
      date: selectedDate,
      isBooked: { $ne: true }, // either false or undefined
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
