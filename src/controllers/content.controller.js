const ContentSection = require('../models/Content.model');
const fs = require('fs');
const path = require('path');

// @desc    Get all website content sections
// @route   GET /api/content/sections
// @access  Public
exports.getAllSections = async (req, res) => {
  try {
    const sections = await ContentSection.find({});
    const sectionsMap = {};
    sections.forEach((sec) => {
      sectionsMap[sec.sectionKey] = sec;
    });
    return res.status(200).json({
      success: true,
      data: sectionsMap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch content sections',
      error: error.message,
    });
  }
};

// @desc    Get single section by key
// @route   GET /api/content/sections/:sectionKey
// @access  Public
exports.getSectionByKey = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    let section = await ContentSection.findOne({ sectionKey });
    if (!section) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }
    return res.status(200).json({
      success: true,
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch section content',
      error: error.message,
    });
  }
};

// @desc    Update/Upsert section content
// @route   PUT /api/content/sections/:sectionKey
// @access  Private (Admin)
exports.updateSection = async (req, res) => {
  try {
    const { sectionKey } = req.params;
    const { title, subtitle, description, items, metadata } = req.body;

    const section = await ContentSection.findOneAndUpdate(
      { sectionKey },
      {
        sectionKey,
        title,
        subtitle,
        description,
        items,
        metadata,
        lastUpdatedBy: req.user?._id,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Section '${sectionKey}' updated successfully`,
      data: section,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update section content',
      error: error.message,
    });
  }
};

const sharp = require('sharp');

// @desc    Upload website image asset
// @route   POST /api/content/upload
// @access  Private (Admin)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a media file',
      });
    }

    // 1. Cloudinary upload (production)
    if (req.file.path && (req.file.path.startsWith('http://') || req.file.path.startsWith('https://'))) {
      return res.status(201).json({
        success: true,
        message: 'Media uploaded to Cloudinary successfully',
        imageUrl: req.file.path,
        filename: req.file.filename || path.basename(req.file.path),
      });
    }

    // 2. Local Video upload
    if (req.file.mimetype && req.file.mimetype.startsWith('video/')) {
      return res.status(201).json({
        success: true,
        message: 'Video uploaded successfully',
        imageUrl: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
      });
    }

    // 3. Local Image upload (with Sharp optimization)
    let finalFilename = req.file.filename;
    const originalPath = req.file.path;
    const outputFilename = `opt-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
    const outputPath = path.join(path.dirname(originalPath), outputFilename);

    try {
      await sharp(originalPath)
        .resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 84, progressive: true, mozjpeg: true })
        .toFile(outputPath);

      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(originalPath); // remove huge raw file
        finalFilename = outputFilename;
      }
    } catch (sharpError) {
      console.warn('Sharp optimization fallback:', sharpError.message);
    }

    // Relative static URL path served by Express
    const imageUrl = `/uploads/${finalFilename}`;

    return res.status(201).json({
      success: true,
      message: 'Image uploaded & optimized successfully',
      imageUrl,
      filename: finalFilename,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Media upload failed',
      error: error.message,
    });
  }
};
