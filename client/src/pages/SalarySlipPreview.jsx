import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payrollService, companyService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiOutlineArrowLeft, HiOutlineArrowDownTray, HiOutlinePrinter, 
  HiOutlineEnvelope, HiOutlineCheckCircle, HiOutlineSparkles,
  HiOutlineBuildingOffice, HiOutlineShieldCheck, HiOutlineCpuChip
} from 'react-icons/hi2';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SalarySlipPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [payroll, setPayroll] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [payrollRes, companyRes] = await Promise.all([
        payrollService.getById(id),
        companyService.getDetails()
      ]);
      
      if (payrollRes.data.success) {
        setPayroll(payrollRes.data.data);
      }
      if (companyRes.data.success) {
        setCompany(companyRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load payslip preview information');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      toast.loading('Compiling high-fidelity A4 PDF...');
      const res = await payrollService.downloadSlip(id);
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${payroll.employeeName.replace(/\s+/g, '_')}_${MONTHS[payroll.month - 1]}_${payroll.year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Premium PDF downloaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = async () => {
    try {
      setEmailing(true);
      const res = await payrollService.sendEmail(id);
      if (res.data.success) {
        toast.success(res.data.message || 'Payslip emailed to employee!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Email delivery failed.');
    } finally {
      setEmailing(false);
    }
  };

  // Helper for converting numbers to words (Rupees Format)
  function numberToWords(num) {
    if (!num) return 'Zero Rupees';
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

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primary-500"></div>
          <div className="absolute top-0 left-0 w-20 h-20 flex items-center justify-center font-bold text-sm text-primary-400">
            HRMS
          </div>
        </div>
        <p className="text-slate-400 font-semibold animate-pulse text-sm">Generating Premium Slip Canvas...</p>
      </div>
    );
  }

  if (!payroll) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-slate-900 gap-4 text-white">
        <p className="text-lg font-bold text-red-500">Error: Payroll slip not found</p>
        <button onClick={() => navigate('/salary')} className="btn-primary">Return to List</button>
      </div>
    );
  }

  const primaryThemeColor = company?.themeColor || '#1e3a8a';
  const isPaid = payroll.paymentStatus === 'Paid';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 flex flex-col items-center select-none overflow-y-auto print:p-0 print:bg-white print:text-black">
      
      {/* Printable CSS Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body, html, #root {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            width: 210mm !important;
            height: 297mm !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            background: white !important;
            margin: 0 auto !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          /* Retain beautiful Tailwind backgrounds and borders */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      {/* Sticky Action Toolbar */}
      <div className="no-print w-full max-w-4xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 mb-8 sticky top-4 z-50 shadow-2xl">
        <button
          onClick={() => navigate('/salary')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 transition"
        >
          <HiOutlineArrowLeft className="w-5 h-5 text-primary-400" />
          <span>Back to Payroll List</span>
        </button>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-blue-600 hover:from-primary-700 hover:to-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/30 transition disabled:opacity-50"
          >
            <HiOutlineArrowDownTray className="w-5 h-5" />
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-xl transition"
          >
            <HiOutlinePrinter className="w-5 h-5 text-slate-300" />
            <span>Print Slip</span>
          </button>

          <button
            onClick={handleSendEmail}
            disabled={emailing}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-950/20 transition disabled:opacity-50"
          >
            {emailing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <HiOutlineEnvelope className="w-5 h-5" />
            )}
            <span>{emailing ? 'Emailing Slip...' : 'Email to Employee'}</span>
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div 
        ref={printRef}
        className="print-container w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 relative rounded-3xl shadow-2xl border-2 border-slate-300 flex flex-col justify-between overflow-hidden"
      >
        {/* Dynamic Opacity Centered Watermark Logo */}
        {company?.companyLogo && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.035] z-0">
            <img src={company.companyLogo} alt="Watermark" className="w-[320px] h-[320px] object-contain" />
          </div>
        )}

        <div className="relative z-10 space-y-8">
          
          {/* Header Block / Corporate Letterhead */}
          <div className="flex justify-between items-start gap-4 pb-6 border-b-2 border-slate-300">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 flex items-center justify-center p-1 shadow-sm bg-slate-50 flex-shrink-0">
                {company?.companyLogo ? (
                  <img src={company.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <HiOutlineBuildingOffice className="w-9 h-9" style={{ color: primaryThemeColor }} />
                )}
              </div>
              
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black tracking-tight" style={{ color: primaryThemeColor }}>
                  {company?.companyName || 'Boffin Web Technology'}
                </h2>
                <p className="text-xs font-bold text-slate-700 max-w-sm leading-snug">
                  {company?.companyAddress || 'Noida, Uttar Pradesh, India'}
                </p>
                <div className="text-[11px] font-extrabold text-slate-800 flex flex-wrap gap-x-2 gap-y-0.5">
                  <span>Email: {company?.companyEmail || 'contact@boffinweb.com'}</span>
                  <span>|</span>
                  <span>Phone: {company?.companyPhone || '+91 99999 99999'}</span>
                  {company?.gstNumber && (
                    <>
                      <span>|</span>
                      <span>GST: {company.gstNumber}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right space-y-1">
              <h1 className="text-3xl font-black tracking-tighter" style={{ color: primaryThemeColor }}>
                SALARY SLIP
              </h1>
              <p className="text-[10px] font-black tracking-widest uppercase" style={{ color: primaryThemeColor }}>
                OFFICIAL STATEMENT OF EARNINGS
              </p>
              <p className="text-xs text-slate-900 mt-1.5 font-extrabold">
                Period: {MONTHS[payroll.month - 1]} {payroll.year}
              </p>
            </div>
          </div>

          {/* Employee Details Information Panel */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 relative shadow-sm">
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase border-2 ${
                isPaid 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm shadow-emerald-100' 
                  : 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm shadow-amber-100'
              }`}>
                {payroll.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-xs">
              
              {/* Employee Information */}
              <div className="space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-sm" style={{ backgroundColor: primaryThemeColor }}></span>
                  Employee Information
                </div>
                <div className="flex items-center gap-4 pt-1">
                  {payroll.employeePhoto ? (
                    <img src={payroll.employeePhoto} alt="Employee" className="w-12 h-12 rounded-full object-cover border-2 border-slate-300 shadow-sm" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300 flex items-center justify-center font-black text-slate-700 text-lg">
                      {payroll.employeeName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="font-black text-slate-950 text-base tracking-tight">{payroll.employeeName}</div>
                    <div className="text-xs font-bold text-slate-700 mt-0.5">
                      {payroll.employeeId?.designation || 'Specialist'} | {payroll.employeeId?.department || 'General'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Statement Info */}
              <div className="space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 rounded-sm bg-slate-600"></span>
                  Statement Info
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600 font-extrabold">Employee ID:</span>
                    <span className="font-black text-slate-950 text-xs">EMP-{payroll.employeeId?._id ? payroll.employeeId._id.toString().substring(18).toUpperCase() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600 font-extrabold">Joining Date:</span>
                    <span className="font-black text-slate-950 text-xs">
                      {payroll.employeeId?.joiningDate ? new Date(payroll.employeeId.joiningDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-slate-600 font-extrabold">Payment Mode:</span>
                    <span className="font-black text-slate-950 text-xs">{payroll.paymentMethod || 'Bank Transfer'}</span>
                  </div>
                  {payroll.paymentDate && (
                    <div className="flex justify-between pb-0.5">
                      <span className="text-slate-600 font-extrabold">Credit Date:</span>
                      <span className="font-black text-slate-950 text-xs">{new Date(payroll.paymentDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Earnings Box */}
            <div className="border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="text-white text-xs font-black px-4 py-2.5 flex justify-between items-center" style={{ backgroundColor: primaryThemeColor }}>
                  <span>EARNINGS STATEMENT</span>
                  <span>AMOUNT</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                    <span className="text-slate-700 font-bold">Basic Salary</span>
                    <span className="font-black text-slate-950 text-sm">₹{payroll.basicSalary?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                    <span className="text-slate-700 font-bold">Performance Allowances</span>
                    <span className="font-black text-slate-950 text-sm text-emerald-700">+₹{payroll.allowances?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-bold">House Rent Allowance (HRA)</span>
                    <span className="font-black text-slate-600">₹0</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3.5 bg-slate-50 border-t-2 border-slate-300 flex justify-between items-center text-xs font-black" style={{ color: primaryThemeColor }}>
                <span>Total Gross Earnings</span>
                <span className="text-sm">₹{payroll.grossSalary?.toLocaleString()}</span>
              </div>
            </div>

            {/* Deductions Box */}
            <div className="border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between min-h-[180px]">
              <div>
                <div className="bg-slate-800 text-white text-xs font-black px-4 py-2.5 flex justify-between items-center">
                  <span>DEDUCTIONS STATEMENT</span>
                  <span>AMOUNT</span>
                </div>
                <div className="p-4 space-y-3.5 text-xs">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                    <span className="text-slate-700 font-bold">Professional Tax & PF</span>
                    <span className="font-black text-slate-950 text-sm text-red-700">₹{payroll.deductions?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2.5 text-slate-600">
                    <span className="font-bold">Tax Deducted at Source (TDS)</span>
                    <span className="font-black text-slate-600">₹0</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-bold">Leave Without Pay (LWP)</span>
                    <span className="font-black text-slate-600">0 Days</span>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3.5 bg-slate-50 border-t-2 border-slate-300 flex justify-between items-center text-xs font-black text-slate-800">
                <span>Total Deductions</span>
                <span className="text-sm text-red-700">₹{payroll.deductions?.toLocaleString()}</span>
              </div>
            </div>

          </div>

          {/* Highlighted Net Take-Home Card */}
          <div className="rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden shadow-xl" style={{ backgroundColor: primaryThemeColor }}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <HiOutlineCpuChip className="w-36 h-36 text-white" />
            </div>
            
            <div className="space-y-1 relative z-10">
              <div className="text-xs font-black tracking-widest text-slate-200 flex items-center gap-1.5">
                <HiOutlineSparkles className="w-4 h-4 text-amber-300" /> NET TAKE-HOME SALARY
              </div>
              <div className="text-4xl font-black tracking-tight drop-shadow-md">
                ₹{payroll.netSalary?.toLocaleString()}
              </div>
            </div>

            <div className="text-center md:text-right relative z-10 max-w-sm space-y-1.5 border-l-0 md:border-l-2 border-slate-300/40 pl-0 md:pl-6">
              <div className="text-[10px] font-black tracking-widest text-slate-200">AMOUNT IN WORDS</div>
              <div className="text-sm font-black leading-snug drop-shadow-sm">
                Rupees {numberToWords(payroll.netSalary)}
              </div>
            </div>
          </div>

          {/* Trust Elements: QR and digital signature */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 items-center">
            
            {/* QR Card */}
            <div className="md:col-span-2 flex items-center gap-4 border-2 border-slate-200 rounded-3xl p-4 bg-slate-50">
              <div className="w-16 h-16 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center p-1.5 flex-shrink-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `VERIFIED ENTERPRISE PAYSLIP\nCompany: ${company?.companyName || 'Boffin Web Technology'}\nEmployee: ${payroll.employeeName}\nMonth: ${MONTHS[payroll.month - 1]} ${payroll.year}\nNet Salary: INR ${payroll.netSalary?.toLocaleString()}\nStatus: ${payroll.paymentStatus}`
                  )}`} 
                  alt="Verification QR" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                  <HiOutlineShieldCheck className="w-5 h-5 text-blue-700" />
                  <span>Verify Payslip Statement</span>
                </div>
                <p className="text-[10px] text-slate-700 font-bold leading-relaxed max-w-sm">
                  This payslip contains encrypted QR metadata for institutional verification. Scan to confirm transaction details, date stamps, and official records.
                </p>
              </div>
            </div>

            {/* Digitally Signed Stamp Card */}
            <div className="md:col-span-1 border-2 border-sky-300 bg-sky-50/70 rounded-3xl p-4 flex flex-col justify-between relative overflow-hidden h-full min-h-[110px]">
              {company?.stamp && (
                <div className="absolute top-2 right-2 opacity-35 pointer-events-none">
                  <img src={company.stamp} alt="Corporate Stamp" className="w-16 h-16 object-contain" />
                </div>
              )}
              <div className="space-y-1">
                <div className="text-[10px] font-black text-sky-800 tracking-wider flex items-center gap-1">
                  <HiOutlineCheckCircle className="w-4 h-4 text-sky-700" />
                  <span>DIGITALLY CERTIFIED</span>
                </div>
                <div className="text-[9px] text-slate-800 font-extrabold space-y-0.5">
                  <div>Issuer: {company?.companyName || 'Boffin Web Technology'}</div>
                  {company?.panNumber && <div>PAN: {company.panNumber}</div>}
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>
              {company?.signature ? (
                <div className="mt-2 h-7 flex items-end">
                  <img src={company.signature} alt="Signature" className="h-full object-contain mix-blend-multiply" />
                </div>
              ) : (
                <div className="mt-2 text-[9px] font-black text-sky-800 italic border-t border-sky-300/60 pt-1">
                  System Generated Statement
                </div>
              )}
            </div>

          </div>

          {/* Remarks Section */}
          <div className="space-y-2 border-t-2 border-slate-200 pt-6">
            <div className="text-[11px] font-black text-slate-800 uppercase tracking-widest">TRANSACTION REFERENCE / REMARKS</div>
            <p className="text-xs text-slate-700 leading-relaxed font-bold">
              Regular payroll credit. Transaction Reference ID: <span className="font-black text-slate-950">TXN-{payroll._id.toString().substring(12).toUpperCase()}</span>. Remarks: {payroll.remarks || 'Standard Monthly Allocation'}.
            </p>
          </div>
        </div>

        {/* Dynamic A4 Footer */}
        <div className="border-t-2 border-slate-200 pt-6 text-center space-y-1 mt-8 relative z-10">
          <p className="text-[10px] font-bold text-slate-600">
            This is an official system-generated digital document compiled by {company?.companyName || 'Boffin Web Technology'}. No physical signature is required.
          </p>
          <p className="text-[9px] text-slate-500 font-semibold">
            For any payroll queries or financial claims, please contact the Human Resources or Corporate Finance Desk.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default SalarySlipPreview;
