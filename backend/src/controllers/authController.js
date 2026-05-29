const crypto = require("crypto");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");
const { generateToken } = require("../utils/token");
const catchAsync = require("../utils/catchAsync");
const { createAuditLog } = require("../services/auditService");

const PRIVILEGED_ROLES = new Set(["super_admin", "admin", "hod_dean", "research_coordinator"]);

const attachProfilePhoto = async (user) => {
  if (!user) return null;

  const baseUser = typeof user.toObject === "function" ? user.toObject({ depopulate: false }) : { ...user };
  delete baseUser.password;
  if (baseUser.role !== "faculty") return baseUser;

  const profile = await FacultyProfile.findOne({ user: baseUser._id }).select("profilePhotoUrl").lean();
  const profilePhotoUrl = profile?.profilePhotoUrl || "";

  return {
    ...baseUser,
    profilePhotoUrl,
    profileImageUrl: profilePhotoUrl,
  };
};

const register = async (req, res) => {
  const { name, email, password, role, department, designation } = req.body;
  const requestedRole = role || "faculty";
  const actorRole = req.user?.role || null;
  const isPrivilegedRequest = PRIVILEGED_ROLES.has(requestedRole);
  const isAdminActor = actorRole === "super_admin" || actorRole === "admin";

  if (!actorRole && role) {
    return res.status(403).json({
      success: false,
      message: "Role self-assignment is not allowed in public registration",
    });
  }

  if (isPrivilegedRequest && !isAdminActor) {
    return res.status(403).json({
      success: false,
      message: "Only super admin or admin can create privileged users",
    });
  }

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: "Email already exists" });

  const finalRole = actorRole ? requestedRole : "faculty";
  const isActive = actorRole ? req.body.isActive ?? true : false;

  const user = await User.create({
    name,
    email,
    password,
    role: finalRole,
    department,
    designation,
    isActive,
  });

  if (user.role === "faculty") {
    await FacultyProfile.create({ user: user._id });
  }

  if (!isActive) {
    const userWithProfilePhoto = await attachProfilePhoto(user);
    return res.status(201).json({
      success: true,
      message: "Registration submitted. Account pending admin approval.",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          profilePhotoUrl: userWithProfilePhoto?.profilePhotoUrl || "",
          profileImageUrl: userWithProfilePhoto?.profileImageUrl || "",
        },
      },
    });
  }

  const token = generateToken({ id: user._id, role: user.role });
  const userWithProfilePhoto = await attachProfilePhoto(user);
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
        isActive: user.isActive,
        profilePhotoUrl: userWithProfilePhoto?.profilePhotoUrl || "",
        profileImageUrl: userWithProfilePhoto?.profileImageUrl || "",
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

  const userWithProfilePhoto = await attachProfilePhoto(user);
  return res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: userWithProfilePhoto,
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
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const userWithProfilePhoto = await attachProfilePhoto(user);
  res.json({ success: true, data: userWithProfilePhoto });
};

module.exports = {
  register: catchAsync(register),
  login: catchAsync(login),
  forgotPassword: catchAsync(forgotPassword),
  resetPassword: catchAsync(resetPassword),
  me: catchAsync(me),
};
