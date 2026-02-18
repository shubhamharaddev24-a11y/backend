const express = require('express');
const leadController = require('../controllers/lead.controller');
const { validateLead } = require('../validators/lead.validator');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.post('/', validateLead, leadController.createLead);
router.get('/public/testimonials', leadController.getPublicTestimonials);

// Protected routes (admin)
router.get('/', protect, leadController.getAllLeads);
router.get('/:id', protect, leadController.getLeadById);
router.patch('/:id/status', protect, leadController.updateLeadStatus);
router.delete('/:id', protect, leadController.deleteLead);
router.get('/stats/summary', protect, leadController.getLeadStats);

module.exports = router;
