const AuditLog = require("../models/AuditLog");

const createAuditLog = async (req, payload = {}) => {
  try {
    return await AuditLog.create({
      actor: req?.user?._id,
      actorEmail: req?.user?.email,
      actorRole: req?.user?.role,
      ipAddress: req?.ip,
      userAgent: req?.headers?.["user-agent"],
      ...payload,
    });
  } catch (_error) {
    return null;
  }
};

module.exports = { createAuditLog };
