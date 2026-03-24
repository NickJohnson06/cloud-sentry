const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new Organization and Owner User
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { orgName, email, password } = req.body;

  try {
    if (!orgName || !email || !password) {
      return res.status(400).json({ message: 'Please provide organization name, email, and password' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create the organization
    const organization = await Organization.create({
      name: orgName,
    });

    // Create the owner user
    const user = await User.create({
      email,
      password,
      role: 'owner',
      orgId: organization._id,
    });

    if (user && organization) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate User and get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        orgId: user.orgId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
};
