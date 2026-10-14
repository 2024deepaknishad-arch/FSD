const express = require('express');
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getProfile,
  getAdminDashboard,
} = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Public route: Register new user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must contain at least 6 characters'),
  ],
  registerUser
);

// Public route: User login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Enter valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginUser
);

// Protected route: User profile
router.get('/profile', protect, getProfile);

// Protected & Role-Authorized route: Admin only
router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);

module.exports = router;
