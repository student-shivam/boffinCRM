const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema({
  pageName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  sections: [{
    sectionName: String,
    title: String,
    subtitle: String,
    content: String,
    image: String,
    items: [{
      title: String,
      description: String,
      icon: String,
      image: String,
      link: String,
    }],
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('CMSPage', cmsPageSchema);
