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

// @desc    Upload website image asset
// @route   POST /api/content/upload
// @access  Private (Admin)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach an image file',
      });
    }

    // Relative static URL path served by Express
    const imageUrl = `/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Image upload failed',
      error: error.message,
    });
  }
};
