const Event = require('../models/Event');

const MAX_BATCH_SIZE = 100;

// @desc    Ingest single or batch events
// @route   POST /api/events
// @access  Private (API Key Authenticated)
const ingestEvents = async (req, res) => {
  const payload = req.body;

  try {
    // 1. Check if payload is empty or malformed
    if (!payload || (typeof payload !== 'object')) {
      return res.status(400).json({
        message: 'Invalid payload format. Expected a single event object or an array of event objects.'
      });
    }

    // 2. Handle batch event ingestion (JSON array)
    if (Array.isArray(payload)) {
      if (payload.length === 0) {
        return res.status(400).json({
          message: 'Request payload must contain at least one event.'
        });
      }

      if (payload.length > MAX_BATCH_SIZE) {
        return res.status(400).json({
          message: `Batch size exceeds the maximum limit of ${MAX_BATCH_SIZE} events per request.`
        });
      }

      const formattedEvents = [];

      // Validate each event in the batch
      for (let i = 0; i < payload.length; i++) {
        const item = payload[i];

        if (!item || typeof item !== 'object' || Array.isArray(item)) {
          return res.status(400).json({
            message: `Validation failed: Event at index ${i} must be a valid JSON object.`
          });
        }

        if (!item.name || typeof item.name !== 'string' || !item.name.trim()) {
          return res.status(400).json({
            message: `Validation failed: Event at index ${i} is missing a valid 'name' field.`
          });
        }

        // Format and isolate strictly under current API key's organization
        formattedEvents.push({
          orgId: req.org._id,
          name: item.name.trim(),
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
          properties: item.properties || {}
        });
      }

      // Optimize ingestion via high-performance bulk database insert
      const docs = await Event.insertMany(formattedEvents);

      return res.status(201).json({
        success: true,
        count: docs.length,
        message: `Successfully ingested ${docs.length} events.`
      });
    }

    // 3. Handle single event ingestion (JSON object)
    if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
      return res.status(400).json({
        message: "Validation failed: Event name is required and must be a non-empty string."
      });
    }

    const singleEvent = {
      orgId: req.org._id,
      name: payload.name.trim(),
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
      properties: payload.properties || {}
    };

    await Event.create(singleEvent);

    return res.status(201).json({
      success: true,
      count: 1,
      message: 'Successfully ingested event.'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  ingestEvents
};
