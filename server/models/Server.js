const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Server name is required'],
    trim: true,
  },
  hostingProvider: {
    type: String,
    trim: true,
  },
  serverIP: {
    type: String,
    trim: true,
  },
  plan: {
    type: String,
    trim: true,
  },
  expiryDate: {
    type: Date,
  },
  renewalCost: {
    type: Number,
    default: 0,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Expired'],
    default: 'Active',
  },
  type: {
    type: String,
    enum: ['Shared', 'VPS', 'Dedicated', 'Cloud', 'Other'],
    default: 'Shared',
  },
  specs: {
    cpu: String,
    ram: String,
    storage: String,
    bandwidth: String,
  },
  credentials: {
    username: String,
    controlPanel: String,
    controlPanelUrl: String,
  },
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Server', serverSchema);
