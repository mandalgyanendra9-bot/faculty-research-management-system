const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["faculty_wise", "department_wise", "year_wise", "naac", "nba", "nirf", "api_score", "faculty_api_score"],
      required: true,
    },
    format: { type: String, enum: ["pdf", "excel"], required: true },
    filters: { type: Object, default: {} },
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
