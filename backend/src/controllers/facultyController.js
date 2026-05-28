const FacultyProfile = require("../models/FacultyProfile");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const { resolveUploadUrl } = require("../services/fileStorageService");

const upsertMyProfile = async (req, res) => {
  const payload = { ...req.body };
  if (typeof payload.areaOfExpertise === "string") {
    payload.areaOfExpertise = payload.areaOfExpertise
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (typeof payload.researchInterests === "string") {
    payload.researchInterests = payload.researchInterests
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (req.file) {
    const uploaded = await resolveUploadUrl(req.file, {
      folder: "frms/faculty-profile",
      resourceType: "image",
    });
    payload.profilePhotoUrl = uploaded?.url;
  }

  const profile = await FacultyProfile.findOneAndUpdate(
    { user: req.user._id },
    { $set: payload },
    { new: true, upsert: true, runValidators: true }
  ).populate({ path: "user", select: "name email department designation", populate: { path: "department", select: "name code" } });

  return res.json({ success: true, message: "Profile updated", data: profile });
};

const getMyProfile = async (req, res) => {
  const profile = await FacultyProfile.findOne({ user: req.user._id }).populate({
    path: "user",
    select: "name email role department designation",
    populate: { path: "department", select: "name code" },
  });

  if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
  return res.json({ success: true, data: profile });
};

const getFacultyProfiles = async (req, res) => {
  const { department } = req.query;
  const userQuery = { role: "faculty" };
  if (department) userQuery.department = department;

  const users = await User.find(userQuery).select("_id");
  const ids = users.map((u) => u._id);

  const profiles = await FacultyProfile.find({ user: { $in: ids } }).populate({
    path: "user",
    select: "name email department designation isActive",
    populate: { path: "department", select: "name code" },
  });

  res.json({ success: true, data: profiles });
};

const getFacultyProfileById = async (req, res) => {
  const profile = await FacultyProfile.findOne({ user: req.params.userId }).populate({
    path: "user",
    select: "name email role department designation",
    populate: { path: "department", select: "name code" },
  });

  if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
  return res.json({ success: true, data: profile });
};

module.exports = {
  upsertMyProfile: catchAsync(upsertMyProfile),
  getMyProfile: catchAsync(getMyProfile),
  getFacultyProfiles: catchAsync(getFacultyProfiles),
  getFacultyProfileById: catchAsync(getFacultyProfileById),
};
