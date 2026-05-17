import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, 
  HiOutlineArrowDownTray, HiOutlinePrinter, HiOutlineEnvelope, 
  HiOutlineSparkles, HiOutlineMagnifyingGlass, HiOutlineCreditCard,
  HiOutlineCheckCircle
} from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { payrollService } from '../services/dataService';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Salary = () => {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [editForm, setEditForm] = useState({ 
    allowances: 0, 
    deductions: 0, 
    paymentStatus: 'Pending', 
    paymentMethod: 'Bank Transfer',
    remarks: '',
    paymentDate: ''
  });

  const [emailingId, setEmailingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchPayrolls();
  }, [month, year, search]);

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      const { data } = await payrollService.getAll({ 
        month, 
        year, 
        search, 
        limit: 100 
      });
      setPayrolls(data.data || []);
    } catch (err) {
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      const { data } = await payrollService.generate({ month, year });
      toast.success(data.message || 'Payroll generated successfully!');
      fetchPayrolls();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate payroll');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...editForm,
        allowances: editForm.allowances === '' ? 0 : Number(editForm.allowances),
        deductions: editForm.deductions === '' ? 0 : Number(editForm.deductions)
      };
      await payrollService.update(selected._id, submitData);
      toast.success('Payroll record updated successfully!');
      setShowEdit(false);
      fetchPayrolls();
    } catch (err) {
      toast.error('Failed to update payroll details');
    }
  };

  const handleDownloadSlip = async (id, employeeName) => {
    try {
      setDownloadingId(id);
      toast.loading(`Compiling slip for ${employeeName}...`);
      const res = await payrollService.downloadSlip(id);
      
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Payslip_${employeeName.replace(/\s+/g, '_')}_${MONTHS[month - 1]}_${year}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Salary slip downloaded!');
    } catch (error) {
      toast.dismiss();
      toast.error('PDF generation failed');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleSendEmail = async (id, employeeName) => {
    try {
      setEmailingId(id);
      toast.loading(`Transmitting certified slip to ${employeeName}...`);
      const res = await payrollService.sendEmail(id);
      
      toast.dismiss();
      if (res.data.success) {
        toast.success(`Payslip delivered to employee email!`);
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Email delivery failed');
    } finally {
      setEmailingId(null);
    }
  };

  const openEdit = (p) => {
    setSelected(p);
    setEditForm({ 
      allowances: p.allowances === 0 ? '' : (p.allowances || ''), 
      deductions: p.deductions === 0 ? '' : (p.deductions || ''), 
      paymentStatus: p.paymentStatus || 'Pending', 
      paymentMethod: p.paymentMethod || 'Bank Transfer',
      remarks: p.remarks || '',
      paymentDate: p.paymentDate ? new Date(p.paymentDate).toISOString().split('T')[0] : ''
    });
    setShowEdit(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header Component */}
      <PageHeader title="Enterprise Payroll Engine" subtitle="Manage salaries, generate allowances, print certified slips, and email statements.">
        <div className="flex flex-wrap gap-3 items-center">
          <select 
            value={month} 
            onChange={(e) => setMonth(Number(e.target.value))} 
            className="input-field w-36 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border py-2 px-3 rounded-xl font-semibold shadow-sm text-sm"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          
          <input 
            type="number" 
            value={year} 
            onChange={(e) => setYear(Number(e.target.value))} 
            className="input-field w-24 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border py-2 px-3 rounded-xl font-bold shadow-sm text-sm text-center" 
          />
          
          <button 
            onClick={handleGenerate} 
            className="btn-primary flex items-center gap-2 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition"
          >
            <HiOutlinePlus className="w-4.5 h-4.5" />
            <span>Generate Run</span>
          </button>
        </div>
      </PageHeader>

      {/* Advanced Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
          className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg dark:hover:shadow-black/30 transition-shadow duration-300 cursor-pointer"
        >
          <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
            <HiOutlineCreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Payroll Commitment</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white">
              ₹{payrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0).toLocaleString()}
            </h4>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
          className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg dark:hover:shadow-black/30 transition-shadow duration-300 cursor-pointer"
        >
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
            <HiOutlineCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settled Net Salaries</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white">
              ₹{payrolls.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + (p.netSalary || 0), 0).toLocaleString()}
            </h4>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2, ease: "easeOut" } }}
          className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg dark:hover:shadow-black/30 transition-shadow duration-300 cursor-pointer"
        >
          <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl">
            <HiOutlineSparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Employees Seeding</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white">{payrolls.length} Registered</h4>
          </div>
        </motion.div>
      </div>

      {/* Modern Filter Toolbar */}
      <div className="flex items-center bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl px-4 py-3 shadow-sm gap-3">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search employee salaries by name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-slate-800 dark:text-white text-sm"
        />
      </div>

      {/* Main Table Container */}
      {loading ? (
        <LoadingSkeleton type="table" count={5} />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/50">
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Employee</th>
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden md:table-cell">Basic Pay</th>
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Allowances</th>
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Deductions</th>
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Net Take-home</th>
                  <th className="text-left py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-right py-4 px-6 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-400 text-sm">
                      No payroll records found for this period. Click "Generate Run" to seed entries.
                    </td>
                  </tr>
                ) : (
                  payrolls.map((p) => (
                    <tr 
                      key={p._id} 
                      className="hover:bg-slate-50/50 dark:hover:bg-dark-border/10 transition"
                    >
                      {/* Name & Photo */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {p.employeePhoto ? (
                            <img src={p.employeePhoto} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-100">
                              {p.employeeName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">{p.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
                              ID: EMP-{p.employeeId?._id ? p.employeeId._id.toString().substring(18).toUpperCase() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Basic */}
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-semibold hidden md:table-cell">
                        ₹{p.basicSalary?.toLocaleString()}
                      </td>

                      {/* Allowances */}
                      <td className="py-4 px-6 text-sm text-emerald-500 font-bold hidden lg:table-cell">
                        +₹{p.allowances?.toLocaleString()}
                      </td>

                      {/* Deductions */}
                      <td className="py-4 px-6 text-sm text-red-500 font-bold hidden lg:table-cell">
                        -₹{p.deductions?.toLocaleString()}
                      </td>

                      {/* Net Salary */}
                      <td className="py-4 px-6 text-sm font-extrabold text-slate-900 dark:text-white">
                        ₹{p.netSalary?.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <StatusBadge status={p.paymentStatus} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* 1. Edit */}
                          <button 
                            onClick={() => openEdit(p)} 
                            title="Edit Allowances/Deductions"
                            className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-dark-hover transition"
                          >
                            <HiOutlinePencil className="w-4 h-4" />
                          </button>

                          {/* 2. View Preview Page */}
                          <button
                            onClick={() => navigate(`/payroll/salary-slip/${p._id}`)}
                            title="Interactive Slip Preview"
                            className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-dark-hover transition flex items-center gap-1.5"
                          >
                            <HiOutlineEye className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-wider hidden xl:inline">Preview</span>
                          </button>

                          {/* 3. Download Slip */}
                          <button
                            onClick={() => handleDownloadSlip(p._id, p.employeeName)}
                            disabled={downloadingId === p._id}
                            title="Download Official PDF Statement"
                            className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-dark-hover transition"
                          >
                            {downloadingId === p._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent"></div>
                            ) : (
                              <HiOutlineArrowDownTray className="w-4 h-4" />
                            )}
                          </button>

                          {/* 4. Send Email */}
                          <button
                            onClick={() => handleSendEmail(p._id, p.employeeName)}
                            disabled={emailingId === p._id}
                            title="Send Certified Payslip PDF to Employee Email"
                            className="p-2 rounded-xl border border-slate-200 dark:border-dark-border text-slate-400 hover:text-emerald-600 hover:bg-slate-50 dark:hover:bg-dark-hover transition"
                          >
                            {emailingId === p._id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-600 border-t-transparent"></div>
                            ) : (
                              <HiOutlineEnvelope className="w-4 h-4" />
                            )}
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Edit Salary Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Update Payroll Specifications">
        <form onSubmit={handleUpdate} className="space-y-5 p-2">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Performance Allowances (₹)</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                value={editForm.allowances} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]+$/.test(val)) {
                    setEditForm({ ...editForm, allowances: val });
                  }
                }} 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Total Deductions (₹)</label>
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                value={editForm.deductions} 
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || /^[0-9]+$/.test(val)) {
                    setEditForm({ ...editForm, deductions: val });
                  }
                }} 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Status</label>
              <select 
                className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                value={editForm.paymentStatus} 
                onChange={(e) => setEditForm({...editForm, paymentStatus: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Paid">Paid</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Method</label>
              <select 
                className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
                value={editForm.paymentMethod} 
                onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Payment Credit Date</label>
            <input 
              type="date"
              className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
              value={editForm.paymentDate}
              onChange={(e) => setEditForm({...editForm, paymentDate: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Corporate Notes / Remarks</label>
            <textarea 
              rows="2"
              className="input-field w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500" 
              placeholder="Transactional details..."
              value={editForm.remarks}
              onChange={(e) => setEditForm({...editForm, remarks: e.target.value})}
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              onClick={() => setShowEdit(false)} 
              className="btn-secondary flex-1 py-2.5 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary flex-1 py-2.5 font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 rounded-xl shadow-md transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Salary;
