// routes/adminDashboardRoutes.js
const express = require("express");
const router = express.Router();
const AdminDashboardController = require("../controllers/adminDashboardController");
const { protect, admin } = require("../middleware/authMiddleware");

// ✅ Get dashboard stats (KPIs)
router.get(
  "/stats",
  protect,
  admin,
  AdminDashboardController.getDashboardStats
);

// ✅ Get recent appointments
router.get(
  "/appointments/recent",
  protect,
  admin,
  AdminDashboardController.getRecentAppointments
);

// ✅ Get appointments for a specific date
router.get(
  "/appointments",
  protect,
  admin,
  AdminDashboardController.getAppointmentsByDate
);

module.exports = router;
