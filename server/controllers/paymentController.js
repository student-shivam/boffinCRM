const Payment = require('../models/Payment');
const asyncHandler = require('express-async-handler');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';
  
  const query = {};
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const total = await Payment.countDocuments(query);
  const payments = await Payment.find(query)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: payments,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create(req.body);
  res.status(201).json({ success: true, data: payment });
});

// @desc    Update payment
// @route   PUT /api/payments/:id
// @access  Private
const updatePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({ success: true, data: payment });
});

// @desc    Delete payment
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = asyncHandler(async (req, res) => {
  const payment = await Payment.findByIdAndDelete(req.params.id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  res.json({ success: true, data: {} });
});

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
};
