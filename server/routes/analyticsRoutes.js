const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAnalytics,
  getSummary,
} = require('../controllers/analyticsController');

// All routes are protected
router.use(protect);

// IMPORTANT: /summary must come before / to avoid route conflicts
router.get('/summary', getSummary);
router.get('/', getAnalytics);

module.exports = router;
