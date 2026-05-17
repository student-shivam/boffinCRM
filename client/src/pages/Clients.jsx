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
import { clientService } from '../services/dataService';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', status: 'Active' });

  useEffect(() => { fetchClients(); }, [page, search, status]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data } = await clientService.getAll({ page, search, status, limit: 10 });
      setClients(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setClients([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) {
        await clientService.update(selected._id, form);
        toast.success('Client updated');
      } else {
        await clientService.create(form);
        toast.success('Client created');
      }
      setShowModal(false);
      resetForm();
      fetchClients();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try {
      await clientService.delete(selected._id);
      toast.success('Client deleted');
      setSelected(null);
      fetchClients();
    } catch (err) { toast.error('Delete failed'); }
  };

  const openEdit = (client) => {
    setSelected(client);
    setForm({ name: client.name, email: client.email || '', phone: client.phone || '', company: client.company || '', status: client.status });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelected(null);
    setForm({ name: '', email: '', phone: '', company: '', status: 'Active' });
  };

  return (
    <div>
      <PageHeader title="Clients" subtitle="Manage your client relationships">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="w-4 h-4" /> Add Client
        </button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search clients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input-field w-full sm:w-40">
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">Email</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase hidden lg:table-cell">Company</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-400">No clients found</td></tr>
                ) : clients.map((c) => (
                  <tr key={c._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">{c.name[0]}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</p>
                          <p className="text-xs text-gray-400 md:hidden">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{c.email}</td>
                    <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">{c.company || '—'}</td>
                    <td className="py-4 px-6"><StatusBadge status={c.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelected(c); setShowDetail(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-primary-500"><HiOutlineEye className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(c); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Client' : 'Add Client'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label><input className="input-field" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}><option>Active</option><option>Inactive</option><option>Pending</option></select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title="Client Details" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center"><span className="text-white text-2xl font-bold">{selected.name[0]}</span></div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-gray-400">{selected.company || 'No company'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.email || '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selected.phone || '—'}</p></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Status</p><StatusBadge status={selected.status} /></div>
              <div className="p-3 bg-gray-50 dark:bg-dark-hover rounded-xl"><p className="text-xs text-gray-400">Since</p><p className="text-sm font-medium text-gray-900 dark:text-white">{new Date(selected.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Clients;
