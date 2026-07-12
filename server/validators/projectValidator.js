const { body } = require('express-validator');

/**
 * Validation chain for project creation
 */
const createProjectValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required')
    .isLength({ max: 200 })
    .withMessage('Project name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('githubUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

/**
 * Validation chain for project update
 */
const updateProjectValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Project name cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  body('techStack')
    .optional()
    .isArray()
    .withMessage('Tech stack must be an array'),
  body('githubUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('GitHub URL must be a valid URL'),
  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Visibility must be public or private'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
];

module.exports = {
  createProjectValidator,
  updateProjectValidator,
};
