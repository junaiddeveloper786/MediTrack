const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { protect, patient, admin } = require("../middleware/authMiddleware");

// Logged-in patient profile routes (must be first!)
router.get("/profile", protect, patient, patientController.getProfile);
router.put("/profile", protect, patient, patientController.updateProfile);

// Admin CRUD for all patients
router.get("/", protect, admin, patientController.getPatients);
router.post("/", protect, admin, patientController.createPatient);
router.put("/:id", protect, admin, patientController.updatePatient);
router.delete("/:id", protect, admin, patientController.deletePatient);

module.exports = router;
