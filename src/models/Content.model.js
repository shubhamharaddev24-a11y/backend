const mongoose = require('mongoose');

const ContentSectionSchema = new mongoose.Schema(
  {
    sectionKey: {
      type: String,
      required: true,
      unique: true,
      enum: ['hero_slides', 'portfolio_items', 'services_list', 'testimonials', 'studio_info', 'home_showcase_portraits'],
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    items: [
      {
        id: { type: String },
        title: { type: String, default: '' },
        subtitle: { type: String, default: '' },
        description: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        category: { type: String, default: '' },
        videoUrl: { type: String, default: '' },
        rating: { type: Number, default: 5 },
        date: { type: String, default: '' },
        location: { type: String, default: '' },
        width: { type: String, default: '100%' },
        height: { type: String, default: 'auto' },
        aspectRatio: { type: String, default: 'auto' },
        objectFit: { type: String, default: 'cover' },
        objectPosition: { type: String, default: 'center 20%' },
        link: { type: String, default: '' },
        points: [{ type: String }],
        themeColor: { type: String, default: '#A67C6B' },
        shadowColor: { type: String, default: 'rgba(166, 124, 107, 0.2)' },
      },
    ],
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ContentSection', ContentSectionSchema);
