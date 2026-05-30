const crypto = require('crypto');
const Organization = require('../models/Organization');

// @desc    Generate a new API Key for the organization
// @route   POST /api/organizations/me/keys
// @access  Private (Owner, Admin)
const createApiKey = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Please provide a name for the API key' });
    }

    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // 1. Generate 32-byte cryptographically secure random token (64-char hex string)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const fullApiKey = `cs_live_${rawToken}`;

    // 2. Hash the key with SHA-256 for database storage
    const keyHash = crypto
      .createHash('sha256')
      .update(fullApiKey)
      .digest('hex');

    // 3. Add to organization's apiKeys array
    org.apiKeys.push({
      keyHash,
      name
    });

    await org.save();

    // 4. Find the newly created key document to get its ObjectId
    const newKey = org.apiKeys.find((key) => key.keyHash === keyHash);

    // 5. Return full API Key exactly once
    res.status(201).json({
      _id: newKey._id,
      name: newKey.name,
      apiKey: fullApiKey, // Only visible here
      createdAt: newKey.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List all API Key metadata for the organization
// @route   GET /api/organizations/me/keys
// @access  Private (Owner, Admin)
const listApiKeys = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Return key metadata, masking the secret key completely
    const keysMetadata = org.apiKeys.map((key) => ({
      _id: key._id,
      name: key.name,
      createdAt: key.createdAt
    }));

    res.json(keysMetadata);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Revoke (delete) an API Key
// @route   DELETE /api/organizations/me/keys/:keyId
// @access  Private (Owner, Admin)
const revokeApiKey = async (req, res) => {
  const { keyId } = req.params;

  try {
    const org = await Organization.findById(req.user.orgId);

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if key exists in this organization
    const keyIndex = org.apiKeys.findIndex((key) => key._id.toString() === keyId);

    if (keyIndex === -1) {
      return res.status(404).json({ message: 'API key not found' });
    }

    // Remove key from subdocument array
    org.apiKeys.splice(keyIndex, 1);
    await org.save();

    res.json({ message: 'API key revoked successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createApiKey,
  listApiKeys,
  revokeApiKey
};
