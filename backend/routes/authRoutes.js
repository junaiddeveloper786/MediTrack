const express = require("express");
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile); // protected route

// Example admin-only route
router.get("/admin-dashboard", protect, admin, (req, res) => {
  res.json({ message: "Welcome Admin!" });
});

module.exports = router;
