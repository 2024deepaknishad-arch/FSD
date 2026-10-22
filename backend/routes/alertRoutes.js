const express = require('express');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

// In-memory alert store matching CyberAudit 360 mock baseline
let alertsStore = [
  {
    id: 'ALT-1',
    risk: 'high',
    severity: 'high',
    type: 'Authentication Anomaly',
    title: 'Possible brute-force attack',
    meta: '10:51:19',
    timestamp: '10:51:19',
    detail: '5 failed login attempts on account "unknown" within 5 minutes.',
    message: '5 failed login attempts on account "unknown" within 5 minutes.',
    resolved: false,
  },
  {
    id: 'ALT-2',
    risk: 'medium',
    severity: 'medium',
    type: 'Access Window Anomaly',
    title: 'Unusual database access window',
    meta: '02:14:07',
    timestamp: '02:14:07',
    detail: 'Database accessed at 02:14 — outside the configured review window.',
    message: 'Database accessed at 02:14 — outside the configured review window.',
    resolved: false,
  },
  {
    id: 'ALT-3',
    risk: 'medium',
    severity: 'medium',
    type: 'Data Deletion Anomaly',
    title: 'Rapid mass deletion',
    meta: 'earlier today',
    timestamp: '09:30:12',
    detail: 'Rahul deleted 3 invoice records within 90 seconds.',
    message: 'Rahul deleted 3 invoice records within 90 seconds.',
    resolved: false,
  },
];

// Helper to inspect optional Bearer token
function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      return jwt.verify(
        token,
        process.env.JWT_SECRET || 'cyberaudit360_super_secret_jwt_key_2026'
      );
    } catch {
      return null;
    }
  }
  return null;
}

// GET /api/alerts - Read all alerts
router.get('/', (_req, res) => {
  res.json(alertsStore);
});

// POST /api/alerts/simulate - Controlled development/test security alert generation
// Emits 'securityAlert' over Socket.IO and persists an AuditLog entry in MongoDB Atlas
router.post('/simulate', async (req, res) => {
  try {
    const authUser = getAuthenticatedUser(req);
    const triggeredBy = authUser ? authUser.email || authUser.id : 'security-engine@cyberaudit.local';
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour12: false });

    const alertId = `ALT-${Date.now()}`;
    const severity = req.body.severity || req.body.risk || 'high';
    const type = req.body.type || 'Suspicious Activity';
    const title = req.body.title || 'Multiple Failed Login Attempts Detected';
    const message = req.body.message || req.body.detail || '5 rapid failed login attempts flagged by IDS sensor on cluster #3.';

    // Create persistent AuditLog entry in MongoDB Atlas (Preserving Experiment 4 & 5)
    let auditLogRecord = null;
    try {
      auditLogRecord = await AuditLog.create({
        user: triggeredBy,
        action: 'SECURITY_ALERT_TRIGGERED',
        resource: 'DATABASE_FIREWALL',
        status: 'Failed',
        ipAddress: req.ip || '192.168.1.105',
        details: `${title}: ${message}`,
      });
    } catch (dbErr) {
      console.warn('[AlertRoutes] Could not save audit log for alert:', dbErr.message);
    }

    const newAlert = {
      id: alertId,
      risk: severity,
      severity,
      type,
      title,
      meta: nowTime,
      timestamp: nowTime,
      detail: message,
      message,
      resolved: false,
      auditLogId: auditLogRecord?._id || null,
      triggeredBy,
    };

    alertsStore.unshift(newAlert);

    // Broadcast real-time security alert to all connected Socket.IO clients
    const io = req.app.get('io');
    if (io) {
      console.log(`[Socket.IO] Broadcasting securityAlert "${title}" (${severity}) to connected clients`);
      io.emit('securityAlert', newAlert);
    }

    res.status(201).json({
      message: 'Security alert successfully generated and broadcast via Socket.IO',
      alert: newAlert,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error generating security alert', error: error.message });
  }
});

// PATCH /api/alerts/:id/resolve - Mark an alert as resolved
router.patch('/:id/resolve', (req, res) => {
  const { id } = req.params;
  const alert = alertsStore.find((a) => String(a.id) === String(id));
  if (!alert) {
    return res.status(404).json({ message: 'Alert not found' });
  }

  alert.resolved = true;

  // Broadcast resolution to other tabs
  const io = req.app.get('io');
  if (io) {
    io.emit('alertResolved', { id: alert.id });
  }

  res.json({ message: 'Alert resolved', alert });
});

module.exports = router;
