const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [200, 'Project name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    techStack: {
      type: [String],
      default: [],
    },
    githubUrl: {
      type: String,
      trim: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'private',
    },
    tags: {
      type: [String],
      default: [],
    },
    zipFile: {
      type: String,
    },
    sourceCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', ProjectSchema);
