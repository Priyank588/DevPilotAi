const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
    },
    type: {
      type: String,
      enum: ['note', 'todo', 'bookmark', 'learning'],
      default: 'note',
    },
    tags: {
      type: [String],
      default: [],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    todoItems: [
      {
        text: { type: String },
        completed: { type: Boolean, default: false },
      },
    ],
    bookmarkUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

NoteSchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('Note', NoteSchema);
