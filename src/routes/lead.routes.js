const express = require('express');
const leadController = require('../controllers/lead.controller');
const { validateLead } = require('../validators/lead.validator');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/', validateLead, leadController.createLead);
router.get('/public/testimonials', leadController.getPublicTestimonials);

// Protected routes (admin)
router.get('/', protect, restrictTo('admin'), leadController.getAllLeads);
router.get('/:id', protect, restrictTo('admin'), leadController.getLeadById);
router.patch('/:id/status', protect, restrictTo('admin'), leadController.updateLeadStatus);
router.put('/:id', protect, restrictTo('admin'), leadController.updateLead);
router.delete('/:id', protect, restrictTo('admin'), leadController.deleteLead);
router.get('/stats/summary', protect, restrictTo('admin'), leadController.getLeadStats);

module.exports = router;

