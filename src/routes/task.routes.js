const express = require('express');
const taskController = require('../controllers/task.controller');
const { protect } = require('../middlewares/auth.middleware');
const { uploadMultiple } = require('../services/upload.service');

const router = express.Router();

// All task routes are protected
router.use(protect);

router.post('/', uploadMultiple('attachments', 10), taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', uploadMultiple('attachments', 10), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
