import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineEye } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { employeeService } from '../services/dataService';

const DEPTS = ['Development', 'Design', 'Marketing', 'Sales', 'HR', 'Finance', 'Management', 'Support', 'Other'];

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: 'Development', designation: '', salary: '', joiningDate: '', experience: '', address: '', status: 'Active' });

  useEffect(() => { fetchData(); }, [page, search, dept]);

  const fetchData = async () => {
    try { setLoading(true); const { data } = await employeeService.getAll({ page, search, department: dept, limit: 10 }); setEmployees(data.data); setPagination(data.pagination); } catch { setEmployees([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (selected) { await employeeService.update(selected._id, payload); toast.success('Employee updated'); }
      else { await employeeService.create(payload); toast.success('Employee added'); }
      setShowModal(false); resetForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => { try { await employeeService.delete(selected._id); toast.success('Employee deleted'); setSelected(null); fetchData(); } catch { toast.error('Error'); } };

  const openEdit = (emp) => {
    setSelected(emp);
    setForm({ name: emp.name, email: emp.email || '', phone: emp.phone || '', department: emp.department, designation: emp.designation || '', salary: emp.salary, joiningDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : '', experience: emp.experience || '', address: emp.address || '', status: emp.status });
    setShowModal(true);
  };

  const resetForm = () => { setSelected(null); setForm({ name: '', email: '', phone: '', department: 'Development', designation: '', salary: '', joiningDate: '', experience: '', address: '', status: 'Active' }); };

  return (
    <div>
      <PageHeader title="Employees" subtitle="Manage your team members">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Employee</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" /></div>
        <select value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }} className="input-field w-full sm:w-44"><option value="">All Departments</option>{DEPTS.map(d => <option key={d}>{d}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Department</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Salary</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {employees.length === 0 ? <tr><td colSpan="5" className="text-center py-12 text-gray-400">No employees found</td></tr> : employees.map((e) => (
                  <tr key={e._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6"><div className="flex items-center gap-3"><div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center"><span className="text-white text-sm font-semibold">{e.name[0]}</span></div><div><p className="font-medium text-gray-900 dark:text-white text-sm">{e.name}</p><p className="text-xs text-gray-400">{e.designation || e.department}</p></div></div></td>
                    <td className="py-4 px-6 hidden md:table-cell"><span className="badge-blue">{e.department}</span></td>
                    <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-white hidden lg:table-cell">₹{e.salary?.toLocaleString()}</td>
                    <td className="py-4 px-6"><StatusBadge status={e.status} /></td>
                    <td className="py-4 px-6"><div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelected(e); setShowDetail(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-primary-500"><HiOutlineEye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(e)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => { setSelected(e); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label><select className="input-field" value={form.department} onChange={(e) => setForm({...form, department: e.target.value})}>{DEPTS.map(d => <option key={d}>{d}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation</label><input className="input-field" value={form.designation} onChange={(e) => setForm({...form, designation: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary *</label><input type="number" className="input-field" required value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joining Date</label><input type="date" className="input-field" value={form.joiningDate} onChange={(e) => setForm({...form, joiningDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Experience</label><input className="input-field" value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})} placeholder="e.g. 3 years" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label><textarea className="input-field" rows="2" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Add'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Employee Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4"><div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center"><span className="text-white text-2xl font-bold">{selected.name[0]}</span></div><div><h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h3><p className="text-gray-400">{selected.designation} • {selected.department}</p></div></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.email || '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.phone || '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Salary</p><p className="text-sm font-medium text-gray-900 dark:text-white">₹{selected.salary?.toLocaleString()}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Experience</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.experience || '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Joined</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.joiningDate ? new Date(selected.joiningDate).toLocaleDateString() : '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Status</p><StatusBadge status={selected.status} /></div>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Employees;
