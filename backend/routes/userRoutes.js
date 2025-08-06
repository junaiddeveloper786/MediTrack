const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.status(200).json(user);
});

router.post("/register", register);
router.post("/login", login);

module.exports = router;
