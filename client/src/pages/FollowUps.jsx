import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { followUpService, employeeService } from '../services/dataService';

const STATUSES = ['Pending', 'Completed', 'Rescheduled', 'Missed'];

const FollowUps = () => {
  const [followUps, setFollowUps] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ customerName: '', phone: '', followUpDate: '', followUpTime: '', status: 'Pending', notes: '', assignedTo: '' });

  useEffect(() => { fetchFollowUps(); fetchEmployees(); }, [page, search, statusFilter]);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      const { data } = await followUpService.getAll({ page, search, status: statusFilter, limit: 10 });
      setFollowUps(data.data); setPagination(data.pagination);
    } catch { setFollowUps([]); } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await employeeService.getAll({ limit: 100 });
      setEmployees(data.data);
    } catch { setEmployees([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, assignedTo: form.assignedTo || undefined };
      if (selected) { await followUpService.update(selected._id, payload); toast.success('Follow-up updated'); }
      else { await followUpService.create(payload); toast.success('Follow-up created'); }
      setShowModal(false); resetForm(); fetchFollowUps();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try { await followUpService.delete(selected._id); toast.success('Follow-up deleted'); setSelected(null); fetchFollowUps(); } catch { toast.error('Error'); }
  };

  const openEdit = (fup) => {
    setSelected(fup);
    setForm({ 
      customerName: fup.customerName, 
      phone: fup.phone || '', 
      followUpDate: fup.followUpDate ? fup.followUpDate.split('T')[0] : '', 
      followUpTime: fup.followUpTime || '', 
      status: fup.status, 
      notes: fup.notes || '', 
      assignedTo: fup.assignedTo?._id || fup.assignedTo || '' 
    });
    setShowModal(true);
  };

  const resetForm = () => { setSelected(null); setForm({ customerName: '', phone: '', followUpDate: '', followUpTime: '', status: 'Pending', notes: '', assignedTo: '' }); };

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle="Manage customer follow-up reminders">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Follow-up</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search follow-ups..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48"><option value="">All Status</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Assigned To</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-400">No follow-ups found</td></tr>
                ) : followUps.map((fup) => (
                  <tr key={fup._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{fup.customerName}</p>
                      <p className="text-xs text-gray-400">{fup.phone}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{new Date(fup.followUpDate).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{fup.followUpTime || '—'}</p>
                    </td>
                    <td className="py-4 px-6"><StatusBadge status={fup.status} /></td>
                    <td className="py-4 px-6 text-sm text-gray-500 hidden md:table-cell">{fup.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(fup)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(fup); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Follow-up' : 'Add Follow-up'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name *</label><input className="input-field" required value={form.customerName} onChange={(e) => setForm({...form, customerName: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label><input type="date" required className="input-field" value={form.followUpDate} onChange={(e) => setForm({...form, followUpDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label><input type="time" className="input-field" value={form.followUpTime} onChange={(e) => setForm({...form, followUpTime: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
            <select className="input-field" value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})}>
              <option value="">Select Employee</option>
              {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name}</option>)}
            </select>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label><textarea className="input-field" rows="3" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default FollowUps;
