const { validationResult } = require('express-validator');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Project = require('../models/Project');
const Review = require('../models/Review');
const InterviewQuestion = require('../models/InterviewQuestion');
const Note = require('../models/Note');
const Analytics = require('../models/Analytics');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const analyticsService = require('../services/analyticsService');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'Email is already registered', 400);
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = user.getSignedJwtToken();

    // Create welcome notification
    await Notification.create({
      user: user._id,
      type: 'profile',
      title: 'Welcome to DevPilot AI!',
      message: 'Your account has been created successfully. Start exploring code reviews, interview prep, and more!',
    });

    // Track analytics
    await analyticsService.trackEvent(user._id, 'login', { action: 'register' });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          college: user.college,
          skills: user.skills,
          githubUrl: user.githubUrl,
          linkedinUrl: user.linkedinUrl,
          bio: user.bio,
          darkMode: user.darkMode,
        },
      },
      'Registration successful',
      201
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Track analytics
    await analyticsService.trackEvent(user._id, 'login', { action: 'login' });

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        college: user.college,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        bio: user.bio,
        darkMode: user.darkMode,
      },
    }, 'Login successful');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get current logged-in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        profileImage: user.profileImage,
        college: user.college,
        skills: user.skills,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        bio: user.bio,
        darkMode: user.darkMode,
        createdAt: user.createdAt,
      }
    }, 'User fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    // Only allow specific fields to be updated
    const allowedFields = ['name', 'college', 'skills', 'githubUrl', 'linkedinUrl', 'bio'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    // Create notification
    await Notification.create({
      user: req.user.id,
      type: 'profile',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
    });

    return sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Change user password
 * @route   PUT /api/auth/password
 * @access  Private
 */
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array()[0].msg, 400);
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 401);
    }

    // Set new password and save (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/avatar
 * @access  Private
 */
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'Please upload an image file', 400);
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: req.file.path },
      { new: true }
    );

    return sendSuccess(res, user, 'Avatar uploaded successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete user account and all associated data
 * @route   DELETE /api/auth/account
 * @access  Private
 */
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all user data from all collections
    await Promise.all([
      Project.deleteMany({ user: userId }),
      Review.deleteMany({ user: userId }),
      InterviewQuestion.deleteMany({ user: userId }),
      Note.deleteMany({ user: userId }),
      Notification.deleteMany({ user: userId }),
      Analytics.deleteMany({ user: userId }),
    ]);

    // Delete the user
    await User.findByIdAndDelete(userId);

    return sendSuccess(res, null, 'Account deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Google login via Firebase
 * @route   POST /api/auth/google
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!email) {
      return sendError(res, 'Email is required for Google login', 400);
    }

    // Find user by email
    let user = await User.findOne({ email });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      // Register new user since they don't exist yet
      // Generate a secure random password since it's required in model schema
      const randomPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name: name || 'Google User',
        email,
        password: randomPassword,
        avatar: avatar || undefined,
      });

      // Create welcome notification
      await Notification.create({
        user: user._id,
        type: 'profile',
        title: 'Welcome to DevPilot AI!',
        message: 'Your account has been created via Google Sign-In. Start exploring code reviews, interview prep, and more!',
      });
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Track analytics
    await analyticsService.trackEvent(user._id, 'login', { action: 'google', isNewUser });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          college: user.college,
          skills: user.skills,
          githubUrl: user.githubUrl,
          linkedinUrl: user.linkedinUrl,
          bio: user.bio,
          darkMode: user.darkMode,
        },
      },
      'Google sign-in successful'
    );
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
};

