const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: ['photography', 'videography', 'digital', 'printing'],
    required: [true, 'Service category is required']
  },
  price: {
    type: Number,
    required: [true, 'Service price is required'],
    min: [0, 'Price must be a positive number']
  },
  duration: {
    type: String,
    required: [true, 'Service duration is required'],
    enum: ['1 Hour', '2 Hours', 'Half Day', 'Full Day', 'Custom']
  },
  features: [{
    type: String,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      maxlength: [200, 'Caption cannot exceed 200 characters']
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  }],
  includes: [{
    type: String,
    maxlength: [200, 'Include item cannot exceed 200 characters']
  }],
  deliveryTime: {
    type: String,
    required: [true, 'Delivery time is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
serviceSchema.index({ category: 1, isActive: 1, sortOrder: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ tags: 1 });

module.exports = mongoose.model('Service', serviceSchema);
