const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an organization name'],
    trim: true,
  },
  plan: {
    type: String,
    enum: ['Free', 'Pro', 'Enterprise'],
    default: 'Free',
  },
  stripeCustomerId: {
    type: String,
  },
  apiKeys: [{
    keyHash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    }
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Organization', organizationSchema);
