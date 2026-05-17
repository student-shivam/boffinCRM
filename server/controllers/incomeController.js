const Income = require('../models/Income');
const asyncHandler = require('express-async-handler');

// @desc    Get all income
// @route   GET /api/income
// @access  Private
const getIncome = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const query = {};
  if (search) {
    query.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
    ];
  }
  if (category) query.category = category;
  
  if (startDate && endDate) {
    query.paymentDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const total = await Income.countDocuments(query);
  const incomeRecords = await Income.find(query)
    .sort({ paymentDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: incomeRecords,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create income
// @route   POST /api/income
// @access  Private
const createIncome = asyncHandler(async (req, res) => {
  const income = await Income.create(req.body);
  res.status(201).json({ success: true, data: income });
});

// @desc    Update income
// @route   PUT /api/income/:id
// @access  Private
const updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!income) {
    res.status(404);
    throw new Error('Income record not found');
  }

  res.json({ success: true, data: income });
});

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findByIdAndDelete(req.params.id);

  if (!income) {
    res.status(404);
    throw new Error('Income record not found');
  }

  res.json({ success: true, data: {} });
});

module.exports = {
  getIncome,
  createIncome,
  updateIncome,
  deleteIncome,
};
