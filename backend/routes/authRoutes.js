const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// LOGIN route
router.post("/login", async (req, res) => {
  // ...login logic
});

// REGISTER route
router.post("/register", async (req, res) => {
  // ...register logic
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: "Email not found" });

  const token = crypto.randomBytes(32).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  await sendEmail(
    user.email,
    "Password Reset Request",
    `Click the link to reset your password: ${resetLink}`
  );

  res.json({ message: "Reset link sent to your email" });
});

// 🔐 RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const user = await User.findOne({
    resetToken: req.params.token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpiry = null;
  await user.save();

  res.json({ message: "Password has been reset successfully" });
});

module.exports = router;
