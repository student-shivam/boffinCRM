const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  followUpDate: {
    type: Date,
    required: [true, 'Follow-up date is required'],
  },
  followUpTime: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Rescheduled', 'Missed'],
    default: 'Pending',
  },
  notes: {
    type: String,
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
}, {
  timestamps: true,
});

followUpSchema.index({ customerName: 'text', phone: 'text' });

module.exports = mongoose.model('FollowUp', followUpSchema);
