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
    required: false
  },
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  claimedAt: {
    type: Date
  },
  eventType: {
    type: String,
    enum: ['wedding', 'pre-wedding', 'portrait', 'event', 'commercial', 'cinematography', 'other'],
    required: [true, 'Event type is required']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventLocation: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  eventDuration: {
    type: String,
    default: 'Full Day',
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
  commissionRate: {
    type: Number,
    default: 10, // 10% platform commission
    min: 0,
    max: 100
  },
  platformFee: {
    type: Number,
    default: 0
  },
  freelancerPayout: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date
  },
  expiryHours: {
    type: Number,
    default: 24 // Default 24 hours expiry
  },
  message: {
    type: String,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['open', 'pending', 'claimed', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'],
    default: 'open'
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

// Auto-calculate fees and expiration before saving
bookingSchema.pre('save', function(next) {
  const price = this.totalPrice || this.budget || 0;
  if (price > 0) {
    const rate = this.commissionRate !== undefined ? this.commissionRate : 10;
    this.platformFee = Math.round((price * rate) / 100);
    this.freelancerPayout = Math.max(0, price - this.platformFee);
    if (!this.totalPrice) this.totalPrice = price;
  }

  if (!this.expiresAt) {
    const hours = this.expiryHours || 24;
    this.expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  }

  next();
});

// Indexes for high performance querying
bookingSchema.index({ status: 1, expiresAt: 1 });
bookingSchema.index({ claimedBy: 1 });
bookingSchema.index({ client: 1 });
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ eventDate: 1 });

// Virtual for balance calculation
bookingSchema.virtual('remainingBalance').get(function() {
  return (this.totalPrice || 0) - (this.advancePaid || 0);
});

module.exports = mongoose.model('Booking', bookingSchema);
