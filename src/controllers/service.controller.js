const Service = require('../models/Service.model');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Create service
exports.createService = asyncHandler(async (req, res, next) => {
  const serviceData = {
    ...req.body,
    createdBy: req.user.id
  };

  const newService = await Service.create(serviceData);

  res.status(201).json(
    ApiResponse.created(newService, 'Service created successfully')
  );
});

// Get all services
exports.getAllServices = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, category, sortBy = 'sortOrder' } = req.query;

  const filter = { isActive: true };
  if (category) {
    filter.category = category;
  }

  const skip = (page - 1) * limit;

  const services = await Service.find(filter)
    .sort({ [sortBy]: 1, name: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('name description category price duration features images includes deliveryTime tags');

  const total = await Service.countDocuments(filter);

  res.status(200).json(
    ApiResponse.success({
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }, 'Services retrieved successfully')
  );
});

// Get service by ID
exports.getServiceById = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ApiError(404, 'Service not found'));
  }

  res.status(200).json(
    ApiResponse.success(service, 'Service retrieved successfully')
  );
});

// Update service
exports.updateService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!service) {
    return next(new ApiError(404, 'Service not found'));
  }

  res.status(200).json(
    ApiResponse.success(service, 'Service updated successfully')
  );
});

// Delete service
exports.deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    return next(new ApiError(404, 'Service not found'));
  }

  res.status(200).json(
    ApiResponse.success(null, 'Service deleted successfully')
  );
});

// Toggle service active status
exports.toggleServiceActive = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ApiError(404, 'Service not found'));
  }

  service.isActive = !service.isActive;
  await service.save();

  res.status(200).json(
    ApiResponse.success(service, `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`)
  );
});

// Get service categories
exports.getServiceCategories = asyncHandler(async (req, res, next) => {
  const categories = await Service.distinct('category', { isActive: true });

  res.status(200).json(
    ApiResponse.success(categories, 'Service categories retrieved successfully')
  );
});
