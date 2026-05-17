const Client = require('../models/Client');
const Lead = require('../models/Lead');
const Employee = require('../models/Employee');
const Income = require('../models/Income');
const Expense = require('../models/Expense');
const ExcelJS = require('exceljs');
const { logActivity } = require('../utils/helpers');

const getFinancialReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let incomeMatch = {};
    let expenseMatch = {};
    
    if (startDate && endDate) {
      incomeMatch = { paymentDate: { $gte: new Date(startDate), $lte: new Date(endDate) } };
      expenseMatch = { expenseDate: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    }

    // Category breakdown
    const [incomeByCategory, expenseByCategory] = await Promise.all([
      Income.aggregate([
        { $match: incomeMatch },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
      Expense.aggregate([
        { $match: expenseMatch },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }
      ]),
    ]);

    const totalIncome = incomeByCategory.reduce((s, i) => s + i.total, 0);
    const totalExpense = expenseByCategory.reduce((s, e) => s + e.total, 0);

    // Monthly aggregation for charts - using the same date filter
    const monthlyRevenue = await Income.aggregate([
      { $match: incomeMatch },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    const monthlyExpenses = await Expense.aggregate([
      { $match: expenseMatch },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          expense: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format for Recharts (All 12 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = months.map((month, index) => {
      const inc = monthlyRevenue.find(r => r._id === index + 1);
      const exp = monthlyExpenses.find(e => e._id === index + 1);
      return {
        name: month,
        income: inc ? inc.revenue : 0,
        expense: exp ? exp.expense : 0,
        profit: (inc ? inc.revenue : 0) - (exp ? exp.expense : 0)
      };
    });

    res.json({ 
      success: true, 
      data: { 
        income: incomeByCategory, 
        expenses: expenseByCategory, 
        totalIncome, 
        totalExpense, 
        profit: totalIncome - totalExpense,
        chartData
      } 
    });
  } catch (error) {
    console.error('Report Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const exportExcel = async (req, res) => {
  try {
    const { type } = req.params;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(type);

    let data = [];
    if (type === 'income') {
      data = await Income.find().lean();
      sheet.columns = [
        { header: 'Client Name', key: 'clientName', width: 25 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Date', key: 'paymentDate', width: 15 },
      ];
    } else if (type === 'expenses') {
      data = await Expense.find().lean();
      sheet.columns = [
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Payment Method', key: 'paymentMethod', width: 15 },
        { header: 'Date', key: 'expenseDate', width: 15 },
      ];
    } else if (type === 'clients') {
      data = await Client.find().lean();
      sheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Company', key: 'company', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
      ];
    } else if (type === 'leads') {
      data = await Lead.find().lean();
      sheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Source', key: 'source', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
      ];
    } else if (type === 'employees') {
      data = await Employee.find().lean();
      sheet.columns = [
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Department', key: 'department', width: 20 },
        { header: 'Designation', key: 'designation', width: 20 },
      ];
    }

    data.forEach(item => sheet.addRow(item));
    await logActivity('EXPORT', 'Report', `${type} exported as Excel`);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFinancialReport, exportExcel };
