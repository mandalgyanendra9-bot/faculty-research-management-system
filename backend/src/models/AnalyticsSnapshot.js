const mongoose = require("mongoose");

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["citation", "trend"], required: true },
    payload: { type: Object, default: {} },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ type: 1, generatedAt: -1 });

module.exports = mongoose.model("AnalyticsSnapshot", analyticsSnapshotSchema);
