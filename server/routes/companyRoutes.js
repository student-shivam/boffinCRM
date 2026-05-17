const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getCompanyDetails, updateCompanyDetails } = require('../controllers/companyController');

// All company routes are protected with JWT
router.route('/')
  .get(protect, getCompanyDetails)
  .put(protect, updateCompanyDetails);

module.exports = router;
