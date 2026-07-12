const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    code: {
      type: String,
      required: [true, 'Code is required for review'],
    },
    language: {
      type: String,
      default: 'javascript',
    },
    codeQuality: {
      type: Number,
      min: 0,
      max: 100,
    },
    readability: {
      type: Number,
      min: 0,
      max: 100,
    },
    maintainability: {
      type: Number,
      min: 0,
      max: 100,
    },
    bestPractices: [
      {
        title: { type: String },
        description: { type: String },
        severity: {
          type: String,
          enum: ['info', 'warning', 'error'],
        },
      },
    ],
    namingSuggestions: [
      {
        current: { type: String },
        suggested: { type: String },
        reason: { type: String },
      },
    ],
    optimizationSuggestions: [
      {
        title: { type: String },
        description: { type: String },
        impact: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
      },
    ],
    refactoringSuggestions: [
      {
        title: { type: String },
        description: { type: String },
        codeSnippet: { type: String },
      },
    ],
    securitySuggestions: [
      {
        title: { type: String },
        description: { type: String },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high', 'critical'],
        },
      },
    ],
    overallRating: {
      type: Number,
      min: 0,
      max: 100,
    },
    summary: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Review', ReviewSchema);
