const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadProject } = require('../middleware/upload');
const {
  createProjectValidator,
  updateProjectValidator,
} = require('../validators/projectValidator');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');

// All routes are protected
router.use(protect);

router.get('/', getProjects);
router.post('/', uploadProject, createProjectValidator, createProject);
router.get('/:id', getProject);
router.put('/:id', updateProjectValidator, updateProject);
router.delete('/:id', deleteProject);

module.exports = router;
