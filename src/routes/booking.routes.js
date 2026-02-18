const express = require('express');
const bookingController = require('../controllers/booking.controller');
const { validateBooking } = require('../validators/booking.validator');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/', validateBooking, bookingController.createBooking);
router.get('/public/services', bookingController.getPublicServices);

// Protected routes (admin)
router.get('/', protect, bookingController.getAllBookings);
router.get('/:id', protect, bookingController.getBookingById);
router.patch('/:id/status', protect, bookingController.updateBookingStatus);
router.put('/:id', protect, bookingController.updateBooking);
router.delete('/:id', protect, bookingController.deleteBooking);
router.get('/stats/summary', protect, bookingController.getBookingStats);

module.exports = router;
