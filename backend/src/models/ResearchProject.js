const mongoose = require("mongoose");
const approvalFields = require("./approvalFields");

const researchProjectSchema = new mongoose.Schema(
  {
    projectTitle: { type: String, required: true, trim: true },
    fundingAgency: { type: String, required: true, trim: true },
    principalInvestigator: { type: String, required: true, trim: true },
    coInvestigators: [{ type: String, trim: true }],
    amountSanctioned: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ["Proposed", "Ongoing", "Completed"], default: "Proposed" },
    progressReport: { type: String, trim: true },
    documentUrl: String,
    ...approvalFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResearchProject", researchProjectSchema);
