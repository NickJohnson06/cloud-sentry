const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add an event name'],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  properties: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

// High-performance time-series and tenant boundary indexing
eventSchema.index({ orgId: 1 });
eventSchema.index({ timestamp: -1 });
eventSchema.index({ orgId: 1, timestamp: -1 }); // Optimized compound query index

module.exports = mongoose.model('Event', eventSchema);
