const Booking = require('../models/Booking.model');
const Service = require('../models/Service.model');
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const emailService = require('../services/email.service');

// Helper to determine category from eventType
const getCategoryForType = (eventType) => {
  const photoTypes = ['wedding', 'pre-wedding', 'engagement', 'birthday', 'maternity', 'baby-shoot', 'portrait', 'event'];
  const videoTypes = ['reel-shoot', 'promotional-video', 'music-video', 'video-editing', 'cinematography', 'commercial'];
  const designTypes = ['logo-design', 'wedding-invitation', 'banner-design', 'branding-deck'];
  const digitalTypes = ['web-development', 'digital-marketing', 'seo-optimization', 'social-media-management'];

  if (photoTypes.includes(eventType)) return 'photography';
  if (videoTypes.includes(eventType)) return 'video-reels';
  if (designTypes.includes(eventType)) return 'design-creative';
  if (digitalTypes.includes(eventType)) return 'digital-services';
  return 'photography';
};

// Create booking / Post Marketplace Order
exports.createBooking = asyncHandler(async (req, res, next) => {
  const bookingData = { ...req.body };

  // Get service details if service is specified
  if (bookingData.service) {
    const service = await Service.findById(bookingData.service);
    if (service) {
      bookingData.totalPrice = service.price;
    }
  }

  // Set totalPrice from budget if not set
  if (!bookingData.totalPrice && bookingData.budget) {
    bookingData.totalPrice = bookingData.budget;
  }

  // Auto-set category based on eventType if not provided
  if (!bookingData.category && bookingData.eventType) {
    bookingData.category = getCategoryForType(bookingData.eventType);
  }

  // Set client if authenticated
  if (req.user) {
    bookingData.client = req.user._id;
    if (!bookingData.customerName) bookingData.customerName = req.user.name;
    if (!bookingData.customerEmail) bookingData.customerEmail = req.user.email;
    if (!bookingData.customerPhone && req.user.phone) bookingData.customerPhone = req.user.phone;
  }

  // Set title fallback
  if (!bookingData.title) {
    const typeLabel = bookingData.eventType ? bookingData.eventType.replace('-', ' ').toUpperCase() : 'CREATIVE SERVICE';
    bookingData.title = `${typeLabel} in ${bookingData.eventLocation || 'Thane / Mumbai'}`;
  }

  // Calculate commission fees (10% default platform commission)
  const price = bookingData.totalPrice || bookingData.budget || 0;
  const rate = bookingData.commissionRate !== undefined ? Number(bookingData.commissionRate) : 10;
  bookingData.platformFee = Math.round((price * rate) / 100);
  bookingData.freelancerPayout = Math.max(0, price - bookingData.platformFee);

  // Set expiry timestamp
  const hours = bookingData.expiryHours ? Number(bookingData.expiryHours) : 24;
  bookingData.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  bookingData.status = 'open';

  // Create new booking
  const newBooking = await Booking.create(bookingData);

  // Populate if service exists
  if (newBooking.service) {
    await newBooking.populate('service', 'name price category');
  }

  // Send email notification
  try {
    await emailService.sendBookingConfirmation(newBooking);
  } catch (error) {
    console.error('Failed to send booking confirmation email:', error);
  }

  res.status(201).json(
    ApiResponse.created(newBooking, 'Order posted to marketplace successfully')
  );
});

// Get all bookings (Admin)
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, status, category, sortBy = 'createdAt' } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const bookings = await Booking.find(filter)
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('service', 'name price category')
    .populate('client', 'name email phone')
    .populate('claimedBy', 'name email phone')
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
    .populate('client', 'name email phone')
    .populate('claimedBy', 'name email phone avatar skills city')
    .populate('quotations.provider', 'name email phone avatar skills city');

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

// ==========================================
// MARKETPLACE GIG & EARNINGS CONTROLLERS
// ==========================================

// 1. Get all available marketplace orders with countdown/expiry info
exports.getAvailableOrders = asyncHandler(async (req, res, next) => {
  const now = new Date();

  // Auto-expire orders that passed their expiration time
  await Booking.updateMany(
    { status: 'open', expiresAt: { $lte: now } },
    { $set: { status: 'expired' } }
  );

  const { eventType, category, search } = req.query;
  const filter = {
    status: 'open',
    expiresAt: { $gt: now }
  };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (eventType && eventType !== 'all') {
    filter.eventType = eventType;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { eventLocation: { $regex: search, $options: 'i' } },
      { eventType: { $regex: search, $options: 'i' } }
    ];
  }

  const orders = await Booking.find(filter)
    .sort({ expiresAt: 1 }) // Expiring soonest on top
    .populate('client', 'name email city')
    .populate('service', 'name price category');

  // Map to include calculated seconds remaining & quote count
  const ordersWithTimers = orders.map(order => {
    const obj = order.toObject();
    const remainingMs = new Date(order.expiresAt).getTime() - Date.now();
    obj.secondsRemaining = Math.max(0, Math.floor(remainingMs / 1000));
    obj.quotesCount = (order.quotations || []).length;
    return obj;
  });

  res.status(200).json(
    ApiResponse.success(ordersWithTimers, 'Available marketplace orders retrieved successfully')
  );
});

