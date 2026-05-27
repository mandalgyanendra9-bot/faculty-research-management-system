const mongoose = require("mongoose");
const approvalFields = require("./approvalFields");

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, enum: ["Conference", "Seminar", "FDP", "Workshop"], required: true },
    participationType: { type: String, enum: ["Organized", "Attended"], required: true },
    role: { type: String, enum: ["Participant", "Speaker", "Organizer"], required: true },
    date: { type: Date, required: true },
    certificateUrl: String,
    ...approvalFields,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
