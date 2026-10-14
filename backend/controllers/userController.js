const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// POST /api/users/register
// Register a new user with hashed password, safe RBAC defaults, and try-catch error handling
exports.registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, adminSecret } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Enforce Experiment 6 RBAC Security:
    // Ordinary public registrations ALWAYS receive the safe default role: 'user'.
    // Elevated 'admin' role is restricted to verified administrative creation (adminSecret or seed).
    let assignedRole = 'user';
    if (
      role === 'admin' &&
      adminSecret &&
      adminSecret === (process.env.ADMIN_SECRET || 'cyberaudit_admin_secret_2026')
    ) {
      assignedRole = 'admin';
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: assignedRole,
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

// POST /api/users/login
// Authenticate user, compare bcrypt password hash, and return signed JWT with identity info
exports.loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    // JWT payload contains ONLY necessary identity info (id, role) - never passwords
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'cyberaudit360_super_secret_jwt_key_2026',
      {
        expiresIn: '1h',
      }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

// GET /api/users/profile
// Protected route: Return authenticated user profile without password using try-catch
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};

// GET /api/users/admin
// Protected & Authorized route: Admin-only privileged endpoint using try-catch
exports.getAdminDashboard = async (req, res) => {
  try {
    res.json({
      message: 'Admin authorization verified. Access granted to privileged security audit data.',
      user: {
        id: req.user.id,
        role: req.user.role,
      },
      systemStatus: {
        accessLevel: 'ADMINISTRATOR',
        auditEngine: 'ACTIVE',
        threatMitigation: 'OPERATIONAL',
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message,
    });
  }
};
