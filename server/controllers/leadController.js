const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Notification = require('../models/Notification');
const { logActivity, getPagination } = require('../utils/helpers');

// @desc    Get all leads
// @route   GET /api/leads
const getLeads = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { search, status, source, sort } = req.query;

    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) query.status = status;
    if (source) query.source = source;

    let sortOption = { createdAt: -1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'followUp') sortOption = { followUpDate: 1 };
    if (sort === 'priority') sortOption = { priority: -1 };

    const total = await Lead.countDocuments(query);
    const leads = await Lead.find(query)
      .populate('assignedTo', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create lead
// @route   POST /api/leads
const createLead = async (req, res) => {
  try {
    const lead = await Lead.create(req.body);
    await logActivity('CREATE', 'Lead', `Lead "${lead.name}" created from ${lead.source}`);

    // Create notification for new lead
    await Notification.create({
      title: 'New Lead',
      message: `New lead "${lead.name}" from ${lead.source}`,
      type: 'lead',
      link: `/leads`,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit('newNotification', {
        title: 'New Lead',
        message: `New lead "${lead.name}" from ${lead.source}`,
        type: 'lead',
      });
    }

    res.status(201).json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
const updateLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    await logActivity('UPDATE', 'Lead', `Lead "${lead.name}" updated`);
    res.json({ success: true, data: lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    await logActivity('DELETE', 'Lead', `Lead "${lead.name}" deleted`);
    res.json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Convert lead to client
// @route   POST /api/leads/:id/convert
const convertToClient = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const client = await Client.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      status: 'Active',
    });

    lead.status = 'Converted';
    lead.convertedToClient = client._id;
    await lead.save();

    await logActivity('STATUS_CHANGE', 'Lead', `Lead "${lead.name}" converted to client`);

    res.json({ success: true, data: { lead, client } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, deleteLead, convertToClient };
