const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  addDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// GET all doctors
router.get("/", auth, getDoctors);

// GET single doctor by ID
router.get("/:id", auth, getDoctorById);

// POST - Add new doctor
router.post("/", auth, addDoctor);

// PUT - Update doctor
router.put("/:id", auth, updateDoctor);

// DELETE - Remove doctor
router.delete("/:id", auth, deleteDoctor);

module.exports = router;
