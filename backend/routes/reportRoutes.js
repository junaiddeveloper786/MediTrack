const express = require("express");
const router = express.Router();
const { getReport } = require("../controllers/reportController");
const { protect, admin } = require("../middleware/authMiddleware");

// All report types require admin access
router.get("/:type", protect, admin, getReport);

module.exports = router;
