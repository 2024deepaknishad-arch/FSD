const jwt = require('jsonwebtoken');

// Authentication middleware - verifies JWT token from Authorization header
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Access denied. Token missing.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cyberaudit360_super_secret_jwt_key_2026'
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

// Authorization middleware - enforces Role-Based Access Control (RBAC)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access forbidden. Insufficient permissions.',
      });
    }
    next();
  };
};

module.exports = protect;
module.exports.protect = protect;
module.exports.authorizeRoles = authorizeRoles;
