const ActivityLog = require('../models/ActivityLog');

// Create activity log
const logActivity = async (action, module, description, metadata = {}) => {
  try {
    await ActivityLog.create({
      action,
      module,
      description,
      performedBy: 'Admin',
      metadata,
    });
  } catch (error) {
    console.error('Activity log error:', error.message);
  }
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

// Get month name
const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1];
};

// Pagination helper
const getPagination = (page = 1, limit = 10) => {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
};

module.exports = { logActivity, formatCurrency, getMonthName, getPagination };
