const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/rbacMiddleware');
const {
  getOrganization,
  updateOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember
} = require('../controllers/orgController');

// Organization detail routes
router.route('/me')
  .get(protect, getOrganization)
  .put(protect, authorize('owner', 'admin'), updateOrganization);

// Organization members routes
router.route('/me/members')
  .get(protect, getMembers)
  .post(protect, authorize('owner', 'admin'), addMember);

router.route('/me/members/:userId')
  .put(protect, authorize('owner'), updateMemberRole)
  .delete(protect, authorize('owner', 'admin'), removeMember);

module.exports = router;
