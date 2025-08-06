const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleMiddleware");

router.get("/dashboard/kpis", auth, isAdmin, async (req, res) => {
  // You can implement your KPIs logic here later
  res.json({ message: "Admin dashboard KPIs loaded" });
});

module.exports = router;
