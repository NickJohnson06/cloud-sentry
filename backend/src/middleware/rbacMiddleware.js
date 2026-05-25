/**
 * Role-Based Access Control (RBAC) & Tenant Isolation Middleware
 */

/**
 * Restrict access to specific roles.
 * Expects `req.user` to be populated by the `protect` middleware first.
 * @param {...string} roles - The roles allowed to access this route ('owner', 'admin', 'member')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied: role '${req.user.role}' is not authorized to access this resource`
      });
    }

    next();
  };
};

/**
 * Validates that the requested organization ID matches the user's organization ID.
 * Prevents cross-tenant access.
 */
const checkTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized, user not found' });
  }

  const requestedOrgId = req.params.orgId || req.body.orgId || req.query.orgId;

  if (requestedOrgId && req.user.orgId) {
    if (req.user.orgId.toString() !== requestedOrgId.toString()) {
      return res.status(403).json({
        message: 'Access denied: Cross-tenant data isolation violation'
      });
    }
  }

  next();
};

module.exports = {
  authorize,
  checkTenant,
};
