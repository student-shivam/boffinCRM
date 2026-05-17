const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Inquiry name is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Facebook', 'Instagram', 'WhatsApp', 'Other'],
    default: 'Website',
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Interested', 'Converted', 'Closed'],
    default: 'New',
  },
}, {
  timestamps: true,
});

inquirySchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Inquiry', inquirySchema);
