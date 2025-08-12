const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { protect, admin } = require("../middleware/authMiddleware");

// Admin can manage all patients
router.get("/", protect, admin, patientController.getPatients);
router.post("/", protect, admin, patientController.createPatient);
router.put("/:id", protect, admin, patientController.updatePatient);
router.delete("/:id", protect, admin, patientController.deletePatient);

// Logged-in patient profile routes
router.get("/profile", protect, patientController.getProfile);
router.put("/profile", protect, patientController.updateProfile);

module.exports = router;
