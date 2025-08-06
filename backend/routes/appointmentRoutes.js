const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  updateStatus,
} = require("../controllers/appointmentController");
const authMiddleware = require("../middleware/auth");

// ✅ Booking an appointment
router.post("/book", authMiddleware, bookAppointment);

// ✅ Get my appointments
router.get("/my", authMiddleware, getMyAppointments);

// ✅ Admin: Get all appointments
router.get("/all", authMiddleware, getAllAppointments);

// ✅ Update appointment status (approve, cancel)
router.put("/status/:id", authMiddleware, updateStatus);

module.exports = router;
