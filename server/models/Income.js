const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
    default: 'Bank Transfer',
  },
  category: {
    type: String,
    enum: ['Client Payment', 'Subscription', 'Service Payment', 'Other Income'],
    default: 'Client Payment',
  },
  description: {
    type: String,
    trim: true,
  },
  transactionId: {
    type: String,
    trim: true,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed'],
    default: 'Completed',
  },
}, {
  timestamps: true,
});

incomeSchema.index({ clientName: 'text', transactionId: 'text' });

module.exports = mongoose.model('Income', incomeSchema);
