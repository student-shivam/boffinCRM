import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { salaryService, employeeService } from '../services/dataService';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Salary = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editForm, setEditForm] = useState({ bonus: 0, deductions: 0, status: 'Pending', paymentMethod: 'Bank Transfer' });

  useEffect(() => { fetchSalaries(); }, [month, year]);

  const fetchSalaries = async () => {
    try { setLoading(true); const { data } = await salaryService.getAll({ month, year, limit: 100 }); setSalaries(data.data); } catch { setSalaries([]); } finally { setLoading(false); }
  };

  const handleGenerate = async () => {
    try { const { data } = await salaryService.generate({ month, year }); toast.success(data.message); fetchSalaries(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try { await salaryService.update(selected._id, editForm); toast.success('Salary updated'); setShowEdit(false); fetchSalaries(); } catch (err) { toast.error('Error'); }
  };

  const handleDownloadSlip = async (id) => {
    try { const res = await salaryService.downloadSlip(id); const url = window.URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = 'salary-slip.pdf'; a.click(); toast.success('Slip downloaded'); } catch { toast.error('Download failed'); }
  };

  const openEdit = (s) => { setSelected(s); setEditForm({ bonus: s.bonus, deductions: s.deductions, status: s.status, paymentMethod: s.paymentMethod || 'Bank Transfer' }); setShowEdit(true); };

  return (
    <div>
      <PageHeader title="Payroll" subtitle={`${MONTHS[month - 1]} ${year}`}>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="input-field w-36">{MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}</select>
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} className="input-field w-24" />
          <button onClick={handleGenerate} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Generate</button>
        </div>
      </PageHeader>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-200 dark:border-dark-border">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Basic</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Bonus</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Deductions</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Net Salary</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>{salaries.length === 0 ? <tr><td colSpan="7" className="text-center py-12 text-gray-400">No salaries generated. Click "Generate" to create salary records.</td></tr> : salaries.map((s) => (
              <tr key={s._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                <td className="py-4 px-6"><p className="font-medium text-gray-900 dark:text-white text-sm">{s.employee?.name || 'Unknown'}</p><p className="text-xs text-gray-400">{s.employee?.department}</p></td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">₹{s.basicSalary?.toLocaleString()}</td>
                <td className="py-4 px-6 text-sm text-emerald-500 hidden lg:table-cell">+₹{s.bonus?.toLocaleString()}</td>
                <td className="py-4 px-6 text-sm text-red-500 hidden lg:table-cell">-₹{s.deductions?.toLocaleString()}</td>
                <td className="py-4 px-6 text-sm font-semibold text-gray-900 dark:text-white">₹{s.netSalary?.toLocaleString()}</td>
                <td className="py-4 px-6"><StatusBadge status={s.status} /></td>
                <td className="py-4 px-6"><div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(s)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDownloadSlip(s._id)} className="px-3 py-1 text-xs bg-primary-500/10 text-primary-500 rounded-lg hover:bg-primary-500/20">PDF</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      )}

      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Edit Salary">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bonus (₹)</label><input type="number" className="input-field" value={editForm.bonus} onChange={(e) => setEditForm({...editForm, bonus: Number(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deductions (₹)</label><input type="number" className="input-field" value={editForm.deductions} onChange={(e) => setEditForm({...editForm, deductions: Number(e.target.value)})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})}><option>Pending</option><option>Processing</option><option>Paid</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label><select className="input-field" value={editForm.paymentMethod} onChange={(e) => setEditForm({...editForm, paymentMethod: e.target.value})}><option>Bank Transfer</option><option>Cash</option><option>UPI</option><option>Cheque</option></select></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowEdit(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Update</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Salary;
