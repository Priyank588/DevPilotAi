const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateQuestions,
  getInterviews,
  getInterview,
  deleteInterview,
} = require('../controllers/interviewController');

// All routes are protected
router.use(protect);

router.post('/', generateQuestions);
router.get('/', getInterviews);
router.get('/:id', getInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
