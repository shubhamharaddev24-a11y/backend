const express = require('express');
const authController = require('../controllers/auth.controller');
const { validateAuth } = require('../validators/auth.validator');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/login', validateAuth, authController.login);
router.post('/register', validateAuth, authController.register);

// Protected routes
router.get('/me', protect, authController.getMe);
router.put('/update-password', protect, authController.updatePassword);
router.post('/logout', protect, authController.logout);

// Admin routes
router.get('/admin/users', protect, restrictTo('admin'), authController.getAllUsers);
router.delete('/admin/users/:id', protect, restrictTo('admin'), authController.deleteUser);

module.exports = router;

