const { AuthorizationError } = require('../utils/errors');

// Authorization middleware factory
const authorize = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    if (!req.user.role) {
      return next(new AuthorizationError('User role not found'));
    }

    // Check if user has any of the required permissions
    const hasPermission =
      requiredPermissions.length === 0 ||
      requiredPermissions.some((permission) => req.user.role.permissions.includes(permission));

    if (!hasPermission) {
      return next(new AuthorizationError(`You don't have permission to perform this action. Required: ${requiredPermissions.join(', ')}`));
    }

    next();
  };
};

// Helper to check specific role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AuthorizationError('User not authenticated'));
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return next(new AuthorizationError(`Only ${allowedRoles.join(', ')} can perform this action`));
    }

    next();
  };
};

module.exports = {
  authorize,
  authorizeRole,
};
