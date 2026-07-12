const { validationResult } = require('express-validator');
const Project = require('../models/Project');
const Review = require('../models/Review');
const InterviewQuestion = require('../models/InterviewQuestion');
const Notification = require('../models/Notification');
const { sendSuccess, sendError, sendPaginated } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');
const projectImportService = require('../services/projectImportService');


/**
 * @desc    Get all projects for the authenticated user
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Project.countDocuments({ user: req.user.id });
    const projects = await Project.find({ user: req.user.id })
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    return sendPaginated(res, projects, page, limit, total);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Verify ownership
    if (project.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to access this project', 403);
    }

    return sendSuccess(res, project, 'Project fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const projectData = { ...req.body, user: req.user.id };

    // Parse array inputs if sent as strings (common in multipart form data)
    if (typeof projectData.techStack === 'string') {
      try {
        projectData.techStack = JSON.parse(projectData.techStack);
      } catch (e) {
        projectData.techStack = projectData.techStack.split(',').map(t => t.trim()).filter(Boolean);
      }
    }
    if (typeof projectData.tags === 'string') {
      try {
        projectData.tags = JSON.parse(projectData.tags);
      } catch (e) {
        projectData.tags = projectData.tags.split(',').map(t => t.trim()).filter(Boolean);
      }
    }

    // Handle zip file upload extraction if present
    if (req.file) {
      projectData.zipFile = req.file.path;
      try {
        projectData.sourceCode = projectImportService.extractSourceFromZip(req.file.path);
      } catch (err) {
        console.error('ZIP extraction error:', err);
      }
    }
    // Handle github url import extraction
    else if (projectData.githubUrl && projectData.githubUrl.trim()) {
      try {
        projectData.sourceCode = await projectImportService.extractSourceFromGithub(projectData.githubUrl);
      } catch (err) {
        return sendError(res, `Failed to import code from GitHub: ${err.message}`, 400);
      }
    }


    const project = await Project.create(projectData);

    // Track analytics
    await analyticsService.trackEvent(req.user.id, 'project', { projectId: project._id });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'project',
      title: 'Project Created',
      message: `Your project "${project.name}" has been created successfully.`,
      link: `/projects/${project._id}`,
    });

    return sendSuccess(res, project, 'Project created successfully', 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    let project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Verify ownership
    if (project.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to update this project', 403);
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(res, project, 'Project updated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete a project and associated data
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return sendError(res, 'Project not found', 404);
    }

    // Verify ownership
    if (project.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this project', 403);
    }

    // Delete associated reviews and interview questions for this project
    await Promise.all([
      Review.deleteMany({ project: project._id }),
      InterviewQuestion.deleteMany({ project: project._id }),
    ]);

    // Delete the project
    await Project.findByIdAndDelete(req.params.id);

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'project',
      title: 'Project Deleted',
      message: `Your project "${project.name}" has been deleted.`,
    });

    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
