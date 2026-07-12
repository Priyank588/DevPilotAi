const Notification = require('../models/Notification');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50);

    return sendSuccess(res, notifications, 'Notifications fetched successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    // Verify ownership
    if (notification.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized', 403);
    }

    notification.read = true;
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Mark all notifications as read for the authenticated user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    // Verify ownership
    if (notification.user.toString() !== req.user.id) {
      return sendError(res, 'Not authorized to delete this notification', 403);
    }

    await Notification.findByIdAndDelete(req.params.id);

    return sendSuccess(res, null, 'Notification deleted successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
};
