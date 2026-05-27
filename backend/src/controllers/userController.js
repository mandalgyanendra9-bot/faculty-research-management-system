const User = require("../models/User");
const Department = require("../models/Department");
const Lookup = require("../models/Lookup");
const catchAsync = require("../utils/catchAsync");

const listUsers = async (req, res) => {
  const { role, department, active, search = "" } = req.query;
  const query = {};

  if (role) query.role = role;
  if (department) query.department = department;
  if (active !== undefined) query.isActive = active === "true";
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query)
    .populate("department", "name code")
    .select("-password")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: users });
};

const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("department", "name code")
    .select("-password");

  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  return res.json({ success: true, message: "User updated", data: user });
};

const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  user.isActive = !user.isActive;
  await user.save();
  return res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"}`, data: user });
};

const createDepartment = async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: dept });
};

const listDepartments = async (_req, res) => {
  const depts = await Department.find().populate("hod", "name email").sort({ name: 1 });
  res.json({ success: true, data: depts });
};

const updateDepartment = async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!dept) return res.status(404).json({ success: false, message: "Department not found" });
  return res.json({ success: true, data: dept });
};

const removeDepartment = async (req, res) => {
  const dept = await Department.findByIdAndDelete(req.params.id);
  if (!dept) return res.status(404).json({ success: false, message: "Department not found" });
  return res.json({ success: true, message: "Department deleted" });
};

const createLookup = async (req, res) => {
  const lookup = await Lookup.create(req.body);
  res.status(201).json({ success: true, data: lookup });
};

const listLookups = async (req, res) => {
  const query = req.query.type ? { type: req.query.type } : {};
  const items = await Lookup.find(query).sort({ value: 1 });
  res.json({ success: true, data: items });
};

const updateLookup = async (req, res) => {
  const item = await Lookup.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: "Lookup item not found" });
  return res.json({ success: true, data: item });
};

const deleteLookup = async (req, res) => {
  const item = await Lookup.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: "Lookup item not found" });
  return res.json({ success: true, message: "Lookup item deleted" });
};

module.exports = {
  listUsers: catchAsync(listUsers),
  updateUser: catchAsync(updateUser),
  toggleUserStatus: catchAsync(toggleUserStatus),
  createDepartment: catchAsync(createDepartment),
  listDepartments: catchAsync(listDepartments),
  updateDepartment: catchAsync(updateDepartment),
  removeDepartment: catchAsync(removeDepartment),
  createLookup: catchAsync(createLookup),
  listLookups: catchAsync(listLookups),
  updateLookup: catchAsync(updateLookup),
  deleteLookup: catchAsync(deleteLookup),
};
