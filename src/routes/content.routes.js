const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');
const { uploadSingle } = require('../services/upload.service');

// Middleware wrapper for handling Multer errors cleanly from uploadSingle
const handleUpload = (req, res, next) => {
  uploadSingle('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
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
router.post('/upload', handleUpload, contentController.uploadImage);

module.exports = router;
