import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowDownTray } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import Pagination from '../components/ui/Pagination';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { invoiceService } from '../services/dataService';

const STATUSES = ['Paid', 'Pending', 'Overdue'];

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const [form, setForm] = useState({ 
    clientName: '', dueDate: '', status: 'Pending', gst: 0,
    services: [{ description: '', amount: 0 }] 
  });

  useEffect(() => { fetchInvoices(); }, [page, search, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await invoiceService.getAll({ page, search, status: statusFilter, limit: 10 });
      setInvoices(data.data); setPagination(data.pagination);
    } catch { setInvoices([]); } finally { setLoading(false); }
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...form.services];
    newServices[index][field] = value;
    setForm({ ...form, services: newServices });
  };

  const addServiceRow = () => {
    setForm({ ...form, services: [...form.services, { description: '', amount: 0 }] });
  };

  const removeServiceRow = (index) => {
    const newServices = form.services.filter((_, i) => i !== index);
    setForm({ ...form, services: newServices });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate totals
      const amount = form.services.reduce((sum, s) => sum + Number(s.amount), 0);
      const total = amount + Number(form.gst);
      
      const payload = { ...form, amount, total };

      if (selected) { await invoiceService.update(selected._id, payload); toast.success('Invoice updated'); }
      else { await invoiceService.create(payload); toast.success('Invoice generated'); }
      setShowModal(false); resetForm(); fetchInvoices();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => {
    try { await invoiceService.delete(selected._id); toast.success('Invoice deleted'); setSelected(null); fetchInvoices(); } catch { toast.error('Error'); }
  };

  const downloadPDF = async (id, invoiceNumber) => {
    try {
      const response = await invoiceService.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started');
    } catch {
      toast.error('Failed to generate PDF');
    }
  };

  const openEdit = (inv) => {
    setSelected(inv);
    setForm({ 
      clientName: inv.clientName, dueDate: inv.dueDate ? inv.dueDate.split('T')[0] : '', 
      status: inv.status, gst: inv.gst, services: inv.services 
    });
    setShowModal(true);
  };

  const resetForm = () => { 
    setSelected(null); 
    setForm({ clientName: '', dueDate: '', status: 'Pending', gst: 0, services: [{ description: '', amount: 0 }] }); 
  };

  return (
    <div>
      <PageHeader title="Invoices" subtitle="Generate and manage client invoices">
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Create Invoice</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search by invoice number or client..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="input-field w-full sm:w-48"><option value="">All Statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select>
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Invoice</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Client</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Total</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Due Date</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400">No invoices found</td></tr>
                ) : invoices.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{inv.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">{new Date(inv.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-700 dark:text-gray-300">{inv.clientName}</td>
                    <td className="py-4 px-6 hidden md:table-cell text-sm font-semibold">₹{inv.total.toLocaleString()}</td>
                    <td className="py-4 px-6 hidden lg:table-cell text-xs text-gray-500">{new Date(inv.dueDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6"><StatusBadge status={inv.status} /></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => downloadPDF(inv._id, inv.invoiceNumber)} title="Download PDF" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-indigo-500"><HiOutlineArrowDownTray className="w-4 h-4" /></button>
                        <button onClick={() => openEdit(inv)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                        <button onClick={() => { setSelected(inv); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
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

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Invoice' : 'Create Invoice'} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client Name *</label><input className="input-field" required value={form.clientName} onChange={(e) => setForm({...form, clientName: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date *</label><input type="date" required className="input-field" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">GST (₹)</label><input type="number" className="input-field" value={form.gst} onChange={(e) => setForm({...form, gst: e.target.value})} /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label><select className="input-field" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-4">
            <h4 className="text-sm font-semibold mb-3">Services</h4>
            {form.services.map((svc, idx) => (
              <div key={idx} className="flex gap-3 mb-2 items-center">
                <input type="text" placeholder="Description" required className="input-field flex-1" value={svc.description} onChange={(e) => handleServiceChange(idx, 'description', e.target.value)} />
                <input type="number" placeholder="Amount" required className="input-field w-32" value={svc.amount} onChange={(e) => handleServiceChange(idx, 'amount', e.target.value)} />
                <button type="button" onClick={() => removeServiceRow(idx)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            ))}
            <button type="button" onClick={addServiceRow} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">+ Add Service</button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-dark-border mt-4"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Generate'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Invoices;
