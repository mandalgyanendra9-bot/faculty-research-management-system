const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    actorEmail: { type: String, trim: true },
    actorRole: { type: String, trim: true },
    action: { type: String, required: true, trim: true },
    module: { type: String, required: true, trim: true },
    targetType: { type: String, trim: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    details: { type: Object, default: {} },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
  },
  { timestamps: true }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ module: 1, action: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
