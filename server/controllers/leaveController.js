const Leave = require('../models/Leave');
const { logActivity, getPagination } = require('../utils/helpers');

const getLeaves = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { status, employeeId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;
    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query).populate('employee', 'name department').sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, data: leaves, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createLeave = async (req, res) => {
  try {
    const leave = await Leave.create(req.body);
    await logActivity('CREATE', 'Leave', `Leave request created`);
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLeaveStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status, remarks }, { new: true }).populate('employee', 'name');
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    await logActivity('STATUS_CHANGE', 'Leave', `Leave ${status} for ${leave.employee?.name}`);
    res.json({ success: true, data: leave });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    res.json({ success: true, message: 'Leave deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaves, createLeave, updateLeaveStatus, deleteLeave };
