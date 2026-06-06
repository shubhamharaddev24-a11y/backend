const Task = require('../models/Task.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { getFileUrl } = require('../services/upload.service');

// Create task
exports.createTask = asyncHandler(async (req, res, next) => {
  const { title, description, status, priority, assignedTo, dueDate } = req.body;

  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map(file => getFileUrl(file, req));
  }

  const newTask = await Task.create({
    title,
    description,
    status,
    priority,
    assignedTo: assignedTo || null,
    attachments,
    dueDate
  });

  await newTask.populate('assignedTo', 'name email');

  res.status(201).json(
    ApiResponse.created(newTask, 'Task created successfully')
  );
});

// Get all tasks
exports.getAllTasks = asyncHandler(async (req, res, next) => {
  const { status, priority, assignedTo } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;

  const tasks = await Task.find(filter)
    .sort({ createdAt: -1 })
    .populate('assignedTo', 'name email');

  res.status(200).json(
    ApiResponse.success(tasks, 'Tasks retrieved successfully')
  );
});

// Get single task by ID
exports.getTaskById = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id).populate('assignedTo', 'name email');

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  res.status(200).json(
    ApiResponse.success(task, 'Task retrieved successfully')
  );
});

// Update task
exports.updateTask = asyncHandler(async (req, res, next) => {
  let updateData = { ...req.body };

  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map(file => getFileUrl(file, req));
    const existingTask = await Task.findById(req.params.id);
    if (existingTask) {
      updateData.attachments = [...(existingTask.attachments || []), ...newAttachments];
    }
  }

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('assignedTo', 'name email');

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  res.status(200).json(
    ApiResponse.success(task, 'Task updated successfully')
  );
});

// Delete task
exports.deleteTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findByIdAndDelete(req.params.id);

  if (!task) {
    return next(new ApiError(404, 'Task not found'));
  }

  res.status(200).json(
    ApiResponse.success(null, 'Task deleted successfully')
  );
});