// 2. Freelancer / Creator directly claims an order
exports.claimOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const now = new Date();

  const order = await Booking.findOne({
    _id: id,
    status: 'open',
    expiresAt: { $gt: now }
  });

  if (!order) {
    return next(new ApiError(400, 'This order is either already claimed by another creator, expired, or unavailable.'));
  }

  if (order.client && order.client.toString() === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot claim an order that you posted.'));
  }

  order.status = 'claimed';
  order.claimedBy = req.user._id;
  order.assignedTo = req.user._id;
  order.claimedAt = now;
  order.notes.push({
    content: `Order claimed by creator ${req.user.name} (Phone: ${req.user.phone || 'N/A'}, Email: ${req.user.email}).`,
    addedBy: req.user._id,
    createdAt: now
  });

  await order.save();
  await order.populate('client', 'name email phone city avatar');

  res.status(200).json(
    ApiResponse.success(order, 'Congratulations! You have claimed this order. Client contact details unlocked.')
  );
});

// 3. Provider submits a custom quotation
exports.submitQuotation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { quotedPrice, deliverables, equipment, estimatedDays, message } = req.body;
  const now = new Date();

  if (!quotedPrice || Number(quotedPrice) <= 0) {
    return next(new ApiError(400, 'Please enter a valid quotation price'));
  }

  const order = await Booking.findOne({
    _id: id,
    status: { $in: ['open', 'pending'] },
    expiresAt: { $gt: now }
  });

  if (!order) {
    return next(new ApiError(404, 'This requirement is no longer accepting quotations or has expired.'));
  }

  if (order.client && order.client.toString() === req.user._id.toString()) {
    return next(new ApiError(400, 'You cannot submit a quotation on an order you posted.'));
  }

  const price = Number(quotedPrice);
  const rate = order.commissionRate !== undefined ? Number(order.commissionRate) : 10;
  const platformFee = Math.round((price * rate) / 100);
  const providerEarnings = Math.max(0, price - platformFee);

  const existingQuoteIndex = order.quotations.findIndex(
    q => q.provider && q.provider.toString() === req.user._id.toString()
  );

  const quotationData = {
    provider: req.user._id,
    providerName: req.user.name,
    providerEmail: req.user.email,
    providerPhone: req.user.phone || '',
    providerAvatar: req.user.avatar || '',
    providerRating: 5.0,
    quotedPrice: price,
    platformFee,
    providerEarnings,
    deliverables: Array.isArray(deliverables) ? deliverables : (deliverables ? deliverables.split(',').map(s => s.trim()) : []),
    equipment: equipment || '',
    estimatedDays: estimatedDays ? Number(estimatedDays) : 1,
    message: message || '',
    status: 'submitted',
    createdAt: now
  };

  if (existingQuoteIndex > -1) {
    order.quotations[existingQuoteIndex] = quotationData;
  } else {
    order.quotations.push(quotationData);
  }

  order.notes.push({
    content: `Quotation of ₹${price.toLocaleString()} submitted by provider ${req.user.name}.`,
    addedBy: req.user._id,
    createdAt: now
  });

  await order.save();

  res.status(200).json(
    ApiResponse.success(order, 'Quotation submitted successfully! The client will review your quote.')
  );
});

