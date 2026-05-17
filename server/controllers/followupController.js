const FollowUp = require('../models/FollowUp');
const asyncHandler = require('express-async-handler');

// @desc    Get all follow-ups
// @route   GET /api/followups
// @access  Private
const getFollowUps = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';

  const query = {};
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const total = await FollowUp.countDocuments(query);
  const followUps = await FollowUp.find(query)
    .populate('assignedTo', 'name email')
    .sort({ followUpDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: followUps,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create new follow-up
// @route   POST /api/followups
// @access  Private
const createFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.create(req.body);
  
  if (req.io) {
    req.io.emit('new_notification', {
      type: 'info',
      title: 'New Follow-up Scheduled',
      message: `Follow-up with ${followUp.customerName} on ${new Date(followUp.followUpDate).toLocaleDateString()}`,
    });
  }

  res.status(201).json({ success: true, data: followUp });
});

// @desc    Update follow-up
// @route   PUT /api/followups/:id
// @access  Private
const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!followUp) {
    res.status(404);
    throw new Error('Follow-up not found');
  }

  res.json({ success: true, data: followUp });
});

// @desc    Delete follow-up
// @route   DELETE /api/followups/:id
// @access  Private
const deleteFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndDelete(req.params.id);

  if (!followUp) {
    res.status(404);
    throw new Error('Follow-up not found');
  }

  res.json({ success: true, data: {} });
});

module.exports = {
  getFollowUps,
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
};
