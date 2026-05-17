const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { logActivity } = require('../utils/helpers');

const markAttendance = async (req, res) => {
  try {
    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;
    const attendance = await Attendance.findOneAndUpdate(
      { employee: employeeId, date: new Date(date) },
      { status, checkIn, checkOut, notes },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markBulkAttendance = async (req, res) => {
  try {
    const { date, records } = req.body;
    const ops = records.map(r => ({
      updateOne: {
        filter: { employee: r.employeeId, date: new Date(date) },
        update: { status: r.status, checkIn: r.checkIn, checkOut: r.checkOut },
        upsert: true,
      },
    }));
    await Attendance.bulkWrite(ops);
    await logActivity('CREATE', 'Attendance', `Bulk attendance marked for ${records.length} employees`);
    res.json({ success: true, message: 'Attendance marked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDailyAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    const employees = await Employee.find({ status: 'Active' }).select('name department designation');
    const attendance = await Attendance.find({ date: new Date(date) });
    const merged = employees.map(emp => {
      const att = attendance.find(a => a.employee.toString() === emp._id.toString());
      return { employee: emp, status: att?.status || 'Not Marked', checkIn: att?.checkIn, checkOut: att?.checkOut, _id: att?._id };
    });
    res.json({ success: true, data: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    const { employeeId, month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    let query = { date: { $gte: startDate, $lte: endDate } };
    if (employeeId) query.employee = employeeId;
    const attendance = await Attendance.find(query).populate('employee', 'name department');
    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { markAttendance, markBulkAttendance, getDailyAttendance, getMonthlyAttendance };
