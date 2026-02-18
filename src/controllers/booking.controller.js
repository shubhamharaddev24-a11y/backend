const Booking = require('../models/Booking.model');
const Service = require('../models/Service.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');

// Create booking
exports.createBooking = asyncHandler(async (req, res, next) => {
  const bookingData = req.body;

  // Get service details to calculate total price
  const service = await Service.findById(bookingData.service);
  if (!service) {
    return next(new ApiError(404, 'Service not found'));
  }

  // Calculate total price
  bookingData.totalPrice = service.price;

  // Create new booking
  const newBooking = await Booking.create(bookingData);

  // Populate service details
  await newBooking.populate('service', 'name price category');

  // Send email notification
  try {
    await emailService.sendBookingConfirmation(newBooking);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }

  res.status(201).json(
    ApiResponse.created(newBooking, 'Booking created successfully')
  );
});

// Get all bookings
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, status, sortBy = 'createdAt' } = req.query;

  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('service', 'name price category')
    .populate('assignedTo', 'name email');

  const total = await Booking.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Bookings retrieved successfully')
  );
});

// Get booking by ID
exports.getBookingById = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate('service', 'name price category features')
    .populate('assignedTo', 'name email');

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  res.status(200).json(
    ApiResponse.success(booking, 'Booking retrieved successfully')
  );
});

// Update booking status
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status, notes } = req.body;

  const booking = await Booking.findByIdAndUpdate(
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
  ).populate('service', 'name price category')
   .populate('assignedTo', 'name email');

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  // Send email notification for status change
  try {
    await emailService.sendBookingStatusUpdate(booking);
  } catch (error) {
    console.error('Failed to send booking status email:', error);
  }

  res.status(200).json(
    ApiResponse.success(booking, 'Booking status updated successfully')
  );
});

// Update booking
exports.updateBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('service', 'name price category')
   .populate('assignedTo', 'name email');

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  res.status(200).json(
    ApiResponse.success(booking, 'Booking updated successfully')
  );
});

// Delete booking
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new ApiError(404, 'Booking not found'));
  }

  res.status(200).json(
    ApiResponse.success(null, 'Booking deleted successfully')
  );
});

// Get booking statistics
exports.getBookingStats = asyncHandler(async (req, res, next) => {
  const stats = await Booking.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  const totalBookings = await Booking.countDocuments();
  const totalRevenue = await Booking.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } }
  ]);

  const upcomingBookings = await Booking.countDocuments({
    status: 'confirmed',
    eventDate: { $gte: new Date() }
  });

  res.status(200).json(
    ApiResponse.success({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      upcomingBookings,
      statusBreakdown: stats
    }, 'Booking statistics retrieved successfully')
  );
});

// Get public services
exports.getPublicServices = asyncHandler(async (req, res, next) => {
  const { category } = req.query;

  const filter = { isActive: true };
  if (category) {
    filter.category = category;
  }

  const services = await Service.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .select('name description category price duration features images');

  res.status(200).json(
    ApiResponse.success(services, 'Services retrieved successfully')
  );
});
