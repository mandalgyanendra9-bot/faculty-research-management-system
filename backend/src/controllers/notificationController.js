const Notification = require("../models/Notification");
const catchAsync = require("../utils/catchAsync");

const listMyNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
};

const markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
  return res.json({ success: true, data: notification });
};

const markAllRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  res.json({ success: true, message: "All notifications marked as read" });
};

module.exports = {
  listMyNotifications: catchAsync(listMyNotifications),
  markAsRead: catchAsync(markAsRead),
  markAllRead: catchAsync(markAllRead),
};
