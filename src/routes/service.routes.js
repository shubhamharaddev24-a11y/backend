const express = require('express');
const serviceController = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/categories', serviceController.getServiceCategories);
router.get('/:id', serviceController.getServiceById);

// Protected routes (admin)
router.post('/', protect, serviceController.createService);
router.put('/:id', protect, serviceController.updateService);
router.delete('/:id', protect, serviceController.deleteService);
router.patch('/:id/toggle-active', protect, serviceController.toggleServiceActive);

module.exports = router;
