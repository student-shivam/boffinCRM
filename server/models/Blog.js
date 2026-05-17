const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
  },
  excerpt: {
    type: String,
    trim: true,
  },
  featuredImage: {
    type: String,
  },
  tags: [String],
  category: {
    type: String,
    trim: true,
  },
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Draft',
  },
  author: {
    type: String,
    default: 'Admin',
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
