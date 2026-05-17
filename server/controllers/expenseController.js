const Expense = require('../models/Expense');
const asyncHandler = require('express-async-handler');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const query = {};
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }
  if (category) query.category = category;
  
  if (startDate && endDate) {
    query.expenseDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const total = await Expense.countDocuments(query);
  const expenseRecords = await Expense.find(query)
    .sort({ expenseDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: expenseRecords,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create expense
// @route   POST /api/expenses
// @access  Private
const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create(req.body);
  res.status(201).json({ success: true, data: expense });
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!expense) {
    res.status(404);
    throw new Error('Expense record not found');
  }

  res.json({ success: true, data: expense });
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);

  if (!expense) {
    res.status(404);
    throw new Error('Expense record not found');
  }

  res.json({ success: true, data: {} });
});

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
