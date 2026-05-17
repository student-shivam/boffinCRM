const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
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
  message: {
    type: String,
    trim: true,
  },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Other'],
    default: 'Website',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'],
    default: 'New',
  },
  followUpDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  convertedToClient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  notes: [{
    text: String,
    createdAt: { type: Date, default: Date.now },
  }],
  value: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

leadSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', leadSchema);
