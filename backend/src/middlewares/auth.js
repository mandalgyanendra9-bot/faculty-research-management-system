const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User inactive or not found" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }
  return next();
};

const optionalProtect = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return next();
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Invalid authorization header" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User inactive or not found" });
    }

    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = { protect, authorize, optionalProtect };
