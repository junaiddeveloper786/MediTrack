const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

// Create slot
router.post("/", slotController.createSlot);

// Get slots for a doctor
router.get("/:doctorId", slotController.getSlotsByDoctor);

// Update slot
router.put("/:id", slotController.updateSlot);

// Delete slot
router.delete("/:id", slotController.deleteSlot);

module.exports = router;
