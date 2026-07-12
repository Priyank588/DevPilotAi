const multer = require('multer');
const path = require('path');

/**
 * Avatar upload storage configuration
 */
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

/**
 * Project ZIP upload storage configuration
 */
const projectStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'projects'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueSuffix);
  },
});

/**
 * File filter for image uploads (avatars)
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'), false);
  }
};

/**
 * File filter for ZIP uploads (projects)
 * @param {Object} req - Express request
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback
 */
const zipFileFilter = (req, file, cb) => {
  const allowedTypes = /zip|x-zip-compressed|x-zip/;
  const extname = /\.zip$/i.test(file.originalname);
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname || mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP files are allowed'), false);
  }
};

/**
 * Multer instance for avatar uploads (max 5MB, images only)
 */
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter,
}).single('avatar');

/**
 * Multer instance for project ZIP uploads (max 50MB, zip only)
 */
const uploadProject = multer({
  storage: projectStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: zipFileFilter,
}).single('zipFile');

module.exports = { uploadAvatar, uploadProject };
