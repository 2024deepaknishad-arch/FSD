const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    resource: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Success", "Failed"],
      required: true
    },
    ipAddress: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
