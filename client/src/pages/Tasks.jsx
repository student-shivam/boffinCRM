import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineChatBubbleLeft } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { taskService, employeeService } from '../services/dataService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', status: 'Pending', priority: 'Medium', progress: 0 });

  useEffect(() => { fetchData(); }, [page, search, statusFilter]);
  useEffect(() => { employeeService.getAll({ limit: 100 }).then(r => setEmployees(r.data.data)).catch(() => {}); }, []);

  const fetchData = async () => {
    try { setLoading(true); const { data } = await taskService.getAll({ page, search, status: statusFilter, limit: 10 }); setTasks(data.data); setPagination(data.pagination); } catch { setTasks([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, progress: Number(form.progress) };
      if (selected) { await taskService.update(selected._id, payload); toast.success('Task updated'); }
      else { await taskService.create(payload); toast.success('Task created'); }
      setShowModal(false); resetForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => { try { await taskService.delete(selected._id); toast.success('Task deleted'); setSelected(null); fetchData(); } catch { toast.error('Error'); } };
  const openEdit = (t) => { setSelected(t); setForm({ title: t.title, description: t.description || '', assignedTo: t.assignedTo?._id || '', deadline: t.deadline ? t.deadline.split('T')[0] : '', status: t.status, priority: t.priority, progress: t.progress }); setShowModal(true); };
  const resetForm = () => { setSelected(null); setForm({ title: '', description: '', assignedTo: '', deadline: '', status: 'Pending', priority: 'Medium', progress: 0 }); };

  const priorityColors = { Low: 'badge-gray', Medium: 'badge-yellow', High: 'badge-red', Urgent: 'badge-red' };

  return (
    <div>
      <PageHeader title="Tasks" subtitle="Manage projects and tasks">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Task</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search tasks..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" /></div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-40"><option value="">All Status</option><option>Pending</option><option>In Progress</option><option>Review</option><option>Completed</option></select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-200 dark:border-dark-border">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Task</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Assigned To</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Priority</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Progress</th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>{tasks.length === 0 ? <tr><td colSpan="6" className="text-center py-12 text-gray-400">No tasks found</td></tr> : tasks.map((t) => (
              <tr key={t._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                <td className="py-4 px-6"><p className="font-medium text-gray-900 dark:text-white text-sm">{t.title}</p><p className="text-xs text-gray-400 truncate max-w-[200px]">{t.description}</p></td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{t.assignedTo?.name || '—'}</td>
                <td className="py-4 px-6"><StatusBadge status={t.status} /></td>
                <td className="py-4 px-6 hidden lg:table-cell"><span className={priorityColors[t.priority]}>{t.priority}</span></td>
                <td className="py-4 px-6 hidden lg:table-cell"><div className="flex items-center gap-2"><div className="w-20 h-2 bg-gray-200 dark:bg-dark-hover rounded-full overflow-hidden"><div className="h-full bg-primary-500 rounded-full" style={{ width: `${t.progress}%` }} /></div><span className="text-xs text-gray-400">{t.progress}%</span></div></td>
                <td className="py-4 px-6"><div className="flex items-center justify-end gap-1">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => { setSelected(t); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
          <Pagination currentPage={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input className="input-field" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea className="input-field" rows="3" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned To</label><select className="input-field" value={form.assignedTo} onChange={(e) => setForm({...form, assignedTo: e.target.value})}><option value="">Unassigned</option>{employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deadline</label><input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({...form, deadline: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}><option>Pending</option><option>In Progress</option><option>Review</option><option>Completed</option><option>Cancelled</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select className="input-field" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select></div>
            <div className="col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Progress ({form.progress}%)</label><input type="range" min="0" max="100" value={form.progress} onChange={(e) => setForm({...form, progress: e.target.value})} className="w-full accent-primary-500" /></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Tasks;
