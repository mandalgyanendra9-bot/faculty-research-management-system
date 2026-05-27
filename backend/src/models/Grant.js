const mongoose = require("mongoose");
const approvalFields = require("./approvalFields");

const grantSchema = new mongoose.Schema(
  {
    grantProposal: { type: String, required: true, trim: true },
    agencyName: { type: String, required: true, trim: true },
    amountRequested: { type: Number, required: true },
    amountApproved: { type: Number, default: 0 },
    utilizationReport: { type: String, trim: true },
    statusTracking: { type: String, trim: true },
    documentUrl: String,
    ...approvalFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grant", grantSchema);
