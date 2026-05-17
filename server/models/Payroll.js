const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  employeeName: {
    type: String,
    required: true,
    trim: true
  },
  employeePhoto: {
    type: String,
    default: ''
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  basicSalary: {
    type: Number,
    required: true,
    default: 0
  },
  allowances: {
    type: Number,
    required: true,
    default: 0
  },
  deductions: {
    type: Number,
    required: true,
    default: 0
  },
  grossSalary: {
    type: Number,
    required: true,
    default: 0
  },
  netSalary: {
    type: Number,
    required: true,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Processing'],
    default: 'Pending'
  },
  paymentDate: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cash', 'UPI', 'Cheque', 'Other'],
    default: 'Bank Transfer'
  },
  remarks: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Avoid duplicate slips for the same employee, month, and year
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
