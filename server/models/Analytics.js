const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    type: {
      type: String,
      enum: [
        'project',
        'review',
        'interview',
        'bug',
        'documentation',
        'login',
      ],
      required: [true, 'Analytics type is required'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

AnalyticsSchema.index({ user: 1, type: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
