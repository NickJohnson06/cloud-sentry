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
const {
  createApiKey,
  listApiKeys,
  revokeApiKey
} = require('../controllers/apiKeyController');

// Organization detail routes
router.route('/me')
  .get(protect, getOrganization)
  .put(protect, authorize('owner', 'admin'), updateOrganization);

// Organization API Key management routes
router.route('/me/keys')
  .get(protect, authorize('owner', 'admin'), listApiKeys)
  .post(protect, authorize('owner', 'admin'), createApiKey);

router.route('/me/keys/:keyId')
  .delete(protect, authorize('owner', 'admin'), revokeApiKey);

// Organization members routes
router.route('/me/members')
  .get(protect, getMembers)
  .post(protect, authorize('owner', 'admin'), addMember);

router.route('/me/members/:userId')
  .put(protect, authorize('owner'), updateMemberRole)
  .delete(protect, authorize('owner', 'admin'), removeMember);

module.exports = router;
