const FacultyProfile = require("../models/FacultyProfile");
const User = require("../models/User");
const Publication = require("../models/Publication");
const ResearchProject = require("../models/ResearchProject");
const Patent = require("../models/Patent");
const catchAsync = require("../utils/catchAsync");
const { resolveUploadUrl } = require("../services/fileStorageService");

const profilePopulateOptions = {
  path: "user",
  select: "name email role department designation isActive",
  populate: { path: "department", select: "name code" },
};

const buildCounts = async (userId) => {
  const [publications, projects, patents] = await Promise.all([
    Publication.countDocuments({ submittedBy: userId }),
    ResearchProject.countDocuments({ submittedBy: userId }),
    Patent.countDocuments({ submittedBy: userId }),
  ]);

  return { publications, projects, patents };
};

const serializeFacultyProfile = (profileDoc, counts) => {
  if (!profileDoc) return null;

  const profile = profileDoc.toObject({ virtuals: true });
  const profilePhotoUrl = profile.profilePhotoUrl || profile.profileImageUrl || "";

  return {
    ...profile,
    profilePhotoUrl,
    profileImageUrl: profilePhotoUrl,
    counts,
  };
};

const buildFacultyProfilePayload = async (userId, { allowMissingProfile = false } = {}) => {
  const [profileDoc, userDoc, counts] = await Promise.all([
    FacultyProfile.findOne({ user: userId }).populate(profilePopulateOptions),
    User.findById(userId).populate("department", "name code"),
    buildCounts(userId),
  ]);

  if (!userDoc) return null;

  const user = userDoc.toObject();
  const baseProfile = {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      designation: user.designation,
      isActive: user.isActive,
      department: user.department,
    },
    employeeId: "",
    phone: "",
    qualification: "",
    areaOfExpertise: [],
    googleScholarId: "",
    orcidId: "",
    scopusId: "",
    researchInterests: [],
    profilePhotoUrl: "",
    profileImageUrl: "",
    bio: "",
    joinedAt: null,
    counts,
  };

  if (!profileDoc) {
    return allowMissingProfile ? baseProfile : null;
  }

  const serialized = serializeFacultyProfile(profileDoc, counts);
  return {
    ...baseProfile,
    ...serialized,
    user: baseProfile.user,
    counts,
  };
};

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
  const profile = await buildFacultyProfilePayload(req.user._id);

  if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
  return res.json({ success: true, data: profile });
};

const getFacultyProfiles = async (req, res) => {
  const { department } = req.query;
  const userQuery = { role: "faculty" };
  if (department) userQuery.department = department;

  const users = await User.find(userQuery).select("_id");
  const ids = users.map((u) => u._id);

  const profiles = await FacultyProfile.find({ user: { $in: ids } }).populate(profilePopulateOptions);

  res.json({ success: true, data: profiles });
};

const getFacultyProfileById = async (req, res) => {
  const profile = await buildFacultyProfilePayload(req.params.userId, { allowMissingProfile: true });
  if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
  return res.json({ success: true, data: profile });
};

module.exports = {
  upsertMyProfile: catchAsync(upsertMyProfile),
  getMyProfile: catchAsync(getMyProfile),
  getFacultyProfiles: catchAsync(getFacultyProfiles),
  getFacultyProfileById: catchAsync(getFacultyProfileById),
};
