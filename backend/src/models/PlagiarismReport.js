const mongoose = require("mongoose");

const plagiarismReportSchema = new mongoose.Schema(
  {
    publication: { type: mongoose.Schema.Types.ObjectId, ref: "Publication", required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    similarityPercentage: { type: Number, required: true, min: 0, max: 100 },
    flagged: { type: Boolean, default: false },
    notes: { type: String, trim: true },
    reportUrl: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlagiarismReport", plagiarismReportSchema);
