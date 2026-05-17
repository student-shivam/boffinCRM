import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineMagnifyingGlass, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import PageHeader from './ui/PageHeader';
import Modal from './ui/Modal';
import StatusBadge from './ui/StatusBadge';
import Pagination from './ui/Pagination';
import ConfirmDialog from './ui/ConfirmDialog';
import LoadingSkeleton from './ui/LoadingSkeleton';

const GenericCRUD = ({ title, subtitle, service, fields, categories, statusOptions, formatValue }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => { resetForm(); }, []);
  useEffect(() => { fetchData(); }, [page, search, category]);

  const fetchData = async () => {
    try { setLoading(true); const { data } = await service.getAll({ page, search, category, limit: 10 }); setItems(data.data); setPagination(data.pagination); } catch { setItems([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await service.update(selected._id, form); toast.success('Updated'); }
      else { await service.create(form); toast.success('Created'); }
      setShowModal(false); resetForm(); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => { try { await service.delete(selected._id); toast.success('Deleted'); setSelected(null); fetchData(); } catch { toast.error('Error'); } };

  const openEdit = (item) => {
    setSelected(item);
    const f = {};
    fields.forEach(fld => { f[fld.key] = fld.type === 'date' && item[fld.key] ? item[fld.key].split('T')[0] : item[fld.key] || ''; });
    setForm(f);
    setShowModal(true);
  };

  const resetForm = () => { setSelected(null); const f = {}; fields.forEach(fld => { f[fld.key] = fld.default || ''; }); setForm(f); };

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle}>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add {title.slice(0, -1)}</button>
      </PageHeader>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1"><HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input-field pl-10" /></div>
        {categories && <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="input-field w-full sm:w-44"><option value="">All Categories</option>{categories.map(c => <option key={c}>{c}</option>)}</select>}
      </div>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto"><table className="w-full">
            <thead><tr className="border-b border-gray-200 dark:border-dark-border">
              {fields.filter(f => f.showInTable).map(f => <th key={f.key} className={`text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase ${f.hideOnMobile ? 'hidden md:table-cell' : ''}`}>{f.label}</th>)}
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {items.length === 0 ? <tr><td colSpan="10" className="text-center py-12 text-gray-400">No {title.toLowerCase()} found</td></tr> : items.map((item) => (
                <tr key={item._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                  {fields.filter(f => f.showInTable).map(f => (
                    <td key={f.key} className={`py-4 px-6 text-sm ${f.hideOnMobile ? 'hidden md:table-cell' : ''}`}>
                      {f.key === 'status' ? <StatusBadge status={item[f.key]} /> :
                       f.type === 'currency' ? <span className="font-medium text-gray-900 dark:text-white">₹{Number(item[f.key]).toLocaleString()}</span> :
                       f.type === 'date' ? <span className="text-gray-600 dark:text-gray-400">{item[f.key] ? new Date(item[f.key]).toLocaleDateString() : '—'}</span> :
                       f.key === 'category' ? <span className="badge-purple">{item[f.key]}</span> :
                       <span className="text-gray-700 dark:text-gray-300">{item[f.key] || '—'}</span>}
                    </td>
                  ))}
                  <td className="py-4 px-6"><div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-blue-500"><HiOutlinePencil className="w-4 h-4" /></button>
                    <button onClick={() => { setSelected(item); setShowDelete(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table></div>
          <Pagination currentPage={page} totalPages={pagination.pages || 1} onPageChange={setPage} />
        </motion.div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? `Edit` : `Add ${title.slice(0, -1)}`} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.key} className={f.fullWidth ? 'col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}{f.required ? ' *' : ''}</label>
                {f.type === 'select' ? (
                  <select className="input-field" required={f.required} value={form[f.key] || ''} onChange={(e) => setForm({...form, [f.key]: e.target.value})}>{(f.options || []).map(o => <option key={o}>{o}</option>)}</select>
                ) : f.type === 'textarea' ? (
                  <textarea className="input-field" rows="3" required={f.required} value={form[f.key] || ''} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
                ) : (
                  <input type={f.type === 'currency' ? 'number' : f.type || 'text'} className="input-field" required={f.required} value={form[f.key] || ''} onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default GenericCRUD;
