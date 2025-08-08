const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Book appointment
router.post("/", appointmentController.createAppointment);

// Get appointments (filterable)
router.get("/", appointmentController.getAppointments);

// Cancel appointment
router.put("/cancel/:id", appointmentController.cancelAppointment);

// Reschedule appointment
router.put("/reschedule/:id", appointmentController.rescheduleAppointment);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;
