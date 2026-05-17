const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    default: 'Boffin Web Technology',
  },
  companyLogo: {
    type: String,
    default: '',
  },
  companyEmail: {
    type: String,
    trim: true,
    default: 'contact@boffinweb.com',
  },
  companyPhone: {
    type: String,
    trim: true,
    default: '+91 99999 99999',
  },
  companyAddress: {
    type: String,
    trim: true,
    default: 'Noida, Uttar Pradesh, India',
  },
  website: {
    type: String,
    trim: true,
    default: 'https://boffinweb.com',
  },
  gstNumber: {
    type: String,
    trim: true,
    default: '',
  },
  panNumber: {
    type: String,
    trim: true,
    default: '',
  },
  signature: {
    type: String,
    default: '',
  },
  stamp: {
    type: String,
    default: '',
  },
  themeColor: {
    type: String,
    trim: true,
    default: '#1e3a8a', // Default Navy Blue theme color
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Company', companySchema);
