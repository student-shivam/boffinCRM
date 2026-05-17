import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowPath } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { leadService } from '../services/dataService';

const SOURCES = ['Website', 'LinkedIn', 'Facebook', 'Instagram', 'WhatsApp', 'Referral', 'Other'];
const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'];

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '', source: 'Website', status: 'New', followUpDate: '', priority: 'Medium', value: '' });

  useEffect(() => { fetchLeads(); }, [page, search, statusFilter, sourceFilter]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data } = await leadService.getAll({ page, search, status: statusFilter, source: sourceFilter, limit: 10 });
      setLeads(data.data); setPagination(data.pagination);
    } catch { setLeads([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, value: form.value ? Number(form.value) : 0 };
      if (selected) { await leadService.update(selected._id, payload); toast.success('Lead updated'); }
      else { await leadService.create(payload); toast.success('Lead created'); }
      setShowModal(false); resetForm(); fetchLeads();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleConvert = async (id) => {
    try {
      await leadService.convert(id);
      toast.success('Lead converted to client!');
      fetchLeads();
    } catch (err) { toast.error('Conversion failed'); }
  };

  const handleDelete = async () => {
    try { await leadService.delete(selected._id); toast.success('Lead deleted'); setSelected(null); fetchLeads(); } catch { toast.error('Error'); }
  };

  const openEdit = (lead) => {
    setSelected(lead);
    setForm({ name: lead.name, email: lead.email || '', phone: lead.phone || '', company: lead.company || '', message: lead.message || '', source: lead.source, status: lead.status, followUpDate: lead.followUpDate ? lead.followUpDate.split('T')[0] : '', priority: lead.priority, value: lead.value || '' });
    setShowModal(true);
  };

  const resetForm = () => { setSelected(null); setForm({ name: '', email: '', phone: '', company: '', message: '', source: 'Website', status: 'New', followUpDate: '', priority: 'Medium', value: '' }); };

  return (
    <div>
      <PageHeader title="Leads" subtitle="Track and convert your leads">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Lead</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-36"><option value="">All Status</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
        <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-36"><option value="">All Sources</option>{SOURCES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Source</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Follow Up</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-400">No leads found</td></tr>
                ) : leads.map((l) => (
                  <tr key={l._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{l.name}</p>
                      <p className="text-xs text-gray-400">{l.email || l.phone}</p>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell"><span className="badge-purple">{l.source}</span></td>
                    <td className="py-4 px-6"><StatusBadge status={l.status} /></td>
                    <td className="py-4 px-6 text-sm text-gray-400 hidden lg:table-cell">{l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : '—'}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {l.status !== 'Converted' && <button onClick={() => handleConvert(l._id)} title="Convert to Client" className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-400 hover:text-green-500"><HiOutlineArrowPath className="w-4 h-4" /></button>}
                        <button onClick={() => openEdit(l)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(l); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Lead' : 'Add Lead'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label><input className="input-field" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><input type="email" className="input-field" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><input className="input-field" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label><input className="input-field" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label><select className="input-field" value={form.source} onChange={(e) => setForm({...form, source: e.target.value})}>{SOURCES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label><select className="input-field" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}><option>Low</option><option>Medium</option><option>High</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow Up Date</label><input type="date" className="input-field" value={form.followUpDate} onChange={(e) => setForm({...form, followUpDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value (₹)</label><input type="number" className="input-field" value={form.value} onChange={(e) => setForm({...form, value: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label><textarea className="input-field" rows="3" value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Leads;
