const { validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

/**
 * @desc    Generate documentation for code
 * @route   POST /api/docs/generate
 * @access  Private
 */
const generateDocs = async (req, res) => {
  try {
    const { code, projectName, language } = req.body;

    if (!code) {
      return sendError(res, 'Code is required for documentation generation', 400);
    }

    const docs = await aiService.generateDocumentation(
      code,
      projectName || 'Project',
      language || 'javascript'
    );


    // Track analytics
    await analyticsService.trackEvent(req.user.id, 'documentation', { projectName });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'documentation',
      title: 'Documentation Generated',
      message: `Documentation for "${projectName || 'Project'}" has been generated successfully.`,
    });

    return sendSuccess(res, docs, 'Documentation generated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  generateDocs,
};
