const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const slotController = require("../controllers/slotController");
const { protect } = require("../middleware/authMiddleware");

// Book appointment (login required)
router.post("/", protect, appointmentController.createAppointment);

// Get appointments (login required)
router.get("/", protect, appointmentController.getAppointments);

// Cancel appointment
router.put("/cancel/:id", protect, appointmentController.cancelAppointment);

// Confirm appointment
router.put("/confirm/:id", protect, appointmentController.confirmAppointment);

// Reschedule appointment
router.put(
  "/reschedule/:id",
  protect,
  appointmentController.rescheduleAppointment
);

// Complete appointment
router.put("/complete/:id", protect, appointmentController.completeAppointment);

// Get appointments for a specific patient
router.get(
  "/patient/:patientId",
  protect,
  appointmentController.getAppointmentsByPatient
);

module.exports = router;
