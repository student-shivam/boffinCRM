const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  category: {
    type: String,
    enum: ['Salary', 'Hosting', 'Domain', 'Office Rent', 'Marketing', 'Software', 'Internet', 'Other'],
    default: 'Other',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'],
    default: 'Bank Transfer',
  },
  description: {
    type: String,
    trim: true,
  },
  expenseDate: {
    type: Date,
    default: Date.now,
  },
  receipt: {
    type: String, // URL from cloudinary or local uploads
  },
}, {
  timestamps: true,
});

expenseSchema.index({ title: 'text', category: 'text' });

module.exports = mongoose.model('Expense', expenseSchema);
