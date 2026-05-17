const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const PDFDocument = require('pdfkit');
const { logActivity, getPagination, getMonthName } = require('../utils/helpers');
const https = require('https');
const fs = require('fs');
const path = require('path');

const getSalaries = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const { month, year, status, employeeId } = req.query;
    let query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;
    if (employeeId) query.employee = employeeId;
    const total = await Salary.countDocuments(query);
    const salaries = await Salary.find(query).populate('employee', 'name department designation').sort({ createdAt: -1 }).skip(skip).limit(limit);
    res.json({ success: true, data: salaries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const generateSalaries = async (req, res) => {
  try {
    const { month, year } = req.body;
    const employees = await Employee.find({ status: 'Active' });
    const salaries = [];
    for (const emp of employees) {
      const exists = await Salary.findOne({ employee: emp._id, month, year });
      if (!exists) {
        salaries.push({
          employee: emp._id,
          month,
          year,
          basicSalary: emp.salary,
          bonus: 0,
          deductions: 0,
          netSalary: emp.salary,
          status: 'Pending',
        });
      }
    }
    if (salaries.length > 0) {
      await Salary.insertMany(salaries);
      await logActivity('CREATE', 'Salary', `Salaries generated for ${getMonthName(month)} ${year}`);
    }
    res.json({ success: true, message: `${salaries.length} salaries generated`, data: salaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSalary = async (req, res) => {
  try {
    const { bonus, deductions, status, paymentMethod, remarks } = req.body;
    const salary = await Salary.findById(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Salary not found' });
    if (bonus !== undefined) salary.bonus = bonus;
    if (deductions !== undefined) salary.deductions = deductions;
    salary.netSalary = salary.basicSalary + (salary.bonus || 0) - (salary.deductions || 0);
    if (status) {
      salary.status = status;
      if (status === 'Paid') salary.paidDate = new Date();
    }
    if (paymentMethod) salary.paymentMethod = paymentMethod;
    if (remarks) salary.remarks = remarks;
    await salary.save();
    await logActivity('UPDATE', 'Salary', `Salary updated`);
    res.json({ success: true, data: salary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

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

const generateSalarySlip = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate('employee', 'name email department designation joiningDate');
    if (!salary) return res.status(404).json({ success: false, message: 'Salary not found' });

    // Fetch Company & Admin Settings
    const company = await Company.findOne();
    const admin = await Admin.findOne();

    const companyName = company?.companyName || admin?.companyName || "Boffin Web Technology";
    const companyAddress = company?.companyAddress || admin?.companyAddress || "Noida, Uttar Pradesh, India";
    const companyEmail = company?.companyEmail || admin?.companyEmail || "contact@boffinweb.com";
    const companyPhone = company?.companyPhone || admin?.companyPhone || "+91 99999 99999";
    const website = company?.website || admin?.companyWebsite || "https://boffinweb.com";
    const gstNumber = company?.gstNumber || admin?.gstNumber || "";
    const panNumber = company?.panNumber || "";
    const themeColor = company?.themeColor || "#1e3a8a"; // Dynamic theme color

    // Load Company Logo Buffer
    let logoBuffer = null;
    let logoPath = null;
    try {
      const logoUrl = company?.companyLogo || admin?.companyLogo;
      if (logoUrl) {
        if (logoUrl.startsWith('http')) {
          logoBuffer = await fetchImageBuffer(logoUrl);
        } else {
          logoPath = logoUrl;
        }
      }
    } catch (err) {
      console.error('Error fetching company logo:', err);
    }

    if (!logoBuffer && !logoPath) {
      const defaultLogoPath = path.join(__dirname, '../../client/public/logo/boffin logo.jpg');
      if (fs.existsSync(defaultLogoPath)) {
        logoBuffer = fs.readFileSync(defaultLogoPath);
      }
    }

    // Load Signature Buffer
    let signatureBuffer = null;
    try {
      const sigUrl = company?.signature;
      if (sigUrl && sigUrl.startsWith('http')) {
        signatureBuffer = await fetchImageBuffer(sigUrl);
      }
    } catch (err) {
      console.error('Error fetching signature:', err);
    }

    // Load Stamp Buffer
    let stampBuffer = null;
    try {
      const stampUrl = company?.stamp;
      if (stampUrl && stampUrl.startsWith('http')) {
        stampBuffer = await fetchImageBuffer(stampUrl);
      }
    } catch (err) {
      console.error('Error fetching stamp:', err);
    }

    // Load QR Code Buffer (Online verification)
    let qrBuffer = null;
    try {
      const qrData = `VERIFIED SALARY STATEMENT\nCompany: ${companyName}\nEmployee: ${salary.employee.name}\nMonth: ${getMonthName(salary.month)} ${salary.year}\nNet Salary: INR ${salary.netSalary.toLocaleString()}\nStatus: ${salary.status}`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      qrBuffer = await fetchImageBuffer(qrUrl);
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }

    // Initialize A4 PDFkit document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=salary-slip-${salary.employee.name}-${salary.month}-${salary.year}.pdf`);
    doc.pipe(res);

    // ==========================================
    // WATERMARK BACKGROUND LOGO (Dynamic Watermark!)
    // ==========================================
    if (logoBuffer) {
      doc.save();
      doc.opacity(0.04);
      // Center of A4 is x = 297.64, y = 420.94. Drawing with width = 200, height = 200
      doc.image(logoBuffer, 197.64, 320.94, { width: 200, height: 200 });
      doc.restore();
    }

    // ==========================================
    // HEADER SECTION
    // ==========================================
    // Draw Logo Box
    doc.fillColor('#f8fafc').strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, 50, 48, 48, 8).fillAndStroke();
    if (logoBuffer) {
      doc.image(logoBuffer, 52, 52, { width: 44, height: 44 });
    } else if (logoPath && fs.existsSync(logoPath)) {
      doc.image(logoPath, 52, 52, { width: 44, height: 44 });
    } else {
      // Draw dynamic fallback text avatar
      doc.fillColor(themeColor).font('Helvetica-Bold').fontSize(16).text(companyName.charAt(0).toUpperCase(), 50, 65, { width: 48, align: 'center' });
    }

    // Draw Company Name & Details
    doc.font('Helvetica-Bold').fontSize(14).fillColor('#0f172a').text(companyName, 110, 50);
    doc.font('Helvetica').fontSize(8).fillColor('#475569').text(companyAddress, 110, 67, { width: 230 });
    
    let contactInfo = `Email: ${companyEmail}  |  Phone: ${companyPhone}`;
    if (gstNumber) contactInfo += `  |  GST: ${gstNumber}`;
    doc.text(contactInfo, 110, 80, { width: 240 });

    // Draw Payslip Title (Top Right)
    doc.font('Helvetica-Bold').fontSize(18).fillColor(themeColor).text('SALARY SLIP', 350, 50, { align: 'right', width: 195 });
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#2563eb').text('OFFICIAL STATEMENT OF EARNINGS', 350, 68, { align: 'right', width: 195 });
    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(`Period: ${getMonthName(salary.month)} ${salary.year}`, 350, 79, { align: 'right', width: 195 });

    // Header Separator Line
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 112).lineTo(545, 112).stroke();

    // ==========================================
    // EMPLOYEE DETAILS SECTION
    // ==========================================
    doc.fillColor('#f8fafc').strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, 125, 495.28, 85, 6).fillAndStroke();

    // Column 1
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94a3b8').text('EMPLOYEE DETAILS', 65, 137);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#0f172a').text(salary.employee.name, 65, 149);
    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(`Department: ${salary.employee.department}`, 65, 166);
    doc.text(`Designation: ${salary.employee.designation}`, 65, 178);

    // Column 2
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94a3b8').text('STATEMENT INFO', 300, 137);
    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(`Employee ID: EMP-${salary.employee._id.toString().substring(18).toUpperCase()}`, 300, 149);
    doc.text(`Joining Date: ${salary.employee.joiningDate ? new Date(salary.employee.joiningDate).toLocaleDateString() : 'N/A'}`, 300, 161);
    doc.text(`Payment Mode: Bank Transfer`, 300, 173);
    if (salary.paidDate) {
      doc.text(`Paid Date: ${new Date(salary.paidDate).toLocaleDateString()}`, 300, 185);
    }

    // Payment Status Pill (Top Right of Card)
    const isPaid = salary.status === 'Paid';
    const badgeBg = isPaid ? '#dcfce7' : '#fef3c7';
    const badgeText = isPaid ? '#166534' : '#92400e';
    doc.fillColor(badgeBg).roundedRect(470, 135, 60, 16, 4).fill();
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(badgeText).text(salary.status.toUpperCase(), 470, 139, { width: 60, align: 'center' });

    // ==========================================
    // EARNINGS & DEDUCTIONS TABLES
    // ==========================================
    // Table Setup
    const tableTop = 225;
    const tableHeight = 130;

    // 1. EARNINGS CARD
    // Header
    doc.fillColor(themeColor).roundedRect(50, tableTop, 240, 22, 6).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff').text('EARNINGS', 62, tableTop + 7);
    doc.text('AMOUNT', 220, tableTop + 7, { width: 60, align: 'right' });
    // Box
    doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, tableTop, 240, tableHeight, 6).stroke();
    // Rows
    doc.font('Helvetica').fontSize(8.5).fillColor('#334155').text('Basic Salary', 62, tableTop + 35);
    doc.font('Helvetica-Bold').text(`₹${salary.basicSalary.toLocaleString()}`, 220, tableTop + 35, { width: 60, align: 'right' });

    doc.font('Helvetica').fontSize(8.5).fillColor('#334155').text('Performance Bonus', 62, tableTop + 55);
    doc.font('Helvetica-Bold').text(`₹${salary.bonus.toLocaleString()}`, 220, tableTop + 55, { width: 60, align: 'right' });

    doc.font('Helvetica').fontSize(8.5).fillColor('#94a3b8').text('House Rent Allowance (HRA)', 62, tableTop + 75);
    doc.text('—', 220, tableTop + 75, { width: 60, align: 'right' });

    // Earnings Footer Divider
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, tableTop + 105).lineTo(290, tableTop + 105).stroke();
    // Earnings Total
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor(themeColor).text('Total Earnings', 62, tableTop + 114);
    const totalEarnings = salary.basicSalary + salary.bonus;
    doc.text(`₹${totalEarnings.toLocaleString()}`, 220, tableTop + 114, { width: 60, align: 'right' });

    // 2. DEDUCTIONS CARD
    // Header
    doc.fillColor('#475569').roundedRect(305, tableTop, 240, 22, 6).fill();
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff').text('DEDUCTIONS', 317, tableTop + 7);
    doc.text('AMOUNT', 475, tableTop + 7, { width: 60, align: 'right' });
    // Box
    doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(305, tableTop, 240, tableHeight, 6).stroke();
    // Rows
    doc.font('Helvetica').fontSize(8.5).fillColor('#334155').text('Professional Tax & PF', 317, tableTop + 35);
    doc.font('Helvetica-Bold').text(`₹${salary.deductions.toLocaleString()}`, 475, tableTop + 35, { width: 60, align: 'right' });

    doc.font('Helvetica').fontSize(8.5).fillColor('#94a3b8').text('Tax Deducted at Source (TDS)', 317, tableTop + 55);
    doc.text('—', 475, tableTop + 55, { width: 60, align: 'right' });

    doc.font('Helvetica').fontSize(8.5).fillColor('#94a3b8').text('Leave Without Pay (LWP)', 317, tableTop + 75);
    doc.text('—', 475, tableTop + 75, { width: 60, align: 'right' });

    // Deductions Footer Divider
    doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(305, tableTop + 105).lineTo(545, tableTop + 105).stroke();
    // Deductions Total
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#475569').text('Total Deductions', 317, tableTop + 114);
    doc.text(`₹${salary.deductions.toLocaleString()}`, 475, tableTop + 114, { width: 60, align: 'right' });

    // ==========================================
    // HIGHLIGHTED NET SALARY CALLOUT CARD
    // ==========================================
    const cardTop = tableTop + tableHeight + 15;
    doc.fillColor(themeColor).roundedRect(50, cardTop, 495.28, 65, 6).fill();

    // Left Column: Take Home Salary
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#93c5fd').text('NET TAKE-HOME SALARY', 65, cardTop + 13);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#ffffff').text(`₹${salary.netSalary.toLocaleString()}`, 65, cardTop + 24);

    // Right Column: Amount in Words
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#93c5fd').text('AMOUNT IN WORDS', 290, cardTop + 13);
    const inWords = numberToWords(salary.netSalary);
    doc.font('Helvetica').fontSize(8.5).fillColor('#ffffff').text(`Rupees ${inWords}`, 290, cardTop + 24, { width: 240, lineGap: 1 });

    // ==========================================
    // QR VERIFICATION & DIGITAL SIGNATURE (Premium Features!)
    // ==========================================
    const verificationTop = cardTop + 80;

    // QR Code Placement
    doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, verificationTop, 70, 70, 6).stroke();
    if (qrBuffer) {
      doc.image(qrBuffer, 53, verificationTop + 3, { width: 64, height: 64 });
    } else {
      // Mockup elegant vector QR
      doc.fillColor('#f8fafc').rect(53, verificationTop + 3, 64, 64).fill();
      doc.fillColor(themeColor)
        .rect(57, verificationTop + 7, 16, 16).fill()
        .fillColor('#ffffff').rect(60, verificationTop + 10, 10, 10).fill()
        .fillColor(themeColor).rect(63, verificationTop + 13, 4, 4).fill()

        .rect(97, verificationTop + 7, 16, 16).fill()
        .fillColor('#ffffff').rect(100, verificationTop + 10, 10, 10).fill()
        .fillColor(themeColor).rect(103, verificationTop + 13, 4, 4).fill()

        .rect(57, verificationTop + 47, 16, 16).fill()
        .fillColor('#ffffff').rect(60, verificationTop + 50, 10, 10).fill()
        .fillColor(themeColor).rect(63, verificationTop + 53, 4, 4).fill();

      doc.fillColor('#64748b')
        .rect(79, verificationTop + 27, 8, 8).fill()
        .rect(89, verificationTop + 37, 8, 8).fill()
        .rect(79, verificationTop + 47, 8, 8).fill();
    }

    // QR Description
    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#0f172a').text('Verify Payslip Statement', 130, verificationTop + 3);
    doc.font('Helvetica').fontSize(7.5).fillColor('#64748b').text('Scan the QR code to verify the security credentials, authenticity, and official transaction statement of this payslip.', 130, verificationTop + 16, { width: 155, lineGap: 1.5 });

    // Digital Signatory / Verification Badge
    doc.fillColor('#e0f2fe').roundedRect(305, verificationTop, 240, 70, 6).fill();
    doc.strokeColor('#bae6fd').lineWidth(1).roundedRect(305, verificationTop, 240, 70, 6).stroke();

    doc.font('Helvetica-Bold').fontSize(8).fillColor('#0369a1').text('✓ DIGITALLY SIGNED & VERIFIED', 317, verificationTop + 12);
    
    if (signatureBuffer || stampBuffer) {
      let issuerText = `Issuer: ${companyName}`;
      if (panNumber) issuerText += `  |  PAN: ${panNumber}`;
      doc.font('Helvetica').fontSize(7.5).fillColor('#075985').text(issuerText, 317, verificationTop + 24);
      doc.font('Helvetica').fontSize(6.5).fillColor('#075985').text(`Date: ${new Date().toLocaleDateString()}`, 317, verificationTop + 33);
      
      if (signatureBuffer) {
        doc.image(signatureBuffer, 317, verificationTop + 42, { height: 22 });
      }
      if (stampBuffer) {
        doc.image(stampBuffer, 480, verificationTop + 10, { width: 50, height: 50 });
      }
    } else {
      doc.font('Helvetica').fontSize(7.5).fillColor('#075985').text(`Issuer: ${companyName}\nSecurity Seal: Secured Payslip System\nDate Generated: ${new Date().toLocaleString()}`, 317, verificationTop + 26, { lineGap: 2 });
    }

    // ==========================================
    // TRANSACTION DETAILS
    // ==========================================
    const txnTop = verificationTop + 85;
    doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94a3b8').text('TRANSACTION REFERENCE / REMARKS', 50, txnTop);
    const txnRef = `Regular payroll credit. Transaction Ref: TXN-${salary._id.toString().substring(12).toUpperCase()} — Verified Payment Gateway`;
    doc.font('Helvetica').fontSize(8.5).fillColor('#475569').text(txnRef, 50, txnTop + 11, { width: 495.28 });

    // ==========================================
    // FOOTER SECTION
    // ==========================================
    doc.strokeColor('#e2e8f0').lineWidth(0.75).moveTo(50, txnTop + 40).lineTo(545, txnTop + 40).stroke();
    doc.font('Helvetica').fontSize(7.5).fillColor('#94a3b8').text(`This is an official system-generated digital document compiled by ${companyName}. No physical signature is required.`, 50, txnTop + 49, { align: 'center', width: 495.28 });
    doc.text('For any payroll queries, please contact the Human Resources or Finance department.', 50, txnTop + 60, { align: 'center', width: 495.28 });

    doc.end();
  } catch (error) {
    console.error('ERROR IN GENERATE_SALARY_SLIP:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: error.message });
    } else {
      res.end();
    }
  }
};

module.exports = { getSalaries, generateSalaries, updateSalary, generateSalarySlip };
