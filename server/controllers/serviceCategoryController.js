const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

// @desc    Get all service categories
// @route   GET /api/service-categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await ServiceCategory.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
});

// @desc    Create a service category
// @route   POST /api/service-categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  
  const slug = slugify(name, { lower: true, strict: true });
  
  const categoryExists = await ServiceCategory.findOne({ slug });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category name already exists');
  }

  const category = await ServiceCategory.create({
    name,
    slug,
    description,
    status
  });

  res.status(201).json({ success: true, data: category });
});

// @desc    Update a service category
// @route   PUT /api/service-categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, status } = req.body;
  const category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  if (name) {
    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });
  }
  if (description !== undefined) category.description = description;
  if (status) category.status = status;

  await category.save();
  res.json({ success: true, data: category });
});

// @desc    Delete a service category
// @route   DELETE /api/service-categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category removed' });
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
