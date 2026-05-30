const express = require('express');
const router = express.Router();
const { authenticateApiKey } = require('../middleware/apiKeyMiddleware');
const { ingestEvents } = require('../controllers/eventController');

// Ingest events endpoint (API key protected)
router.post('/', authenticateApiKey, ingestEvents);

module.exports = router;
