/**
 * Role Middleware
 * Authorization based on user roles
 */

const { ROLES } = require('../constants/roles');

/**
 * Check if user has required role(s)
 * @param {...string} allowed - Allowed roles
 * @returns {Function} Middleware function
 */
module.exports = (...allowed) => {
  const set = new Set(allowed);
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ message: "Forbidden: No role found" });
    if (!set.size || set.has(role)) return next();
    return res.status(403).json({ message: "Insufficient role permissions" });
  };
};

/**
 * Admin only middleware
 */
module.exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }

  next();
};

/**
 * Customer only middleware
 */
module.exports.isCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.user.role !== ROLES.CUSTOMER) {
    return res.status(403).json({ message: 'Access denied. Customer only.' });
  }

  next();
};

/**
 * Admin or Owner middleware (user can access their own resources)
 */
module.exports.isAdminOrOwner = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin can access everything
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    // Check if user is the owner
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (parseInt(resourceUserId) === req.user.id) {
      return next();
    }

    return res.status(403).json({ message: 'Access denied. Not authorized to access this resource.' });
  };
};
