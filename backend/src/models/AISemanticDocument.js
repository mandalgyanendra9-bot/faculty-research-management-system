const mongoose = require("mongoose");

const aiSemanticDocumentSchema = new mongoose.Schema(
  {
    sourceType: {
      type: String,
      enum: ["publication", "project", "patent", "grant", "event", "paper"],
      required: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    keywords: [{ type: String, trim: true }],
    embedding: [{ type: Number }],
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AISemanticDocument", aiSemanticDocumentSchema);
