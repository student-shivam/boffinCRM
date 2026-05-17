const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
  deadline: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Review', 'Completed', 'Cancelled'],
    default: 'Pending',
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  comments: [{
    text: String,
    author: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now },
  }],
  tags: [String],
  attachments: [String],
  project: String,
}, {
  timestamps: true,
});

taskSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Task', taskSchema);
