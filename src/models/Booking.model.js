const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone is required'],
    trim: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required']
  },
  eventType: {
    type: String,
    enum: ['wedding', 'portrait', 'event', 'commercial', 'other'],
    required: [true, 'Event type is required']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  eventLocation: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  eventDuration: {
    type: String,
    required: [true, 'Event duration is required'],
    enum: ['Half Day', 'Full Day', '2 Days', '3 Days', 'Custom']
  },
  guestCount: {
    type: Number,
    min: [1, 'Guest count must be at least 1'],
    max: [5000, 'Guest count cannot exceed 5000']
  },
  budget: {
    type: Number,
    min: [0, 'Budget must be a positive number']
  },
  message: {
    type: String,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    min: [0, 'Total price must be a positive number']
  },
  advancePaid: {
    type: Number,
    default: 0,
    min: [0, 'Advance paid must be a positive number']
  },
  balanceDue: {
    type: Number,
    min: [0, 'Balance due must be a positive number']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  contractSent: {
    type: Boolean,
    default: false
  },
  contractSigned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ status: 1, eventDate: -1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ eventDate: 1 });

// Virtual for balance calculation
bookingSchema.virtual('remainingBalance').get(function() {
  return this.totalPrice - this.advancePaid;
});

module.exports = mongoose.model('Booking', bookingSchema);
