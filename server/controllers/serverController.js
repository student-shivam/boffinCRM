const ServerModel = require('../models/Server');
const { logActivity, getPagination } = require('../utils/helpers');

const getServers = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { search, status } = req.query;
    let query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (status) query.status = status;
    const total = await ServerModel.countDocuments(query);
    const servers = await ServerModel.find(query).populate('client', 'name').sort({ expiryDate: 1 }).skip(skip).limit(limit);
    res.json({ success: true, data: servers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createServer = async (req, res) => {
  try {
    const server = await ServerModel.create(req.body);
    await logActivity('CREATE', 'Server', `Server "${server.name}" added`);
    res.status(201).json({ success: true, data: server });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateServer = async (req, res) => {
  try {
    const server = await ServerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    await logActivity('UPDATE', 'Server', `Server "${server.name}" updated`);
    res.json({ success: true, data: server });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteServer = async (req, res) => {
  try {
    const server = await ServerModel.findByIdAndDelete(req.params.id);
    if (!server) return res.status(404).json({ success: false, message: 'Server not found' });
    await logActivity('DELETE', 'Server', `Server "${server.name}" deleted`);
    res.json({ success: true, message: 'Server deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getServers, createServer, updateServer, deleteServer };
