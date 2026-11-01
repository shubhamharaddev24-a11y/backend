const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validateBooking } = require('../validators/booking.validator');
const { protect, restrictTo, optionalAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/', optionalAuth, validateBooking, bookingController.createBooking);
router.get('/public/services', bookingController.getPublicServices);

// Marketplace Gig & Quotation Routes
router.get('/marketplace/available', bookingController.getAvailableOrders);
router.get('/marketplace/stats', protect, bookingController.getMarketplaceStats);
router.post('/marketplace/order', optionalAuth, bookingController.createBooking); // Supports guest and authenticated booking
router.post('/marketplace/:id/claim', protect, restrictTo('freelancer', 'photographer', 'admin', 'user'), bookingController.claimOrder);
router.post('/marketplace/:id/quote', protect, restrictTo('freelancer', 'photographer', 'admin', 'user'), bookingController.submitQuotation);
router.patch('/marketplace/:id/accept-quote/:quoteId', protect, bookingController.acceptQuotation);
router.get('/marketplace/my-client-orders', protect, bookingController.getMyClientOrders);
router.get('/marketplace/my-claimed-orders', protect, bookingController.getMyFreelancerOrders);
router.patch('/marketplace/:id/complete', protect, bookingController.completeOrder);
router.patch('/marketplace/:id/cancel', protect, bookingController.cancelOrder);

// Protected routes (admin)
router.get('/', protect, restrictTo('admin'), bookingController.getAllBookings);
router.get('/:id', protect, restrictTo('admin'), bookingController.getBookingById);
router.patch('/:id/status', protect, restrictTo('admin'), bookingController.updateBookingStatus);
router.put('/:id', protect, restrictTo('admin'), bookingController.updateBooking);
router.delete('/:id', protect, restrictTo('admin'), bookingController.deleteBooking);
router.get('/stats/summary', protect, restrictTo('admin'), bookingController.getBookingStats);

module.exports = router;
