const Invoice = require('../models/Invoice');
const asyncHandler = require('express-async-handler');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Private
const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const status = req.query.status || '';

  const query = {};
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search, $options: 'i' } },
      { clientName: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) query.status = status;

  const total = await Invoice.countDocuments(query);
  const invoices = await Invoice.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: invoices,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
});

// @desc    Create invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = asyncHandler(async (req, res) => {
  // Generate invoice number
  const count = await Invoice.countDocuments();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  
  const invoice = await Invoice.create({
    ...req.body,
    invoiceNumber,
  });

  res.status(201).json({ success: true, data: invoice });
});

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Private
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json({ success: true, data: invoice });
});

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findByIdAndDelete(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  res.json({ success: true, data: {} });
});

// @desc    Download Invoice PDF
// @route   GET /api/invoices/:id/pdf
// @access  Private
const downloadInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (!invoice) {
    res.status(404);
    throw new Error('Invoice not found');
  }

  const doc = new PDFDocument({ margin: 50 });
  const filename = `${invoice.invoiceNumber}.pdf`;

  res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-type', 'application/pdf');

  doc.pipe(res);

  // Header
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('INVOICE', 50, 50)
    .fontSize(10)
    .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 80)
    .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 95)
    .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 110)
    .text(`Status: ${invoice.status}`, 50, 125);

  // Client Details
  doc
    .fontSize(12)
    .text('Bill To:', 300, 80)
    .fontSize(10)
    .text(invoice.clientName, 300, 95);

  doc.moveDown(4);

  // Table Header
  const tableTop = 200;
  doc
    .fontSize(10)
    .text('Description', 50, tableTop)
    .text('Amount', 400, tableTop, { width: 90, align: 'right' });

  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, tableTop + 15)
    .lineTo(500, tableTop + 15)
    .stroke();

  // Table Rows
  let y = tableTop + 25;
  invoice.services.forEach(service => {
    doc
      .fontSize(10)
      .text(service.description, 50, y)
      .text(`Rs. ${service.amount.toFixed(2)}`, 400, y, { width: 90, align: 'right' });
    y += 20;
  });

  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(500, y)
    .stroke();

  // Totals
  doc
    .fontSize(10)
    .text('Subtotal:', 300, y + 15, { width: 90, align: 'right' })
    .text(`Rs. ${invoice.amount.toFixed(2)}`, 400, y + 15, { width: 90, align: 'right' })
    .text('GST:', 300, y + 30, { width: 90, align: 'right' })
    .text(`Rs. ${invoice.gst.toFixed(2)}`, 400, y + 30, { width: 90, align: 'right' })
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Total:', 300, y + 50, { width: 90, align: 'right' })
    .text(`Rs. ${invoice.total.toFixed(2)}`, 400, y + 50, { width: 90, align: 'right' });

  // Footer
  doc
    .fontSize(10)
    .font('Helvetica')
    .text(
      'Thank you for your business.',
      50,
      y + 100,
      { align: 'center', width: 500 }
    );

  doc.end();
});

module.exports = {
  getInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePDF,
};
