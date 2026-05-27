const Notification = require("../models/Notification");
const User = require("../models/User");

const createNotification = async ({ recipient, title, message, type, entityType, entityId }) => {
  if (!recipient) return null;
  return Notification.create({ recipient, title, message, type, entityType, entityId });
};

const createRoleNotifications = async ({
  roles = [],
  title,
  message,
  type = "system",
  entityType,
  entityId,
  excludeUserId,
}) => {
  if (!roles.length) return [];

  const query = { role: { $in: roles }, isActive: true };
  if (excludeUserId) query._id = { $ne: excludeUserId };

  const users = await User.find(query).select("_id");
  if (!users.length) return [];

  const payload = users.map((user) => ({
    recipient: user._id,
    title,
    message,
    type,
    entityType,
    entityId,
  }));

  return Notification.insertMany(payload);
};

module.exports = { createNotification, createRoleNotifications };
