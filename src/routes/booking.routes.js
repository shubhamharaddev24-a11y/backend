const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validateBooking } = require('../validators/booking.validator');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/', validateBooking, bookingController.createBooking);
router.get('/public/services', bookingController.getPublicServices);

// Protected routes (admin)
router.get('/', protect, restrictTo('admin'), bookingController.getAllBookings);
router.get('/:id', protect, restrictTo('admin'), bookingController.getBookingById);
router.patch('/:id/status', protect, restrictTo('admin'), bookingController.updateBookingStatus);
router.put('/:id', protect, restrictTo('admin'), bookingController.updateBooking);
router.delete('/:id', protect, restrictTo('admin'), bookingController.deleteBooking);
router.get('/stats/summary', protect, restrictTo('admin'), bookingController.getBookingStats);

module.exports = router;

