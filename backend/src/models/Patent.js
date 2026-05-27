const mongoose = require("mongoose");
const approvalFields = require("./approvalFields");

const patentSchema = new mongoose.Schema(
  {
    patentTitle: { type: String, required: true, trim: true },
    applicationNumber: { type: String, required: true, trim: true },
    inventors: [{ type: String, trim: true }],
    status: { type: String, enum: ["Filed", "Published", "Granted"], default: "Filed" },
    filingDate: Date,
    grantDate: Date,
    certificateUrl: String,
    ...approvalFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patent", patentSchema);
