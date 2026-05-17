const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  transactionId: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Completed', 'Pending', 'Failed', 'Refunded'],
    default: 'Completed',
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

paymentSchema.index({ clientName: 'text', transactionId: 'text' });

module.exports = mongoose.model('Payment', paymentSchema);
