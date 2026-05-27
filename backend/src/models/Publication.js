const mongoose = require("mongoose");
const approvalFields = require("./approvalFields");

const publicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["journal", "conference", "book", "book_chapter", "article"],
      required: true,
    },
    authors: [{ type: String, trim: true }],
    journalOrConferenceName: { type: String, required: true, trim: true },
    doi: { type: String, trim: true },
    issnIsbn: { type: String, trim: true },
    publicationYear: { type: Number, required: true },
    volumeIssuePage: { type: String, trim: true },
    indexingType: {
      type: String,
      enum: ["Scopus", "SCI", "UGC Care", "IEEE", "Web of Science", "Other"],
      default: "Other",
    },
    impactFactor: { type: Number, default: 0 },
    citationCount: { type: Number, default: 0 },
    documentUrl: String,
    score: { type: Number, default: 0 },
    plagiarismSimilarity: { type: Number, default: 0 },
    plagiarismFlagged: { type: Boolean, default: false },
    aiKeywords: [{ type: String, trim: true }],
    aiContributionSummary: { type: String, trim: true },
    ...approvalFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Publication", publicationSchema);
