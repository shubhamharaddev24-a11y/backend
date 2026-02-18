const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const leadRoutes = require('./lead.routes');
const bookingRoutes = require('./booking.routes');
const serviceRoutes = require('./service.routes');

// API version and base routes
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Shubham Photos Studio API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      leads: '/api/leads',
      bookings: '/api/bookings',
      services: '/api/services'
    },
    documentation: 'https://api-docs.shubham-photos.com'
  });
});

module.exports = router;
