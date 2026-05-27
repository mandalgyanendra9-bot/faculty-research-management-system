const mongoose = require("mongoose");

const lookupSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["designation", "research_category"], required: true },
    value: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

lookupSchema.index({ type: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("Lookup", lookupSchema);
