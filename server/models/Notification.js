const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'lead', 'task', 'domain', 'salary', 'expense'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
  },
  icon: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
