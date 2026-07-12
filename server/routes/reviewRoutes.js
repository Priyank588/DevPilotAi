const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createReview,
  getReviews,
  getReview,
  deleteReview,
} = require('../controllers/reviewController');

// All routes are protected
router.use(protect);

router.post('/', createReview);
router.get('/', getReviews);
router.get('/:id', getReview);
router.delete('/:id', deleteReview);

module.exports = router;
