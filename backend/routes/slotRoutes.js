// routes/slotRoutes.js
const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

// ✅ Get available slots by doctor & date
router.get("/available", slotController.getAvailableSlotsByDate);

// ✅ Create slot
router.post("/", slotController.createSlotsInRange);

// ✅ Get all slots (optional filters)
router.get("/", slotController.getSlots);

// ✅ Update slot
router.put("/:id", slotController.updateSlot);

// ✅ Delete slot
router.delete("/:id", slotController.deleteSlot);

module.exports = router;
