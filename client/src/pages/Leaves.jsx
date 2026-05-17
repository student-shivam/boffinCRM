import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineCheck, HiOutlineXMark } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { leaveService, employeeService } from '../services/dataService';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ employee: '', leaveType: 'Casual', startDate: '', endDate: '', reason: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try { setLoading(true); const [l, e] = await Promise.all([leaveService.getAll({ limit: 50 }), employeeService.getAll({ limit: 100 })]); setLeaves(l.data.data); setEmployees(e.data.data); } catch { } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => { e.preventDefault(); try { await leaveService.create(form); toast.success('Leave request created'); setShowModal(false); fetchData(); } catch (err) { toast.error(err.response?.data?.message || 'Error'); } };
  const handleStatus = async (id, status) => { try { await leaveService.updateStatus(id, { status }); toast.success(`Leave ${status}`); fetchData(); } catch { toast.error('Error'); } };

  return (
    <div>
      <PageHeader title="Leave Management" subtitle="Manage employee leave requests">
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> New Request</button>
      </PageHeader>

      {loading ? <LoadingSkeleton type="table" count={4} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-200 dark:border-dark-border">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Employee</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Type</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Dates</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>{leaves.length === 0 ? <tr><td colSpan="5" className="text-center py-12 text-gray-400">No leave requests</td></tr> : leaves.map((l) => (
              <tr key={l._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white">{l.employee?.name || 'Unknown'}</td>
                <td className="py-4 px-6 hidden md:table-cell"><span className="badge-purple">{l.leaveType}</span></td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">{new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()} ({l.totalDays}d)</td>
                <td className="py-4 px-6"><StatusBadge status={l.status} /></td>
                <td className="py-4 px-6"><div className="flex items-center justify-end gap-1">
                  {l.status === 'Pending' && (<>
                    <button onClick={() => handleStatus(l._id, 'Approved')} className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500"><HiOutlineCheck className="w-4 h-4" /></button>
                    <button onClick={() => handleStatus(l._id, 'Rejected')} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><HiOutlineXMark className="w-4 h-4" /></button>
                  </>)}
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Leave Request">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label><select className="input-field" required value={form.employee} onChange={(e) => setForm({...form, employee: e.target.value})}><option value="">Select Employee</option>{employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label><select className="input-field" value={form.leaveType} onChange={(e) => setForm({...form, leaveType: e.target.value})}><option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option><option>Other</option></select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label><input type="date" className="input-field" required value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label><input type="date" className="input-field" required value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label><textarea className="input-field" rows="3" required value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">Submit</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Leaves;
