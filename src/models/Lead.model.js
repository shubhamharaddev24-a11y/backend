const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: false,
    default: '',
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  service: {
    type: String,
    required: false,
    default: 'General Inquiry',
    enum: [
      'Wedding photography & video',
      'Pre-wedding shoot',
      'Passport photos / prints',
      'Wedding cards (लग्नपत्रिका)',
      'Banners / flex / posters',
      'DTP / biodata / CV',
      'Other studio service',
      'General Inquiry',
      ''
    ]
  },
  preferredDate: {
    type: Date,
    required: false,
  },
  message: {
    type: String,
    required: false,
    default: '',
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'referral', 'social'],
    default: 'website'
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
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });

module.exports = mongoose.model('Lead', leadSchema);