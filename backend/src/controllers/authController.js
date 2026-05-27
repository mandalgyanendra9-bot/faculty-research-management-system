const crypto = require("crypto");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");
const { generateToken } = require("../utils/token");
const catchAsync = require("../utils/catchAsync");
const { createAuditLog } = require("../services/auditService");

const register = async (req, res) => {
  const { name, email, password, role, department, designation } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

  const user = await User.create({
    name,
    email,
    password,
    role: role || "faculty",
    department,
    designation,
  });

  if (user.role === "faculty") {
    await FacultyProfile.create({ user: user._id });
  }

  const token = generateToken({ id: user._id, role: user.role });
  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password").populate("department", "name code");
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: "User account is deactivated" });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken({ id: user._id, role: user.role });

  await createAuditLog(req, {
    action: "login",
    module: "auth",
    targetType: "user",
    targetId: user._id,
    status: "success",
    details: { email: user.email, role: user.role },
  });

  return res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    },
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.json({ success: true, message: "If account exists, reset link sent" });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  // In production, send this via email service.
  return res.json({
    success: true,
    message: "Password reset token generated",
    data: { resetToken: rawToken, expiresInMinutes: 15 },
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) return res.status(400).json({ success: false, message: "Invalid or expired token" });

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return res.json({ success: true, message: "Password reset successful" });
};

const me = async (req, res) => {
  const user = await User.findById(req.user._id).populate("department", "name code");
  res.json({ success: true, data: user });
};

module.exports = {
  register: catchAsync(register),
  login: catchAsync(login),
  forgotPassword: catchAsync(forgotPassword),
  resetPassword: catchAsync(resetPassword),
  me: catchAsync(me),
};
