const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  analyzeComplexity,
  detectBugs,
} = require('../controllers/analysisController');

// All routes are protected
router.use(protect);

router.post('/complexity', analyzeComplexity);
router.post('/bugs', detectBugs);

module.exports = router;
