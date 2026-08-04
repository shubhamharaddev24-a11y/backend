const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const contentController = require('../controllers/content.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  },
});

// File Filter for Images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for high-res DSLR & stock photos
  fileFilter,
});

// Middleware wrapper for handling Multer errors cleanly
const uploadSingleImage = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image file is too large! Maximum allowed size is 50MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload error',
      });
    }
    next();
  });
};

// Public Routes
router.get('/sections', contentController.getAllSections);
router.get('/sections/:sectionKey', contentController.getSectionByKey);

// Protected Admin Routes
router.use(protect);
router.use(restrictTo('admin'));

router.put('/sections/:sectionKey', contentController.updateSection);
router.post('/upload', uploadSingleImage, contentController.uploadImage);

module.exports = router;
