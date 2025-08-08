const express = require("express");
const router = express.Router();
const slotController = require("../controllers/slotController");

// create slots in range
router.post("/", slotController.createSlotsInRange);

// get slots (optionally filter by doctorId, fromDate, toDate)
router.get("/", slotController.getSlots);

// update slot
router.put("/:id", slotController.updateSlot);

// delete slot
router.delete("/:id", slotController.deleteSlot);

module.exports = router;
