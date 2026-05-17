const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Employee name is required'],
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
  department: {
    type: String,
    enum: ['Development', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Management', 'Support', 'Other'],
    default: 'Development',
  },
  designation: {
    type: String,
    trim: true,
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    default: 0,
  },
  joiningDate: {
    type: Date,
    default: Date.now,
  },
  experience: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  avatar: String,
  documents: [String],
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    accountHolder: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On Leave', 'Terminated'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

employeeSchema.index({ name: 'text', email: 'text', department: 'text' });

module.exports = mongoose.model('Employee', employeeSchema);
