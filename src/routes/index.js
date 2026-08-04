const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const leadRoutes = require('./lead.routes');
const bookingRoutes = require('./booking.routes');
const serviceRoutes = require('./service.routes');
const taskRoutes = require('./task.routes');
const contentRoutes = require('./content.routes');

// API version and base routes
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/bookings', bookingRoutes);
router.use('/services', serviceRoutes);
router.use('/tasks', taskRoutes);
router.use('/content', contentRoutes);

// API documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Shubham Media & Digital Services API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      leads: '/api/leads',
      bookings: '/api/bookings',
      services: '/api/services',
      tasks: '/api/tasks',
      content: '/api/content'
    },
    documentation: 'https://api-docs.smediadigitalservices.com'
  });
});

module.exports = router;
