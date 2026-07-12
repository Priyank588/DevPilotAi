const { validationResult } = require('express-validator');
const InterviewQuestion = require('../models/InterviewQuestion');
const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');
const aiService = require('../services/aiService');

/**
 * @desc    Generate interview questions using AI
 * @route   POST /api/interviews
 * @access  Private
 */
const generateQuestions = async (req, res) => {
  try {
    const { topic, difficulty, language, project } = req.body;

    if (!topic) {
      return sendError(res, 'Topic is required', 400);
    }

    // Generate questions with AI service
    const questions = await aiService.generateInterviewQuestions(
      topic,
      difficulty || 'medium',
      language || 'javascript'
    );


    // Save interview question document
    const interview = await InterviewQuestion.create({
      user: req.user.id,
      project: project || undefined,
      topic,
      difficulty: difficulty || 'medium',
      language: language || 'javascript',
      mcqs: questions.mcqs,
      codingQuestions: questions.codingQuestions,
      hrQuestions: questions.hrQuestions,
      technicalQuestions: questions.technicalQuestions,
      followUpQuestions: questions.followUpQuestions,
    });

    // Track analytics
    await analyticsService.trackEvent(req.user.id, 'interview', {
      interviewId: interview._id,
      topic,
      difficulty,
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'interview',
      title: 'Interview Questions Ready',
      message: `Your ${difficulty || 'medium'} difficulty ${topic} interview questions are ready.`,
      link: `/interviews/${interview._id}`,
    });

    return sendSuccess(res, interview, 'Interview questions generated successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get all interview question sets for the authenticated user
 * @route   GET /api/interviews
 * @access  Private
 */
const getInterviews = async (req, res) => {
  try {
    const interviews = await InterviewQuestion.find({ user: req.user.id }).sort('-createdAt');
    return sendSuccess(res, interviews, 'Interviews fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get a single interview question set by ID
 * @route   GET /api/interviews/:id
 * @access  Private
 */
const getInterview = async (req, res) => {
  try {
    const interview = await InterviewQuestion.findById(req.params.id);

    if (!interview) {
      return sendError(res, 'Interview not found', 404);
    }

    // Verify ownership
    if (interview.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to access this interview', 403);
    }

    return sendSuccess(res, interview, 'Interview fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete an interview question set
 * @route   DELETE /api/interviews/:id
 * @access  Private
 */
const deleteInterview = async (req, res) => {
  try {
    const interview = await InterviewQuestion.findById(req.params.id);

    if (!interview) {
      return sendError(res, 'Interview not found', 404);
    }

    // Verify ownership
    if (interview.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this interview', 403);
    }

    await InterviewQuestion.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Interview deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  generateQuestions,
  getInterviews,
  getInterview,
  deleteInterview,
};
