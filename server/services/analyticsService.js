const Analytics = require('../models/Analytics');
const Project = require('../models/Project');
const Review = require('../models/Review');
const InterviewQuestion = require('../models/InterviewQuestion');

/**
 * Track an analytics event for a user
 * @param {string} userId - The user's ObjectId
 * @param {string} type - Event type (project, review, interview, bug, documentation, login)
 * @param {Object} metadata - Optional metadata for the event
 * @returns {Promise<Object>} The created analytics entry
 */
const trackEvent = async (userId, type, metadata = {}) => {
  const entry = await Analytics.create({
    user: userId,
    type,
    date: new Date(),
    metadata,
  });
  return entry;
};

/**
 * Get aggregated analytics data for a user over the last 12 months
 * Returns monthly breakdowns suitable for chart rendering
 * @param {string} userId - The user's ObjectId
 * @returns {Promise<Object>} Monthly data array and totals
 */
const getUserAnalytics = async (userId) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const events = await Analytics.find({
    user: userId,
    date: { $gte: twelveMonthsAgo },
  }).sort('date');

  // Build a map of month -> type counts
  const monthMap = {};
  const totals = {
    projects: 0,
    reviews: 0,
    interviews: 0,
    bugs: 0,
    documentation: 0,
  };

  // Pre-populate the last 12 months
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
    monthMap[key] = {
      month: key,
      projects: 0,
      reviews: 0,
      interviews: 0,
      bugs: 0,
      documentation: 0,
    };
  }

  // Aggregate events into month buckets
  for (const event of events) {
    const eventDate = new Date(event.date);
    const key = eventDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

    if (!monthMap[key]) continue;

    const typeMap = {
      project: 'projects',
      review: 'reviews',
      interview: 'interviews',
      bug: 'bugs',
      documentation: 'documentation',
    };

    const field = typeMap[event.type];
    if (field) {
      monthMap[key][field]++;
      totals[field]++;
    }
  }

  const monthlyData = Object.values(monthMap);

  return { monthlyData, totals };
};

/**
 * Get summary statistics for a user by counting actual collection documents
 * @param {string} userId - The user's ObjectId
 * @returns {Promise<Object>} Counts of projects, reviews, interviews, and docs
 */
const getSummaryStats = async (userId) => {
  const [totalProjects, totalReviews, totalInterviews, totalDocs] = await Promise.all([
    Project.countDocuments({ user: userId }),
    Review.countDocuments({ user: userId }),
    InterviewQuestion.countDocuments({ user: userId }),
    Analytics.countDocuments({ user: userId, type: 'documentation' }),
  ]);

  return {
    totalProjects,
    totalReviews,
    totalInterviews,
    totalDocs,
  };
};

module.exports = {
  trackEvent,
  getUserAnalytics,
  getSummaryStats,
};
