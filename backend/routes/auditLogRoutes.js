const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

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

// CREATE an audit event. Preserves Experiment 4 CRUD; integrates with optional Experiment 5 JWT
router.post('/', async (req, res) => {
  try {
    const logData = { ...req.body };
    const authUser = getAuthenticatedUser(req);
    if (!logData.user && authUser) {
      logData.user = authUser.id;
    }
    const auditLog = await AuditLog.create(logData);
    res.status(201).json(auditLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ all audit events, newest first.
router.get('/', async (_req, res) => {
  try {
    const auditLogs = await AuditLog.find().sort({ createdAt: -1 });
    res.json(auditLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ one audit event.
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid audit log ID' });
  }

  try {
    const auditLog = await AuditLog.findById(req.params.id);
    if (!auditLog) return res.status(404).json({ message: 'Audit log not found' });
    res.json(auditLog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE one audit event. Included for the Experiment 4 CRUD practical.
router.put('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid audit log ID' });
  }

  try {
    const auditLog = await AuditLog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!auditLog) return res.status(404).json({ message: 'Audit log not found' });
    res.json(auditLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE one audit event. This is required by the practical; restrict it in production.
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid audit log ID' });
  }

  try {
    const auditLog = await AuditLog.findByIdAndDelete(req.params.id);
    if (!auditLog) return res.status(404).json({ message: 'Audit log not found' });
    res.json({ message: 'Audit log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
