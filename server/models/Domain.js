const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  domainName: {
    type: String,
    required: [true, 'Domain name is required'],
    trim: true,
    unique: true,
  },
  provider: {
    type: String,
    trim: true,
  },
  registrationDate: {
    type: Date,
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  sslExpiry: {
    type: Date,
  },
  renewalCost: {
    type: Number,
    default: 0,
  },
  autoRenew: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Expiring Soon', 'Transferred'],
    default: 'Active',
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
  },
  nameservers: [String],
  notes: String,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Domain', domainSchema);
