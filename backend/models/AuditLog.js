const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    resource: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Success', 'Failed'],
      required: true,
    },
    ipAddress: {
      type: String,
      default: 'Unknown',
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
