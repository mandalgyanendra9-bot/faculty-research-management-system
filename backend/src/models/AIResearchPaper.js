const mongoose = require("mongoose");

const aiResearchPaperSchema = new mongoose.Schema(
  {
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, trim: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String, default: "" },
    abstractSummary: { type: String, default: "" },
    keyFindings: { type: String, default: "" },
    keywords: [{ type: String, trim: true }],
    contributionSummary: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIResearchPaper", aiResearchPaperSchema);
