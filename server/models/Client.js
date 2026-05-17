const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Client name is required'],
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
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Active',
  },
  projects: [{
    name: String,
    description: String,
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
      default: 'Planning',
    },
    startDate: Date,
    endDate: Date,
    budget: Number,
  }],
  notes: [{
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  paymentHistory: [{
    amount: Number,
    date: { type: Date, default: Date.now },
    method: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
    },
    description: String,
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Overdue'],
      default: 'Paid',
    },
  }],
  avatar: String,
  documents: [String],
}, {
  timestamps: true,
});

clientSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Client', clientSchema);
