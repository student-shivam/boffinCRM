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
import { incomeService } from '../services/dataService';

const CATEGORIES = ['Client Payment', 'Subscription', 'Service Payment', 'Other Income'];
const METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'];
const STATUSES = ['Completed', 'Pending', 'Failed'];

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [form, setForm] = useState({ 
    clientName: '', amount: '', paymentMethod: 'Bank Transfer', 
    category: 'Client Payment', description: '', transactionId: '', 
    paymentDate: '', status: 'Completed' 
  });

  useEffect(() => { fetchIncome(); }, [page, search, categoryFilter]);

  const fetchIncome = async () => {
    try {
      setLoading(true);
      const { data } = await incomeService.getAll({ page, search, category: categoryFilter, limit: 10 });
      setIncomes(data.data); setPagination(data.pagination);
    } catch { setIncomes([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await incomeService.update(selected._id, form); toast.success('Income updated'); }
      else { await incomeService.create(form); toast.success('Income recorded'); }
      setShowModal(false); resetForm(); fetchIncome();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try { await incomeService.delete(selected._id); toast.success('Income deleted'); setSelected(null); fetchIncome(); } catch { toast.error('Error'); }
  };

  const openEdit = (inc) => {
    setSelected(inc);
    setForm({ 
      clientName: inc.clientName, amount: inc.amount, paymentMethod: inc.paymentMethod, 
      category: inc.category, description: inc.description || '', transactionId: inc.transactionId || '', 
      paymentDate: inc.paymentDate ? inc.paymentDate.split('T')[0] : '', status: inc.status 
    });
    setShowModal(true);
  };

  const resetForm = () => { 
    setSelected(null); 
    setForm({ clientName: '', amount: '', paymentMethod: 'Bank Transfer', category: 'Client Payment', description: '', transactionId: '', paymentDate: '', status: 'Completed' }); 
  };

  return (
    <div>
      <PageHeader title="Income" subtitle="Track and manage company revenue">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Income</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by client or transaction ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48"><option value="">All Categories</option>{CATEGORIES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Client / Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Transaction ID</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incomes.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400">No income records found</td></tr>
                ) : incomes.map((inc) => (
                  <tr key={inc._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{inc.clientName}</p>
                      <p className="text-xs text-gray-400">{new Date(inc.paymentDate).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-green-600 dark:text-green-400">₹{inc.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 hidden md:table-cell text-sm text-gray-500">{inc.category}</td>
                    <td className="py-4 px-6 hidden lg:table-cell text-xs text-gray-400">{inc.transactionId || '—'}</td>
                    <td className="py-4 px-6"><StatusBadge status={inc.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(inc)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(inc); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Income' : 'Record Income'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label><input className="input-field" required value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label><input type="number" required className="input-field" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>{CATEGORIES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label><select className="input-field" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>{METHODS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label><input className="input-field" value={form.transactionId} onChange={(e) => setForm({...form, transactionId: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Date *</label><input type="date" required className="input-field" value={form.paymentDate} onChange={(e) => setForm({...form, paymentDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea className="input-field" rows="3" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Income;
