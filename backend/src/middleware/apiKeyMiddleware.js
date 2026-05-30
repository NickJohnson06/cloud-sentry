const crypto = require('crypto');
const Organization = require('../models/Organization');

/**
 * Authentication Middleware using API Keys for high-throughput event ingestion.
 * Looks for API key in x-api-key header or Authorization Bearer header.
 * Hashes the incoming key using SHA-256 and finds the corresponding Organization.
 */
const authenticateApiKey = async (req, res, next) => {
  let apiKey;

  // 1. Extract API key from headers
  if (req.headers['x-api-key']) {
    apiKey = req.headers['x-api-key'];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    apiKey = req.headers.authorization.split(' ')[1];
  }

  // 2. Return 401 if no API key is provided
  if (!apiKey) {
    return res.status(401).json({
      message: 'Unauthorized: API key is missing. Please provide a valid key in x-api-key or Authorization Bearer headers.'
    });
  }

  try {
    // 3. Hash the API key using SHA-256
    const hashedKey = crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');

    // 4. Look up the organization by hashed API key
    const org = await Organization.findOne({ 'apiKeys.keyHash': hashedKey });

    if (!org) {
      return res.status(401).json({
        message: 'Unauthorized: Invalid API key.'
      });
    }

    // 5. Attach the authenticated organization to request
    req.org = org;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  authenticateApiKey
};
