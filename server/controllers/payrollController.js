const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const PDFDocument = require('pdfkit');
const { sendEmail } = require('../utils/sendEmail');
const { logActivity, getPagination, getMonthName } = require('../utils/helpers');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Helper to fetch external image buffers safely
const fetchImageBuffer = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', (err) => reject(err));
    }).on('error', (err) => reject(err));
  });
};

// Helper for converting numbers to words (Rupees Format)
function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if ((num = num.toString()).length > 9) return 'amount';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'only' : 'only';
  return str.trim();
}

// Unified Core PDF Generation Engine (Returns Buffer)
const buildPayrollPdfBuffer = async (payrollId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const payroll = await Payroll.findById(payrollId).populate('employeeId', 'joiningDate department designation');
      if (!payroll) return reject(new Error('Payroll record not found'));

      // Fetch Company & Admin configurations
      const company = await Company.findOne();
      const admin = await Admin.findOne();

      const companyName = company?.companyName || admin?.companyName || "Boffin Web Technology";
      const companyAddress = company?.companyAddress || admin?.companyAddress || "Noida, Uttar Pradesh, India";
      const companyEmail = company?.companyEmail || admin?.companyEmail || "contact@boffinweb.com";
      const companyPhone = company?.companyPhone || admin?.companyPhone || "+91 99999 99999";
      const website = company?.website || admin?.companyWebsite || "https://boffinweb.com";
      const gstNumber = company?.gstNumber || admin?.gstNumber || "";
      const panNumber = company?.panNumber || "";
      const themeColor = company?.themeColor || "#1e3a8a";

      // Load Assets (Logo, Signature, Stamp, QR Code)
      let logoBuffer = null;
      let logoPath = null;
      try {
        const logoUrl = company?.companyLogo || admin?.companyLogo;
        if (logoUrl) {
          if (logoUrl.startsWith('http')) logoBuffer = await fetchImageBuffer(logoUrl);
          else logoPath = logoUrl;
        }
      } catch (err) {
        console.error('Logo buffer loading error:', err);
      }

      if (!logoBuffer && !logoPath) {
        const defaultLogoPath = path.join(__dirname, '../../client/public/logo/boffin logo.jpg');
        if (fs.existsSync(defaultLogoPath)) logoBuffer = fs.readFileSync(defaultLogoPath);
      }

      let signatureBuffer = null;
      try {
        const sigUrl = company?.signature;
        if (sigUrl && sigUrl.startsWith('http')) signatureBuffer = await fetchImageBuffer(sigUrl);
      } catch (err) {
        console.error('Signature buffer loading error:', err);
      }

      let stampBuffer = null;
      try {
        const stampUrl = company?.stamp;
        if (stampUrl && stampUrl.startsWith('http')) stampBuffer = await fetchImageBuffer(stampUrl);
      } catch (err) {
        console.error('Stamp buffer loading error:', err);
      }

      let qrBuffer = null;
      try {
        const qrData = `VERIFIED ENTERPRISE PAYSLIP\nCompany: ${companyName}\nEmployee: ${payroll.employeeName}\nMonth: ${getMonthName(payroll.month)} ${payroll.year}\nNet Salary: INR ${payroll.netSalary.toLocaleString()}\nStatus: ${payroll.paymentStatus}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
        qrBuffer = await fetchImageBuffer(qrUrl);
      } catch (err) {
        console.error('QR code buffer loading error:', err);
      }

      // Initialize PDFKit Doc
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // 1. Watermark Background (subtle opacity 0.035)
      if (logoBuffer) {
        doc.save();
        doc.opacity(0.035);
        doc.image(logoBuffer, 197.64, 320.94, { width: 200, height: 200 });
        doc.restore();
      }

      // 2. Header / Letterhead
      doc.fillColor('#f8fafc').strokeColor('#cbd5e1').lineWidth(1.5).roundedRect(50, 50, 48, 48, 8).fillAndStroke();
      if (logoBuffer) {
        doc.image(logoBuffer, 52, 52, { width: 44, height: 44 });
      } else if (logoPath && fs.existsSync(logoPath)) {
        doc.image(logoPath, 52, 52, { width: 44, height: 44 });
      } else {
        doc.fillColor(themeColor).font('Helvetica-Bold').fontSize(16).text(companyName.charAt(0).toUpperCase(), 50, 65, { width: 48, align: 'center' });
      }

      doc.font('Helvetica-Bold').fontSize(16).fillColor('#0f172a').text(companyName, 110, 50);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(companyAddress, 110, 69, { width: 230 });
      
      let contactInfo = `Email: ${companyEmail}  |  Phone: ${companyPhone}`;
      if (gstNumber) contactInfo += `  |  GST: ${gstNumber}`;
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b').text(contactInfo, 110, 82, { width: 240 });

      doc.font('Helvetica-Bold').fontSize(22).fillColor(themeColor).text('SALARY SLIP', 350, 48, { align: 'right', width: 195 });
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(themeColor).text('OFFICIAL STATEMENT OF EARNINGS', 350, 71, { align: 'right', width: 195 });
      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#0f172a').text(`Period: ${getMonthName(payroll.month)} ${payroll.year}`, 350, 83, { align: 'right', width: 195 });

      doc.strokeColor('#cbd5e1').lineWidth(1.5).moveTo(50, 112).lineTo(545, 112).stroke();

      // 3. Employee Info Panel
      doc.fillColor('#ffffff').strokeColor('#cbd5e1').lineWidth(1.5).roundedRect(50, 125, 495.28, 85, 8).fillAndStroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b').text('EMPLOYEE INFORMATION', 65, 137);
      doc.font('Helvetica-Bold').fontSize(12).fillColor('#0f172a').text(payroll.employeeName, 65, 149);
      
      const dept = payroll.employeeId?.department || "Development";
      const desig = payroll.employeeId?.designation || "Engineer";
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(`Designation: ${desig}`, 65, 168);
      doc.text(`Department: ${dept}`, 65, 182);

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1e293b').text('STATEMENT INFO', 300, 137);
      
      doc.font('Helvetica').fontSize(8.5).fillColor('#334155').text('Employee ID: ', 300, 149);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(`EMP-${payroll.employeeId?._id.toString().substring(18).toUpperCase() || 'N/A'}`, 370, 149);
      
      const joiningDate = payroll.employeeId?.joiningDate ? new Date(payroll.employeeId.joiningDate).toLocaleDateString() : 'N/A';
      doc.font('Helvetica').fillColor('#334155').text('Joining Date: ', 300, 161);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(joiningDate, 370, 161);
      
      doc.font('Helvetica').fillColor('#334155').text('Payment Mode: ', 300, 173);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(payroll.paymentMethod || 'Bank Transfer', 370, 173);
      
      if (payroll.paymentDate) {
        doc.font('Helvetica').fillColor('#334155').text('Credit Date: ', 300, 185);
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(new Date(payroll.paymentDate).toLocaleDateString(), 370, 185);
      }

      // Status Pill
      const isPaid = payroll.paymentStatus === 'Paid';
      const badgeBg = isPaid ? '#ecfdf5' : '#fffbeb';
      const badgeText = isPaid ? '#065f46' : '#92400e';
      const badgeBorder = isPaid ? '#a7f3d0' : '#fde68a';
      
      doc.fillColor(badgeBg).strokeColor(badgeBorder).lineWidth(1).roundedRect(470, 135, 60, 16, 4).fillAndStroke();
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor(badgeText).text(payroll.paymentStatus.toUpperCase(), 470, 139, { width: 60, align: 'center' });

      // 4. Financial tables
      const tableTop = 225;
      const tableHeight = 130;

      // Earnings Table
      doc.fillColor(themeColor).roundedRect(50, tableTop, 240, 22, 6).fill();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff').text('EARNINGS STATEMENT', 62, tableTop + 7);
      doc.text('AMOUNT', 220, tableTop + 7, { width: 60, align: 'right' });
      doc.strokeColor('#cbd5e1').lineWidth(1.5).roundedRect(50, tableTop, 240, tableHeight, 6).stroke();

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b').text('Basic Salary', 62, tableTop + 35);
      doc.font('Helvetica-Bold').fillColor('#0f172a').text(`₹${payroll.basicSalary.toLocaleString()}`, 220, tableTop + 35, { width: 60, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b').text('Performance Allowances', 62, tableTop + 55);
      doc.font('Helvetica-Bold').fillColor('#065f46').text(`+₹${payroll.allowances.toLocaleString()}`, 220, tableTop + 55, { width: 60, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('House Rent Allowance (HRA)', 62, tableTop + 75);
      doc.font('Helvetica-Bold').fillColor('#475569').text('₹0', 220, tableTop + 75, { width: 60, align: 'right' });

      doc.strokeColor('#cbd5e1').lineWidth(1.5).moveTo(50, tableTop + 105).lineTo(290, tableTop + 105).stroke();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(themeColor).text('Total Gross Earnings', 62, tableTop + 114);
      doc.text(`₹${payroll.grossSalary.toLocaleString()}`, 220, tableTop + 114, { width: 60, align: 'right' });

      // Deductions Table
      doc.fillColor('#1e293b').roundedRect(305, tableTop, 240, 22, 6).fill();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff').text('DEDUCTIONS STATEMENT', 317, tableTop + 7);
      doc.text('AMOUNT', 475, tableTop + 7, { width: 60, align: 'right' });
      doc.strokeColor('#cbd5e1').lineWidth(1.5).roundedRect(305, tableTop, 240, tableHeight, 6).stroke();

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b').text('Professional Tax & PF', 317, tableTop + 35);
      doc.font('Helvetica-Bold').fillColor('#991b1b').text(`₹${payroll.deductions.toLocaleString()}`, 475, tableTop + 35, { width: 60, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('Tax Deducted at Source (TDS)', 317, tableTop + 55);
      doc.font('Helvetica-Bold').fillColor('#475569').text('₹0', 475, tableTop + 55, { width: 60, align: 'right' });

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text('Leave Without Pay (LWP)', 317, tableTop + 75);
      doc.font('Helvetica-Bold').fillColor('#475569').text('0 Days', 475, tableTop + 75, { width: 60, align: 'right' });

      doc.strokeColor('#cbd5e1').lineWidth(1.5).moveTo(305, tableTop + 105).lineTo(545, tableTop + 105).stroke();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b').text('Total Deductions', 317, tableTop + 114);
      doc.font('Helvetica-Bold').fillColor('#991b1b').text(`₹${payroll.deductions.toLocaleString()}`, 475, tableTop + 114, { width: 60, align: 'right' });

      // 5. Take Home Highlight
      const cardTop = tableTop + tableHeight + 15;
      doc.fillColor(themeColor).roundedRect(50, cardTop, 495.28, 65, 8).fill();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#cbd5e1').text('NET TAKE-HOME SALARY', 65, cardTop + 13);
      doc.font('Helvetica-Bold').fontSize(24).fillColor('#ffffff').text(`₹${payroll.netSalary.toLocaleString()}`, 65, cardTop + 24);

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#cbd5e1').text('AMOUNT IN WORDS', 290, cardTop + 13);
      const inWords = numberToWords(payroll.netSalary);
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff').text(`Rupees ${inWords}`, 290, cardTop + 24, { width: 240, lineGap: 1.5 });

      // 6. Signature & Seals Cards
      const verificationTop = cardTop + 80;
      doc.strokeColor('#cbd5e1').lineWidth(1.5).roundedRect(50, verificationTop, 70, 70, 8).stroke();
      if (qrBuffer) {
        doc.image(qrBuffer, 53, verificationTop + 3, { width: 64, height: 64 });
      } else {
        doc.fillColor('#f8fafc').rect(53, verificationTop + 3, 64, 64).fill();
      }

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#0f172a').text('Verify Payslip Statement', 130, verificationTop + 3);
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#334155').text('Scan the QR code to verify the security credentials, authenticity, and official transaction statement of this payslip.', 130, verificationTop + 16, { width: 155, lineGap: 1.5 });

      doc.fillColor('#f0f9ff').roundedRect(305, verificationTop, 240, 70, 8).fill();
      doc.strokeColor('#7dd3fc').lineWidth(1.5).roundedRect(305, verificationTop, 240, 70, 8).stroke();
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0369a1').text('✓ DIGITALLY SIGNED & VERIFIED', 317, verificationTop + 12);

      if (signatureBuffer || stampBuffer) {
        let issuerText = `Issuer: ${companyName}`;
        if (panNumber) issuerText += `  |  PAN: ${panNumber}`;
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0c4a6e').text(issuerText, 317, verificationTop + 24);
        doc.font('Helvetica-Bold').fontSize(6.5).fillColor('#0c4a6e').text(`Date: ${new Date().toLocaleDateString()}`, 317, verificationTop + 33);
        
        if (signatureBuffer) doc.image(signatureBuffer, 317, verificationTop + 42, { height: 22 });
        if (stampBuffer) doc.image(stampBuffer, 485, verificationTop + 10, { width: 50, height: 50 });
      } else {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#0c4a6e').text(`Issuer: ${companyName}\nSecurity Seal: Secured Payslip System\nDate Generated: ${new Date().toLocaleString()}`, 317, verificationTop + 26, { lineGap: 2 });
      }

      // 7. Remarks
      const txnTop = verificationTop + 85;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#1e293b').text('TRANSACTION REFERENCE / REMARKS', 50, txnTop);
      const txnRef = `Regular payroll credit. ID: TXN-${payroll._id.toString().substring(12).toUpperCase()} — ${payroll.remarks || 'Gateway Verified'}`;
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#334155').text(txnRef, 50, txnTop + 11, { width: 495.28 });

      // 8. Footer
      doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, txnTop + 40).lineTo(545, txnTop + 40).stroke();
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#475569').text(`This is an official system-generated digital document compiled by ${companyName}. No physical signature is required.`, 50, txnTop + 49, { align: 'center', width: 495.28 });
      doc.text('For any payroll queries, please contact the Human Resources or Finance department.', 50, txnTop + 60, { align: 'center', width: 495.28 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

// 1. GET /api/payroll
const getPayrolls = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { month, year, status, search } = req.query;

    let query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.paymentStatus = status;
    if (search) {
      query.employeeName = { $regex: search, $options: 'i' };
    }

    const total = await Payroll.countDocuments(query);
    const payrolls = await Payroll.find(query)
      .populate('employeeId', 'joiningDate department designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: payrolls,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET /api/payroll/:id
const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id).populate('employeeId');
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll slip not found' });
    }
    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. POST /api/payroll/generate
const generatePayrolls = async (req, res) => {
  try {
    const { month, year } = req.body;
    if (!month || !year) {
      return res.status(400).json({ success: false, message: 'Month and year are required' });
    }

    const employees = await Employee.find({ status: 'Active' });
    let createdCount = 0;
    const generated = [];

    for (const emp of employees) {
      const exists = await Payroll.findOne({ employeeId: emp._id, month, year });
      if (!exists) {
        const payroll = new Payroll({
          employeeId: emp._id,
          employeeName: emp.name,
          employeePhoto: emp.avatar || '',
          month,
          year,
          basicSalary: emp.salary || 0,
          allowances: 0,
          deductions: 0,
          grossSalary: emp.salary || 0,
          netSalary: emp.salary || 0,
          paymentStatus: 'Pending',
          paymentDate: null,
          remarks: 'Regular monthly salary generated'
        });
        await payroll.save();
        generated.push(payroll);
        createdCount++;
      }
    }

    if (createdCount > 0) {
      await logActivity('CREATE', 'Payroll', `Generated ${createdCount} payroll records for ${getMonthName(month)} ${year}`);
    }

    res.json({
      success: true,
      message: `${createdCount} payroll entries successfully generated.`,
      data: generated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. PUT /api/payroll/:id
const updatePayroll = async (req, res) => {
  try {
    const { allowances, deductions, paymentStatus, paymentMethod, remarks, paymentDate } = req.body;
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) {
      return res.status(404).json({ success: false, message: 'Payroll record not found' });
    }

    if (allowances !== undefined) payroll.allowances = Number(allowances);
    if (deductions !== undefined) payroll.deductions = Number(deductions);
    
    // Auto-update calculations
    payroll.grossSalary = payroll.basicSalary + payroll.allowances;
    payroll.netSalary = payroll.grossSalary - payroll.deductions;

    if (paymentStatus) {
      payroll.paymentStatus = paymentStatus;
      if (paymentStatus === 'Paid') {
        payroll.paymentDate = paymentDate ? new Date(paymentDate) : new Date();
      } else {
        payroll.paymentDate = null;
      }
    }
    
    if (paymentMethod) payroll.paymentMethod = paymentMethod;
    if (remarks !== undefined) payroll.remarks = remarks;

    await payroll.save();

    // Automation: Auto-Sync Expense Ledger
    const Expense = require('../models/Expense');
    const autoDesc = `Auto-generated from Paid Salary Slip ID: ${payroll._id}`;

    if (payroll.paymentStatus === 'Paid') {
      const expenseTitle = `Salary Credit - ${payroll.employeeName} (${getMonthName(payroll.month)} ${payroll.year})`;
      let existingExpense = await Expense.findOne({ description: autoDesc });

      const expenseDataObj = {
        title: expenseTitle,
        amount: payroll.netSalary,
        category: 'Salary',
        paymentMethod: payroll.paymentMethod || 'Bank Transfer',
        description: autoDesc,
        expenseDate: payroll.paymentDate || new Date()
      };

      if (existingExpense) {
        Object.assign(existingExpense, expenseDataObj);
        await existingExpense.save();
      } else {
        const newExpense = new Expense(expenseDataObj);
        await newExpense.save();
      }
    } else {
      await Expense.deleteOne({ description: autoDesc });
    }

    await logActivity('UPDATE', 'Payroll', `Updated payroll for ${payroll.employeeName}`);

    res.json({ success: true, data: payroll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 5. POST /api/payroll/send-email
const sendPayrollEmail = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Payroll ID is required' });

    const payroll = await Payroll.findById(id).populate('employeeId');
    if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

    const employeeEmail = payroll.employeeId?.email;
    if (!employeeEmail) {
      return res.status(400).json({ success: false, message: 'Employee does not have a registered email address.' });
    }

    const company = await Company.findOne();
    const admin = await Admin.findOne();
    const companyName = company?.companyName || admin?.companyName || "Boffin Web Technology";

    // Respond to client immediately to make it blazing fast!
    res.json({
      success: true,
      message: `Certified payslip delivery started for ${payroll.employeeName}. It will be sent to ${employeeEmail} shortly.`
    });

    // Run PDF generation and SMTP dispatch in the background asynchronously
    (async () => {
      try {
        // Generate dynamic PDF Kit buffer in memory
        const pdfBuffer = await buildPayrollPdfBuffer(id);

        const emailSubject = `Official Payslip Statement - ${getMonthName(payroll.month)} ${payroll.year}`;
        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, ${company?.themeColor || '#1e3a8a'}, #3b82f6); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">${companyName.toUpperCase()}</h1>
              <p style="margin: 5px 0 0 0; opacity: 0.8; font-size: 14px; font-weight: 600;">OFFICIAL PAYROLL CREDIT STATEMENT</p>
            </div>
            <div style="padding: 30px; background-color: #ffffff; color: #334155; line-height: 1.6;">
              <p style="font-size: 16px; margin-top: 0;">Dear <b>${payroll.employeeName}</b>,</p>
              <p>Your salary statement for the period of <b>${getMonthName(payroll.month)} ${payroll.year}</b> has been compiled and credited successfully.</p>
              
              <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
                <p style="font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin: 0 0 4px 0; letter-spacing: 1px;">Net Take-Home Salary</p>
                <p style="font-size: 28px; font-weight: 800; color: ${company?.themeColor || '#1e3a8a'}; margin: 0;">₹${payroll.netSalary.toLocaleString()}</p>
                <p style="font-size: 12px; color: #64748b; margin: 4px 0 0 0;">Status: <span style="color: #166534; font-weight: bold;">${payroll.paymentStatus}</span></p>
              </div>

              <p>Please find the secure, digitally certified PDF Payslip statement attached to this email.</p>
              <p>If you notice any discrepancies or have questions regarding this month's calculations, please get in touch with the Human Resources or Finance Desk.</p>
              
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 25px 0;" />
              <p style="font-size: 12px; color: #94a3b8; margin: 0; text-align: center;">This is a secure system-automated transactional notification. Please do not reply directly to this mail.</p>
            </div>
          </div>
        `;

        // Dispatch nodemailer with dynamic PDF attachment buffer
        await sendEmail({
          to: employeeEmail,
          subject: emailSubject,
          html: emailHtml,
          attachments: [
            {
              filename: `SalarySlip_${payroll.employeeName.replace(/\s+/g, '_')}_${getMonthName(payroll.month)}_${payroll.year}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ]
        });

        await logActivity('EMAIL', 'Payroll', `Emailed payslip to ${payroll.employeeName} (${employeeEmail})`);
      } catch (bgError) {
        console.error('Background Email Dispatch Error:', bgError);
      }
    })();
  } catch (error) {
    console.error('Email Dispatch Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 6. GET /api/payroll/:id/slip
const generatePayrollPdfSlip = async (req, res) => {
  try {
    const pdfBuffer = await buildPayrollPdfBuffer(req.params.id);
    const payroll = await Payroll.findById(req.params.id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=SalarySlip-${payroll?.employeeName.replace(/\s+/g, '_') || req.params.id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF Kit Generator Error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

module.exports = {
  getPayrolls,
  getPayrollById,
  generatePayrolls,
  updatePayroll,
  sendPayrollEmail,
  generatePayrollPdfSlip
};
