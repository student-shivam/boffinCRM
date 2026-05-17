const Service = require('../models/Service');
const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res) => {
  const { status, category, search, featured } = req.query;
  const query = {};

  if (status) query.status = status;
  if (featured) query.featured = featured === 'true';
  
  if (category) {
    const cat = await ServiceCategory.findOne({ slug: category });
    if (cat) {
      query.category = cat._id;
    }
  }

  if (search) {
    query.serviceName = { $regex: search, $options: 'i' };
  }

  const services = await Service.find(query)
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: services });
});

// @desc    Get service by slug (Public Website Detail Page)
// @route   GET /api/services/:slug
// @access  Public
const getServiceBySlug = asyncHandler(async (req, res) => {
  const service = await Service.findOne({ slug: req.params.slug, status: 'Active' })
    .populate('category', 'name slug');

  if (!service) {
    res.status(404);
    throw new Error('Service not found or is inactive');
  }

  res.json({ success: true, data: service });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res) => {
  const { serviceName } = req.body;
  const slug = slugify(serviceName, { lower: true, strict: true });

  const slugExists = await Service.findOne({ slug });
  if (slugExists) {
    res.status(400);
    throw new Error('A service with a similar name already exists');
  }

  const service = await Service.create({
    ...req.body,
    slug
  });

  res.status(201).json({ success: true, data: service });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  if (req.body.serviceName && req.body.serviceName !== service.serviceName) {
    req.body.slug = slugify(req.body.serviceName, { lower: true, strict: true });
  }

  const updatedService = await Service.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category', 'name slug');

  res.json({ success: true, data: updatedService });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    res.status(404);
    throw new Error('Service not found');
  }

  await service.deleteOne();
  res.json({ success: true, message: 'Service deleted successfully' });
});

// @desc    Get Service Analytics
// @route   GET /api/services/analytics
// @access  Private/Admin
const getServiceAnalytics = asyncHandler(async (req, res) => {
  const [total, active, featured] = await Promise.all([
    Service.countDocuments(),
    Service.countDocuments({ status: 'Active' }),
    Service.countDocuments({ featured: true }),
  ]);

  res.json({
    success: true,
    data: {
      total,
      active,
      featured,
      inactive: total - active
    }
  });
});

module.exports = {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServiceAnalytics
};
