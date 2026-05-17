const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  getServiceAnalytics
} = require('../controllers/serviceController');
const { protect } = require('../middleware/auth');

router.get('/analytics', protect, getServiceAnalytics);

router.route('/')
  .get(getServices)
  .post(protect, createService);

router.route('/:id')
  .put(protect, updateService)
  .delete(protect, deleteService);

router.get('/slug/:slug', getServiceBySlug);

module.exports = router;
