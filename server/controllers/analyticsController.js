const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');

/**
 * @desc    Get user analytics data (monthly breakdown for charts)
 * @route   GET /api/analytics
 * @access  Private
 */
const getAnalytics = async (req, res) => {
  try {
    const data = await analyticsService.getUserAnalytics(req.user.id);
    return sendSuccess(res, data, 'Analytics fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get summary statistics (total counts from collections)
 * @route   GET /api/analytics/summary
 * @access  Private
 */
const getSummary = async (req, res) => {
  try {
    const data = await analyticsService.getSummaryStats(req.user.id);
    return sendSuccess(res, data, 'Summary stats fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getAnalytics,
  getSummary,
};
