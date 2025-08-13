const express = require("express");
const router = express.Router();
const {
  getAdminProfile,
  updateAdminProfile,
} = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

router.get("/profile", protect, admin, getAdminProfile);
router.put("/profile", protect, admin, updateAdminProfile);

module.exports = router;
