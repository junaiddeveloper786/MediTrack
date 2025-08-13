const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect route: verify JWT and attach user to req
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -__v");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }
};

// Only allow admins
exports.admin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: admin only" });
  }
  next();
};

// Only allow patients
exports.patient = (req, res, next) => {
  if (!req.user || req.user.role !== "user") {
    return res.status(403).json({ message: "Access denied: patient only" });
  }
  next();
};
