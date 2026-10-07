const express = require("express");
const router = express.Router();

const AuditLog = require("../models/AuditLog");

// 1. CREATE AUDIT LOG
router.post("/", async (req, res) => {
  try {
    const log = await AuditLog.create(req.body);

    res.status(201).json(log);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// 2. GET ALL AUDIT LOGS
router.get("/", async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// 3. GET AUDIT LOG BY ID
router.get("/:id", async (req, res) => {
  try {
    const log = await AuditLog.findById(req.params.id);

    if (!log) {
      return res.status(404).json({
        message: "Audit log not found"
      });
    }

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// 4. UPDATE AUDIT LOG
router.put("/:id", async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!log) {
      return res.status(404).json({
        message: "Audit log not found"
      });
    }

    res.status(200).json(log);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// 5. DELETE AUDIT LOG
router.delete("/:id", async (req, res) => {
  try {
    const log = await AuditLog.findByIdAndDelete(req.params.id);

    if (!log) {
      return res.status(404).json({
        message: "Audit log not found"
      });
    }

    res.status(200).json({
      message: "Audit log deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;
