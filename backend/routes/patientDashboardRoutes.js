const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const patientDashboardController = require("../controllers/patientDashboardController");

// Patient dashboard stats
router.get("/stats", protect, patientDashboardController.getPatientStats);

// Recent appointments
router.get(
  "/recent",
  protect,
  patientDashboardController.getRecentAppointments
);

module.exports = router;
