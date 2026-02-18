const Lead = require('../models/Lead.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');

// Create lead
exports.createLead = asyncHandler(async (req, res, next) => {
  const { name, email, phone, subject, message } = req.body;

  // Create new lead
  const newLead = await Lead.create({
    name,
    email,
    phone,
    subject,
    message,
    source: 'website'
  });

  // Send email notification
  try {
    await emailService.sendLeadNotification(newLead);
  } catch (error) {
    console.error('Failed to send lead notification email:', error);
    // Don't fail the request if email fails
  }

  res.status(201).json(
    ApiResponse.created(newLead, 'Lead created successfully')
  );
});

// Get all leads
exports.getAllLeads = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt' } = req.query;

  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const leads = await Lead.find(filter)
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('assignedTo', 'name email');

  const total = await Lead.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success({
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Leads retrieved successfully')
  );
});

// Get lead by ID
exports.getLeadById = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  res.status(200).json(
    ApiResponse.success(lead, 'Lead retrieved successfully')
  );
});

// Update lead status
exports.updateLeadStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  const lead = await Lead.findByIdAndUpdate(
    req.params.id,
    { 
      status,
      $push: {
        notes: {
          content: notes || `Status changed to ${status}`,
          addedBy: req.user.id,
          createdAt: new Date()
        }
      }
    },
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email');

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  res.status(200).json(
    ApiResponse.success(lead, 'Lead status updated successfully')
  );
});

// Delete lead
exports.deleteLead = asyncHandler(async (req, res, next) => {
  const lead = await Lead.findByIdAndDelete(req.params.id);

  if (!lead) {
    return next(new ApiError(404, 'Lead not found'));
  }

  res.status(200).json(
    ApiResponse.success(null, 'Lead deleted successfully')
  );
});

// Get lead statistics
exports.getLeadStats = asyncHandler(async (req, res, next) => {
  const stats = await Lead.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const totalLeads = await Lead.countDocuments();
  const newLeads = await Lead.countDocuments({ status: 'new' });

  res.status(200).json(
    ApiResponse.success({
      totalLeads,
      newLeads,
      statusBreakdown: stats
    }, 'Lead statistics retrieved successfully')
  );
});

// Get public testimonials
exports.getPublicTestimonials = asyncHandler(async (req, res, next) => {
  const testimonials = await Lead.find({
    status: 'replied',
    'message': { $exists: true, $ne: '' }
  })
  .select('name message createdAt')
  .sort({ createdAt: -1 })
  .limit(6);

  res.status(200).json(
    ApiResponse.success(testimonials, 'Testimonials retrieved successfully')
  );
});
