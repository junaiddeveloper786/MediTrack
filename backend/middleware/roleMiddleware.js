const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const isPatient = (req, res, next) => {
  if (req.user.role !== "user") {
    return res.status(403).json({ message: "User access required" });
  }
  next();
};

module.exports = { isAdmin, isPatient };
