const Organization = require('../models/Organization');
const User = require('../models/User');

// @desc    Get organization details
// @route   GET /api/organizations/me
// @access  Private
const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json(org);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update organization details
// @route   PUT /api/organizations/me
// @access  Private (Owner, Admin)
const updateOrganization = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Please provide an organization name' });
    }

    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    org.name = name;
    const updatedOrg = await org.save();

    res.json(updatedOrg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get organization members
// @route   GET /api/organizations/me/members
// @access  Private
const getMembers = async (req, res) => {
  try {
    const members = await User.find({ orgId: req.user.orgId }).select('-password');
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new member to the organization
// @route   POST /api/organizations/me/members
// @access  Private (Owner, Admin)
const addMember = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password, and role' });
    }

    // Validate role
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Role must be 'admin' or 'member'" });
    }

    // Role hierarchy enforcement
    // Admins can only create 'member' role users
    if (req.user.role === 'admin' && role !== 'member') {
      return res.status(403).json({
        message: 'Access denied: Admins can only add users with the member role'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the member user under current tenant orgId
    const user = await User.create({
      email,
      password,
      role,
      orgId: req.user.orgId
    });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a member's role
// @route   PUT /api/organizations/me/members/:userId
// @access  Private (Owner only)
const updateMemberRole = async (req, res) => {
  const { role } = req.body;
  const { userId } = req.params;

  try {
    if (!role) {
      return res.status(400).json({ message: 'Please provide a role' });
    }

    if (!['owner', 'admin', 'member'].includes(role)) {
      return res.status(400).json({ message: "Invalid role. Role must be 'owner', 'admin', or 'member'" });
    }

    // Prevent user from updating their own role
    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    // Find user belonging to the same organization to enforce tenant isolation
    const user = await User.findOne({ _id: userId, orgId: req.user.orgId });
    if (!user) {
      return res.status(404).json({ message: 'Member not found in this organization' });
    }

    user.role = role;
    await user.save();

    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove a member from the organization
// @route   DELETE /api/organizations/me/members/:userId
// @access  Private (Owner, Admin)
const removeMember = async (req, res) => {
  const { userId } = req.params;

  try {
    // Prevent user from removing themselves
    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({ message: 'You cannot remove yourself from the organization' });
    }

    // Find the user and ensure they belong to the same organization
    const user = await User.findOne({ _id: userId, orgId: req.user.orgId });

    if (!user) {
      return res.status(404).json({ message: 'Member not found in this organization' });
    }

    // Role hierarchy enforcement
    // Admin cannot delete Owner or another Admin
    if (req.user.role === 'admin' && user.role !== 'member') {
      return res.status(403).json({
        message: 'Access denied: Admins can only remove users with the member role'
      });
    }

    // Remove user
    await User.deleteOne({ _id: userId });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrganization,
  updateOrganization,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember
};
