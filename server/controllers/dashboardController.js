const Client = require('../models/Client');
const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const Salary = require('../models/Salary');
const Task = require('../models/Task');
const Domain = require('../models/Domain');
const ServerModel = require('../models/Server');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);

    const [
      totalClients,
      activeClients,
      totalLeads,
      newLeads,
      totalEmployees,
      totalIncome,
      monthlyIncome,
      totalExpenses,
      monthlyExpenses,
      pendingSalaries,
      pendingTasks,
      expiringDomains,
      expiringServers,
      unreadNotifications,
    ] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ status: 'Active' }),
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'New' }),
      Employee.countDocuments({ status: 'Active' }),
      Income.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([
        { $match: { paymentDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Salary.countDocuments({ status: 'Pending', month: currentMonth, year: currentYear }),
      Task.countDocuments({ status: { $in: ['Pending', 'In Progress'] } }),
      Domain.countDocuments({ expiryDate: { $lte: thirtyDaysFromNow, $gte: now } }),
      ServerModel.countDocuments({ expiryDate: { $lte: thirtyDaysFromNow, $gte: now } }),
      Notification.countDocuments({ read: false }),
    ]);

    const totalIncomeAmount = totalIncome[0]?.total || 0;
    const monthlyIncomeAmount = monthlyIncome[0]?.total || 0;
    const totalExpenseAmount = totalExpenses[0]?.total || 0;
    const monthlyExpenseAmount = monthlyExpenses[0]?.total || 0;

    // Monthly revenue data for chart (last 6 months)
    const sixMonthsAgo = new Date(currentYear, currentMonth - 7, 1);
    const revenueData = await Income.aggregate([
      { $match: { paymentDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const expenseData = await Expense.aggregate([
      { $match: { expenseDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { month: { $month: '$expenseDate' }, year: { $year: '$expenseDate' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Lead source distribution
    const leadSources = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]);

    // Task status distribution
    const taskStatus = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalClients,
          activeClients,
          totalLeads,
          newLeads,
          totalEmployees,
          totalIncome: totalIncomeAmount,
          monthlyIncome: monthlyIncomeAmount,
          totalExpenses: totalExpenseAmount,
          monthlyExpenses: monthlyExpenseAmount,
          totalProfit: totalIncomeAmount - totalExpenseAmount,
          monthlyProfit: monthlyIncomeAmount - monthlyExpenseAmount,
          pendingSalaries,
          pendingTasks,
          expiringDomains,
          expiringServers,
          unreadNotifications,
        },
        charts: {
          revenueData,
          expenseData,
          leadSources,
          taskStatus,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
const getRecentActivities = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getRecentActivities };