// 4. Client accepts a provider's quotation
exports.acceptQuotation = asyncHandler(async (req, res, next) => {
  const { id, quoteId } = req.params;
  const now = new Date();

  const order = await Booking.findById(id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isClient = (order.client && order.client.toString() === req.user._id.toString()) || (order.customerEmail === req.user.email);
  const isAdmin = req.user.role === 'admin';

  if (!isClient && !isAdmin) {
    return next(new ApiError(403, 'Only the client who posted this enquiry can accept a quotation.'));
  }

  const quote = order.quotations.id(quoteId);
  if (!quote) {
    return next(new ApiError(404, 'Quotation not found'));
  }

  order.quotations.forEach(q => {
    if (q._id.toString() === quoteId.toString()) {
      q.status = 'accepted';
    } else if (q.status === 'submitted') {
      q.status = 'rejected';
    }
  });

  order.selectedQuotation = quote._id;
  order.claimedBy = quote.provider;
  order.assignedTo = quote.provider;
  order.claimedAt = now;
  order.status = 'confirmed';
  order.totalPrice = quote.quotedPrice;
  order.platformFee = quote.platformFee;
  order.freelancerPayout = quote.providerEarnings;

  order.notes.push({
    content: `Quotation accepted! Provider ${quote.providerName} confirmed for ₹${quote.quotedPrice.toLocaleString()}. Both contact numbers unlocked.`,
    addedBy: req.user._id,
    createdAt: now
  });

  await order.save();
  await order.populate('claimedBy', 'name email phone avatar skills city');

  res.status(200).json(
    ApiResponse.success(order, 'Quotation accepted! Booking confirmed and contact details unlocked.')
  );
});

// 5. Get orders posted by the logged-in client
exports.getMyClientOrders = asyncHandler(async (req, res, next) => {
  const orders = await Booking.find({
    $or: [
      { client: req.user._id },
      { customerEmail: req.user.email }
    ]
  })
    .sort({ createdAt: -1 })
    .populate('claimedBy', 'name email phone avatar skills city')
    .populate('quotations.provider', 'name email phone avatar skills city')
    .populate('service', 'name price');

  res.status(200).json(
    ApiResponse.success(orders, 'Client orders retrieved successfully')
  );
});

// 6. Get orders claimed / quoted by the logged-in freelancer
exports.getMyFreelancerOrders = asyncHandler(async (req, res, next) => {
  const orders = await Booking.find({
    $or: [
      { claimedBy: req.user._id },
      { 'quotations.provider': req.user._id }
    ]
  })
    .sort({ claimedAt: -1, createdAt: -1 })
    .populate('client', 'name email phone avatar')
    .populate('service', 'name price');

  const totalClaimed = orders.filter(o => o.claimedBy && o.claimedBy.toString() === req.user._id.toString()).length;
  let totalEarnings = 0;
  let completedCount = 0;
  let activeCount = 0;

  orders.forEach(ord => {
    if (ord.claimedBy && ord.claimedBy.toString() === req.user._id.toString()) {
      if (ord.status === 'completed') {
        totalEarnings += (ord.freelancerPayout || ord.budget || 0);
        completedCount++;
      } else if (ord.status === 'claimed' || ord.status === 'confirmed' || ord.status === 'in_progress') {
        activeCount++;
      }
    }
  });

  res.status(200).json(
    ApiResponse.success({
      orders,
      stats: {
        totalClaimed,
        completedCount,
        activeCount,
        totalEarnings
      }
    }, 'Freelancer orders retrieved successfully')
  );
});

// 7. Complete an order (releases payout)
exports.completeOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Booking.findById(id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isClient = order.client && order.client.toString() === req.user._id.toString();
  const isFreelancer = order.claimedBy && order.claimedBy.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isClient && !isFreelancer && !isAdmin) {
    return next(new ApiError(403, 'You are not authorized to mark this order as completed.'));
  }

  order.status = 'completed';
  order.notes.push({
    content: `Order marked as completed by ${req.user.name} (${req.user.role}).`,
    addedBy: req.user._id,
    createdAt: new Date()
  });

  await order.save();

  // If claimedBy exists, add payout to user's totalEarnings
  if (order.claimedBy && order.freelancerPayout > 0) {
    await User.findByIdAndUpdate(order.claimedBy, {
      $inc: { totalEarnings: order.freelancerPayout }
    });
  }

  res.status(200).json(
    ApiResponse.success(order, 'Order completed successfully! Payout recorded.')
  );
});

// 8. Cancel client order
exports.cancelOrder = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const order = await Booking.findById(id);
  if (!order) {
    return next(new ApiError(404, 'Order not found'));
  }

  const isClient = order.client && order.client.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isClient && !isAdmin) {
    return next(new ApiError(403, 'You can only cancel your own posted orders.'));
  }

  order.status = 'cancelled';
  order.notes.push({
    content: `Order cancelled by ${req.user.name}.`,
    addedBy: req.user._id,
    createdAt: new Date()
  });

  await order.save();

  res.status(200).json(
    ApiResponse.success(order, 'Order cancelled successfully')
  );
});

// 9. Get Platform Marketplace Financial & Commission Statistics
exports.getMarketplaceStats = asyncHandler(async (req, res, next) => {
  const totalOrders = await Booking.countDocuments();
  const confirmedOrders = await Booking.countDocuments({ status: { $in: ['confirmed', 'claimed', 'in_progress', 'completed'] } });
  const completedOrders = await Booking.countDocuments({ status: 'completed' });
  const openOrders = await Booking.countDocuments({ status: 'open', expiresAt: { $gt: new Date() } });

  const financialAgg = await Booking.aggregate([
    {
      $group: {
        _id: null,
        grossMerchandiseValue: { $sum: '$totalPrice' },
        totalPlatformCommission: { $sum: '$platformFee' },
        totalCreatorPayouts: { $sum: '$freelancerPayout' }
      }
    }
  ]);

  const financials = financialAgg[0] || {
    grossMerchandiseValue: 0,
    totalPlatformCommission: 0,
    totalCreatorPayouts: 0
  };

  res.status(200).json(
    ApiResponse.success({
      totalOrders,
      confirmedOrders,
      completedOrders,
      openOrders,
      financials
    }, 'Marketplace statistics retrieved successfully')
  );
});
