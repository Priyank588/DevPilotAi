const { validationResult } = require('express-validator');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

/**
 * @desc    Create a code review using AI analysis
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const { code, language, project } = req.body;

    if (!code) {
      return sendError(res, 'Code is required for review', 400);
    }

    // Analyze code with AI service
    const analysisResults = await aiService.analyzeCode(code, language || 'javascript');


    // Create review document with analysis results
    const review = await Review.create({
      user: req.user.id,
      project: project || undefined,
      code,
      language: language || 'javascript',
      codeQuality: analysisResults.codeQuality,
      readability: analysisResults.readability,
      maintainability: analysisResults.maintainability,
      bestPractices: analysisResults.bestPractices,
      namingSuggestions: analysisResults.namingSuggestions,
      optimizationSuggestions: analysisResults.optimizationSuggestions,
      refactoringSuggestions: analysisResults.refactoringSuggestions,
      securitySuggestions: analysisResults.securitySuggestions,
      overallRating: analysisResults.overallRating,
      summary: analysisResults.summary,
    });

    // Track analytics
    await analyticsService.trackEvent(req.user.id, 'review', { reviewId: review._id });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'review',
      title: 'Code Review Complete',
      message: `Your ${language || 'javascript'} code review is ready. Overall rating: ${analysisResults.overallRating}/100.`,
      link: `/reviews/${review._id}`,
    });

    return sendSuccess(res, review, 'Code review created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get all reviews for the authenticated user
 * @route   GET /api/reviews
 * @access  Private
 */
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id }).sort('-createdAt');
    return sendSuccess(res, reviews, 'Reviews fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get a single review by ID
 * @route   GET /api/reviews/:id
 * @access  Private
 */
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    // Verify ownership
    if (review.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to access this review', 403);
    }

    return sendSuccess(res, review, 'Review fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return sendError(res, 'Review not found', 404);
    }

    // Verify ownership
    if (review.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this review', 403);
    }

    await Review.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  createReview,
  getReviews,
  getReview,
  deleteReview,
};
