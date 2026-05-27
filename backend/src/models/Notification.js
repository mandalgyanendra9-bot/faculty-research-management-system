const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["approval", "status_update", "deadline", "missing_document", "system"],
      default: "system",
    },
    isRead: { type: Boolean, default: false },
    entityType: { type: String },
    entityId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
