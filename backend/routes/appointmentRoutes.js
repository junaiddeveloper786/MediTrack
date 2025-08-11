const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

// Book appointment (login required)
router.post("/", protect, appointmentController.createAppointment);

// Get appointments (login required)
router.get("/", protect, appointmentController.getAppointments);

// Cancel appointment
router.put("/cancel/:id", protect, appointmentController.cancelAppointment);

// Reschedule appointment
router.put(
  "/reschedule/:id",
  protect,
  appointmentController.rescheduleAppointment
);

// Delete appointment
router.delete("/:id", protect, appointmentController.deleteAppointment);

// Get appointments for a specific patient
router.get(
  "/patient/:patientId",
  protect,
  appointmentController.getAppointmentsByPatient
);

module.exports = router;
