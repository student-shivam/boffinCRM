const express = require('express');
const router = express.Router();
const {
  getInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  convertToLead,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getInquiries)
  .post(protect, createInquiry);

router.route('/:id')
  .put(protect, updateInquiry)
  .delete(protect, deleteInquiry);

router.post('/:id/convert', protect, convertToLead);

module.exports = router;
