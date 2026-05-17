const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
  },
  fullDescription: {
    type: String,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCategory',
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  discountPrice: {
    type: Number,
    default: 0,
  },
  duration: {
    type: String,
    trim: true,
  },
  technologies: {
    type: [String],
    default: [],
  },
  features: {
    type: [String],
    default: [],
  },
  featured: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  image: {
    type: String, // Cloudinary URL
    required: [true, 'Main service image is required'],
  },
  gallery: {
    type: [String], // Array of Cloudinary URLs
    default: [],
  },
  portfolioLinks: {
    type: [String],
    default: [],
  },
  metaTitle: {
    type: String,
    trim: true,
  },
  metaDescription: {
    type: String,
    trim: true,
  },
  keywords: {
    type: [String],
    default: [],
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Service', serviceSchema);
