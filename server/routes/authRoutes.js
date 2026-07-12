const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('../validators/authValidator');
const {
  register,
  login,
  googleLogin,
  getMe,
  updateProfile,
  changePassword,
  uploadAvatar: uploadAvatarHandler,
  deleteAccount,
} = require('../controllers/authController');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/google', googleLogin);


// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfileValidator, updateProfile);
router.put('/password', protect, changePasswordValidator, changePassword);
router.post('/avatar', protect, uploadAvatar, uploadAvatarHandler);
router.delete('/account', protect, deleteAccount);

module.exports = router;
