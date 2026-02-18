const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Register user
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ApiError(400, 'User with this email already exists'));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password,
  });

  // Generate token
  const token = signToken(newUser._id);

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json(
    ApiResponse.created({
      token,
      user: newUser
    }, 'User registered successfully')
  );
});

// Login user
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide email and password'));
  }

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new ApiError(401, 'Incorrect email or password'));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  res.status(200).json(
    ApiResponse.success({
      token,
      user
    }, 'Login successful')
  );
});

// Get current user
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json(
    ApiResponse.success(user, 'User retrieved successfully')
  );
});

// Update password
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new ApiError(401, 'Current password is incorrect'));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json(
    ApiResponse.success(null, 'Password updated successfully')
  );
});

// Logout
exports.logout = asyncHandler(async (req, res, next) => {
  // In a real implementation, you might want to blacklist the token
  // For now, we'll just send a success response
  res.status(200).json(
    ApiResponse.success(null, 'Logout successful')
  );
});

// Get all users (admin)
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({ isActive: true }).select('-password');

  res.status(200).json(
    ApiResponse.success(users, 'Users retrieved successfully')
  );
});

// Delete user (admin)
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'User not found'));
  }

  res.status(200).json(
    ApiResponse.success(null, 'User deleted successfully')
  );
});
