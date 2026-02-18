const { body, validationResult } = require('express-validator');

const validateLead = (req, res, next) => {
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .run(req);

  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
    .run(req);

  body('phone')
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Please provide a valid phone number')
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Phone number can only contain digits, spaces, and basic symbols')
    .run(req);

  body('subject')
    .trim()
    .isIn(['Wedding Photography', 'Portrait Photography', 'Digital Services', 'Printing Services', 'General Inquiry'])
    .withMessage('Please select a valid subject')
    .run(req);

  body('message')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  next();
};

module.exports = { validateLead };
