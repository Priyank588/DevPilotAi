const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createNoteValidator,
  updateNoteValidator,
} = require('../validators/noteValidator');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} = require('../controllers/noteController');

// All routes are protected
router.use(protect);

router.get('/', getNotes);
router.post('/', createNoteValidator, createNote);
router.put('/:id', updateNoteValidator, updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
