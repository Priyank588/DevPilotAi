const { body } = require('express-validator');

/**
 * Validation chain for note creation
 */
const createNoteValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['note', 'todo', 'bookmark', 'learning'])
    .withMessage('Type must be one of: note, todo, bookmark, learning'),
  body('content')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  body('todoItems')
    .optional()
    .isArray()
    .withMessage('todoItems must be an array'),
  body('bookmarkUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Bookmark URL must be a valid URL'),
];

/**
 * Validation chain for note update
 */
const updateNoteValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('type')
    .optional()
    .isIn(['note', 'todo', 'bookmark', 'learning'])
    .withMessage('Type must be one of: note, todo, bookmark, learning'),
  body('content')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  body('todoItems')
    .optional()
    .isArray()
    .withMessage('todoItems must be an array'),
  body('bookmarkUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Bookmark URL must be a valid URL'),
];

module.exports = {
  createNoteValidator,
  updateNoteValidator,
};
