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
import { paymentService } from '../services/dataService';

const STATUSES = ['Completed', 'Pending', 'Failed', 'Refunded'];
const METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Card', 'Other'];

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [form, setForm] = useState({ 
    clientName: '', amount: '', paymentMethod: 'Bank Transfer', 
    transactionId: '', status: 'Completed', date: '' 
  });

  useEffect(() => { fetchPayments(); }, [page, search, statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await paymentService.getAll({ page, search, status: statusFilter, limit: 10 });
      setPayments(data.data); setPagination(data.pagination);
    } catch { setPayments([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await paymentService.update(selected._id, form); toast.success('Payment updated'); }
      else { await paymentService.create(form); toast.success('Payment recorded'); }
      setShowModal(false); resetForm(); fetchPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try { await paymentService.delete(selected._id); toast.success('Payment deleted'); setSelected(null); fetchPayments(); } catch { toast.error('Error'); }
  };

  const openEdit = (pay) => {
    setSelected(pay);
    setForm({ 
      clientName: pay.clientName, amount: pay.amount, paymentMethod: pay.paymentMethod, 
      transactionId: pay.transactionId || '', status: pay.status, 
      date: pay.date ? pay.date.split('T')[0] : '' 
    });
    setShowModal(true);
  };

  const resetForm = () => { 
    setSelected(null); 
    setForm({ clientName: '', amount: '', paymentMethod: 'Bank Transfer', transactionId: '', status: 'Completed', date: '' }); 
  };

  return (
    <div>
      <PageHeader title="Payment History" subtitle="Track all client payments and transactions">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Record Payment</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by client or transaction ID..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Client / Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Method</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Transaction ID</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400">No payment history found</td></tr>
                ) : payments.map((pay) => (
                  <tr key={pay._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{pay.clientName}</p>
                      <p className="text-xs text-gray-400">{new Date(pay.date).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-900 dark:text-gray-100">₹{pay.amount.toLocaleString()}</td>
                    <td className="py-4 px-6 hidden md:table-cell text-sm text-gray-500">{pay.paymentMethod}</td>
                    <td className="py-4 px-6 hidden lg:table-cell text-xs text-gray-400 font-mono">{pay.transactionId || '—'}</td>
                    <td className="py-4 px-6"><StatusBadge status={pay.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(pay)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(pay); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Payment' : 'Record Payment'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label><input className="input-field" required value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label><input type="number" required className="input-field" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Method</label><select className="input-field" value={form.paymentMethod} onChange={(e) => setForm({...form, paymentMethod: e.target.value})}>{METHODS.map(s => <option key={s}>{s}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label><input type="date" required className="input-field" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID</label><input className="input-field" value={form.transactionId} onChange={(e) => setForm({...form, transactionId: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border mt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Save'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Payments;
