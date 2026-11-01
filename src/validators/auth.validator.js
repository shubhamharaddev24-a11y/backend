const { body, validationResult } = require('express-validator');

const validateAuth = async (req, res, next) => {
  try {
    // Login validation
    if (req.path === '/login') {
      await Promise.all([
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email address')
          .run(req),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters long')
          .run(req)
      ]);
    }
    
    // Register validation
    if (req.path === '/register') {
      await Promise.all([
        body('name')
          .trim()
          .isLength({ min: 2, max: 50 })
          .withMessage('Name must be between 2 and 50 characters')
          .run(req),
        body('email')
          .isEmail()
          .normalizeEmail()
          .withMessage('Please provide a valid email address')
          .run(req),
        body('password')
          .isLength({ min: 6 })
          .withMessage('Password must be at least 6 characters long')
          .run(req)
      ]);
    }

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

module.exports = { validateAuth };

