const { body, validationResult } = require('express-validator');

const validateBooking = async (req, res, next) => {
  try {
    await Promise.all([
      body('customerName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Customer name must be between 2 and 100 characters')
        .run(req),

      body('customerEmail')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .run(req),

      body('customerPhone')
        .trim()
        .isLength({ min: 10, max: 20 })
        .withMessage('Please provide a valid phone number')
        .matches(/^[+]?[\d\s\-\(\)]+$/)
        .withMessage('Phone number can only contain digits, spaces, and basic symbols')
        .run(req),

      body('service')
        .optional()
        .isMongoId()
        .withMessage('Please select a valid service')
        .run(req),

      body('eventType')
        .trim()
        .isIn([
          'wedding', 'pre-wedding', 'engagement', 'birthday', 'maternity', 'baby-shoot', 'portrait', 'event',
          'reel-shoot', 'promotional-video', 'music-video', 'video-editing', 'cinematography', 'commercial',
          'logo-design', 'wedding-invitation', 'banner-design', 'branding-deck',
          'web-development', 'digital-marketing', 'seo-optimization', 'social-media-management',
          'other'
        ])
        .withMessage('Please select a valid service or event type')
        .run(req),

      body('category')
        .optional()
        .trim()
        .isIn(['photography', 'video-reels', 'design-creative', 'digital-services', 'other'])
        .withMessage('Please select a valid category')
        .run(req),

      body('eventDate')
        .isISO8601()
        .withMessage('Please provide a valid event date')
        .custom((value) => {
          const eventDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (eventDate <= today) {
            throw new Error('Event date must be in the future');
          }
          return true;
        })
        .run(req),

      body('eventLocation')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Location must be between 3 and 200 characters')
        .run(req),

      body('eventDuration')
        .optional()
        .trim()
        .isIn(['Half Day', 'Full Day', '2 Days', '3 Days', 'Custom'])
        .withMessage('Please select a valid duration')
        .run(req),

      body('guestCount')
        .optional()
        .isInt({ min: 1, max: 5000 })
        .withMessage('Guest count must be between 1 and 5000')
        .run(req),

      body('budget')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Budget must be a positive number')
        .run(req),

      body('message')
        .optional()
        .isLength({ max: 2000 })
        .withMessage('Message cannot exceed 2000 characters')
        .run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorList = errors.array();
      return res.status(400).json({
        success: false,
        message: errorList.map(e => e.msg).join('. ') || 'Validation failed',
        errors: errorList
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { validateBooking };
