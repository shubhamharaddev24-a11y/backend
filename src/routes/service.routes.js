const express = require('express');
const serviceController = require('../controllers/service.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/categories', serviceController.getServiceCategories);
router.get('/:id', serviceController.getServiceById);

// Protected routes (admin)
router.post('/', protect, restrictTo('admin'), serviceController.createService);
router.put('/:id', protect, restrictTo('admin'), serviceController.updateService);
router.delete('/:id', protect, restrictTo('admin'), serviceController.deleteService);
router.patch('/:id/toggle-active', protect, restrictTo('admin'), serviceController.toggleServiceActive);

module.exports = router;

