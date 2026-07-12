const Project = require('../models/Project');
const Note = require('../models/Note');
const Review = require('../models/Review');
const InterviewQuestion = require('../models/InterviewQuestion');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * @desc    Search across multiple collections (projects, notes, reviews, interviews)
 * @route   GET /api/search
 * @access  Private
 */
const search = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return sendError(res, 'Search query is required', 400);
    }

    const regex = new RegExp(q, 'i');

    const [projects, notes, reviews, interviews] = await Promise.all([
      Project.find({
        user: req.user.id,
        $or: [{ name: regex }, { description: regex }, { tags: regex }],
      })
        .limit(10)
        .select('name description tags createdAt'),
      Note.find({
        user: req.user.id,
        $or: [{ title: regex }, { content: regex }],
      })
        .limit(10)
        .select('title type createdAt'),
      Review.find({
        user: req.user.id,
        summary: regex,
      })
        .limit(10)
        .select('language overallRating summary createdAt'),
      InterviewQuestion.find({
        user: req.user.id,
        topic: regex,
      })
        .limit(10)
        .select('topic difficulty createdAt'),
    ]);

    return sendSuccess(
      res,
      { projects, notes, reviews, interviews },
      'Search results fetched successfully'
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  search,
};
