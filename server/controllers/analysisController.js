const { validationResult } = require('express-validator');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

/**
 * @desc    Analyze code complexity (time/space, nested loops, recursion, duplicates)
 * @route   POST /api/analysis/complexity
 * @access  Private
 */
const analyzeComplexity = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return sendError(res, 'Code is required for analysis', 400);
    }

    const results = await aiService.analyzeComplexity(code, language || 'javascript');

    return sendSuccess(res, results, 'Complexity analysis complete');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Detect bugs and potential issues in code
 * @route   POST /api/analysis/bugs
 * @access  Private
 */
const detectBugs = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code) {
      return sendError(res, 'Code is required for bug detection', 400);
    }

    const results = await aiService.detectBugs(code, language || 'javascript');

    // Track analytics for bug detection
    await analyticsService.trackEvent(req.user.id, 'bug', { totalBugs: results.totalBugs });

    return sendSuccess(res, results, 'Bug detection complete');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  analyzeComplexity,
  detectBugs,
};
