const jwt = require('jsonwebtoken');

// Authentication middleware - verifies JWT token from Authorization header using try-catch
const protect = (req, res, next) => {
  try {
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

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cyberaudit360_super_secret_jwt_key_2026'
    );

    // Attach verified identity information to req.user (never trust client-supplied role)
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
    });
  }
};

// Authorization middleware - enforces Role-Based Access Control (RBAC) using try-catch
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
          message: 'Access forbidden. Insufficient permissions.',
        });
      }
      next();
    } catch (error) {
      return res.status(403).json({
        message: 'Access forbidden. Authorization error.',
      });
    }
  };
};

module.exports = protect;
module.exports.protect = protect;
module.exports.authorizeRoles = authorizeRoles;
