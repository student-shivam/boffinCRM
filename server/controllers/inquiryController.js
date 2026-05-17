const Inquiry = require('../models/Inquiry');
const Lead = require('../models/Lead');
const asyncHandler = require('express-async-handler');

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private
const getInquiries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const source = req.query.source || '';
  const status = req.query.status || '';

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  if (source) query.source = source;
  if (status) query.status = status;

  const total = await Inquiry.countDocuments(query);
  const inquiries = await Inquiry.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: inquiries,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private
const createInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.create(req.body);
  
  if (req.io) {
    req.io.emit('new_notification', {
      type: 'info',
      title: 'New Inquiry',
      message: `${inquiry.name} submitted an inquiry via ${inquiry.source}`,
    });
  }

  res.status(201).json({ success: true, data: inquiry });
});

// @desc    Update inquiry
// @route   PUT /api/inquiries/:id
// @access  Private
const updateInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.json({ success: true, data: inquiry });
});

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  res.json({ success: true, data: {} });
});

// @desc    Convert inquiry to lead
// @route   POST /api/inquiries/:id/convert
// @access  Private
const convertToLead = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findById(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error('Inquiry not found');
  }

  if (inquiry.status === 'Converted') {
    res.status(400);
    throw new Error('Inquiry is already converted to a lead');
  }

  const lead = await Lead.create({
    name: inquiry.name,
    email: inquiry.email,
    phone: inquiry.phone,
    company: inquiry.company,
    message: inquiry.message,
    source: inquiry.source,
    status: 'New',
  });

  inquiry.status = 'Converted';
  await inquiry.save();

  if (req.io) {
    req.io.emit('new_notification', {
      type: 'lead',
      title: 'Inquiry Converted',
      message: `${inquiry.name} was converted to a Lead`,
    });
  }

  res.json({ success: true, data: lead });
});

module.exports = {
  getInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  convertToLead,
};
