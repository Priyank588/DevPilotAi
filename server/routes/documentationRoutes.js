const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateDocs } = require('../controllers/documentationController');

// All routes are protected
router.use(protect);

router.post('/generate', generateDocs);

module.exports = router;
