const express = require('express');
const router = express.Router();
const {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getInvoices)
  .post(protect, createInvoice);

router.route('/:id')
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

router.get('/:id/pdf', protect, downloadInvoicePDF);

module.exports = router;
