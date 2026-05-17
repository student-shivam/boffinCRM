import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineDocumentText } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { expenseService } from '../services/dataService';

const CATEGORIES = ['Salary', 'Hosting', 'Domain', 'Office Rent', 'Marketing', 'Software', 'Internet', 'Other'];
const METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [form, setForm] = useState({ 
    title: '', amount: '', category: 'Other', paymentMethod: 'Bank Transfer', 
    description: '', expenseDate: '', receipt: '' 
  });

  useEffect(() => { fetchExpenses(); }, [page, search, categoryFilter]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data } = await expenseService.getAll({ page, search, category: categoryFilter, limit: 10 });
      setExpenses(data.data); setPagination(data.pagination);
    } catch { setExpenses([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await expenseService.update(selected._id, form); toast.success('Expense updated'); }
      else { await expenseService.create(form); toast.success('Expense recorded'); }
      setShowModal(false); resetForm(); fetchExpenses();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try { await expenseService.delete(selected._id); toast.success('Expense deleted'); setSelected(null); fetchExpenses(); } catch { toast.error('Error'); }
  };

  const openEdit = (exp) => {
    setSelected(exp);
    setForm({ 
      title: exp.title, amount: exp.amount, category: exp.category, 
      paymentMethod: exp.paymentMethod, description: exp.description || '', 
      expenseDate: exp.expenseDate ? exp.expenseDate.split('T')[0] : '', receipt: exp.receipt || '' 
    });
    setShowModal(true);
  };

  const resetForm = () => { 
    setSelected(null); 
    setForm({ title: '', amount: '', category: 'Other', paymentMethod: 'Bank Transfer', description: '', expenseDate: '', receipt: '' }); 
  };

  return (
    <div>
      <PageHeader title="Expenses" subtitle="Track and categorize company expenses">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Expense</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search expenses by title..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48"><option value="">All Categories</option>{CATEGORIES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Title / Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Category</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Payment Method</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-12 text-gray-400">No expenses found</td></tr>
                ) : expenses.map((exp) => (
                  <tr key={exp._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{exp.title}</p>
                      <p className="text-xs text-gray-400">{new Date(exp.expenseDate).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-red-600 dark:text-red-400">₹{exp.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 hidden md:table-cell"><span className="badge-purple">{exp.category}</span></td>
                    <td className="py-4 px-6 hidden lg:table-cell text-sm text-gray-500">{exp.paymentMethod}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        {exp.receipt && <a href={exp.receipt} target="_blank" rel="noreferrer" title="View Receipt" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-green-500"><HiOutlineDocumentText className="w-4 h-4" /></a>}
                        <button onClick={() => openEdit(exp)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(exp); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Expense' : 'Record Expense'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label><input className="input-field" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label><input type="number" required className="input-field" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>{CATEGORIES.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label><select className="input-field" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>{METHODS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expense Date *</label><input type="date" required className="input-field" value={form.expenseDate} onChange={(e) => setForm({...form, expenseDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Receipt URL</label><input type="url" placeholder="Optional URL" className="input-field" value={form.receipt} onChange={(e) => setForm({...form, receipt: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><textarea className="input-field" rows="3" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Expenses;
