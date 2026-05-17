const Client = require('../models/Client');
const { logActivity, getPagination } = require('../utils/helpers');

// @desc    Get all clients
// @route   GET /api/clients
const getClients = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { search, status, sort } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'newest') sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: clients,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create client
// @route   POST /api/clients
const createClient = async (req, res) => {
  try {
    const client = await Client.create(req.body);
    await logActivity('CREATE', 'Client', `Client "${client.name}" created`);
    res.status(201).json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    await logActivity('UPDATE', 'Client', `Client "${client.name}" updated`);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete client
// @route   DELETE /api/clients/:id
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    await logActivity('DELETE', 'Client', `Client "${client.name}" deleted`);
    res.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add note to client
// @route   POST /api/clients/:id/notes
const addNote = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    client.notes.push({ text: req.body.text });
    await client.save();
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add payment to client
// @route   POST /api/clients/:id/payments
const addPayment = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    client.paymentHistory.push(req.body);
    await client.save();
    await logActivity('CREATE', 'Client', `Payment added to client "${client.name}"`);
    res.json({ success: true, data: client });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient, addNote, addPayment };
