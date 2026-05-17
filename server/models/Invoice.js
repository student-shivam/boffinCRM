const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: [true, 'Invoice number is required'],
    unique: true,
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true,
  },
  services: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true }
  }],
  amount: {
    type: Number,
    required: true,
  },
  gst: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Overdue'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

invoiceSchema.index({ invoiceNumber: 'text', clientName: 'text' });

module.exports = mongoose.model('Invoice', invoiceSchema);
