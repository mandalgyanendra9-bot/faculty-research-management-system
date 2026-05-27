const mongoose = require("mongoose");

const approvalSchemaFields = {
  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
    index: true,
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rejectionReason: String,
  submittedAt: { type: Date, default: Date.now },
  verifiedAt: Date,
  approvedAt: Date,
};

module.exports = approvalSchemaFields;
