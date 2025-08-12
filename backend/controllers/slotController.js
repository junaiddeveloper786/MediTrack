const Slot = require("../models/slot");

// ✅ Create slots in a date & time range
exports.createSlotsInRange = async (req, res) => {
  try {
    const { doctorId, fromDate, toDate, startTime, endTime, slotDuration } =
      req.body;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    const slots = [];

    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let currentTime = new Date(currentDate);
      currentTime.setHours(startHour, startMinute, 0, 0);

      const endOfDayTime = new Date(currentDate);
      endOfDayTime.setHours(endHour, endMinute, 0, 0);

      while (currentTime < endOfDayTime) {
        const nextTime = new Date(currentTime.getTime() + slotDuration * 60000);

        const sHour = currentTime.getHours();
        const sMinute = currentTime.getMinutes();
        const eHour = nextTime.getHours();
        const eMinute = nextTime.getMinutes();

        const startTimeValue = `${String(sHour).padStart(2, "0")}:${String(
          sMinute
        ).padStart(2, "0")}`;
        const endTimeValue = `${String(eHour).padStart(2, "0")}:${String(
          eMinute
        ).padStart(2, "0")}`;

        slots.push({
          doctorId,
          date: new Date(currentDate),
          day: currentDate.toLocaleString("en-US", { weekday: "long" }),
          startTime: startTimeValue,
          endTime: endTimeValue,
          startMinutes: sHour * 60 + sMinute,
          endMinutes: eHour * 60 + eMinute,
          isBooked: false,
        });

        currentTime = nextTime;
      }
    }

    await Slot.insertMany(slots);
    res
      .status(201)
      .json({ message: "Slots created successfully", count: slots.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating slots", error: error.message });
  }
};

// ✅ Get slots with optional filtering
exports.getSlots = async (req, res) => {
  try {
    const { doctorId, date, startTime, endTime, isBooked } = req.query;
    const filter = {};

    if (doctorId) filter.doctorId = doctorId;
    if (isBooked !== undefined) filter.isBooked = isBooked === "true";

    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      filter.date = { $gte: selectedDate, $lt: nextDay };
    }

    if (startTime && endTime) {
      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      filter.startMinutes = { $gte: startTotalMinutes };
      filter.endMinutes = { $lte: endTotalMinutes };
    }

    const slots = await Slot.find(filter).sort({ date: 1, startMinutes: 1 });
    res.status(200).json(slots);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching slots", error: error.message });
  }
};

// ✅ Update a slot
exports.updateSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, isBooked } = req.body;

    const updateData = {};
    if (startTime) {
      const [sHour, sMinute] = startTime.split(":").map(Number);
      updateData.startTime = startTime;
      updateData.startMinutes = sHour * 60 + sMinute;
    }
    if (endTime) {
      const [eHour, eMinute] = endTime.split(":").map(Number);
      updateData.endTime = endTime;
      updateData.endMinutes = eHour * 60 + eMinute;
    }
    if (isBooked !== undefined) updateData.isBooked = isBooked;

    const slot = await Slot.findByIdAndUpdate(id, updateData, { new: true });
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.status(200).json({ message: "Slot updated successfully", slot });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating slot", error: error.message });
  }
};

// ✅ Delete a slot
exports.deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const slot = await Slot.findByIdAndDelete(id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    res.status(200).json({ message: "Slot deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting slot", error: error.message });
  }
};
