const { validationResult } = require('express-validator');
const Note = require('../models/Note');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * @desc    Get all notes for the authenticated user
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = { user: req.user.id };

    // Filter by type if provided
    if (type) {
      query.type = type;
    }

    // Search by title or content using regex
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [{ title: regex }, { content: regex }];
    }

    // Sort: pinned first, then by newest
    const notes = await Note.find(query).sort('-isPinned -createdAt');

    return sendSuccess(res, notes, 'Notes fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const note = await Note.create({
      ...req.body,
      user: req.user.id,
    });

    return sendSuccess(res, note, 'Note created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    let note = await Note.findById(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    // Verify ownership
    if (note.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to update this note', 403);
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, note, 'Note updated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete a note
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return sendError(res, 'Note not found', 404);
    }

    // Verify ownership
    if (note.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this note', 403);
    }

    await Note.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Note deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};
