import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { cmsService } from '../services/dataService';

const CMS = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ pageName: '', seo: { metaTitle: '', metaDescription: '' } });

  useEffect(() => { fetchPages(); }, []);

  const fetchPages = async () => {
    try { setLoading(true); const { data } = await cmsService.getAll(); setPages(data.data); } catch { setPages([]); } finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selected) { await cmsService.updatePage(selected.pageName, form); toast.success('Page updated'); }
      else { await cmsService.createPage(form); toast.success('Page created'); }
      setShowModal(false); fetchPages();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (name) => {
    try { await cmsService.deletePage(name); toast.success('Page deleted'); fetchPages(); } catch { toast.error('Error'); }
  };

  const defaultPages = ['homepage', 'about', 'services', 'contact', 'faq', 'testimonials', 'gallery'];

  return (
    <div>
      <PageHeader title="CMS Pages" subtitle="Manage website content and SEO">
        <button onClick={() => { setSelected(null); setForm({ pageName: '', seo: { metaTitle: '', metaDescription: '' } }); setShowModal(true); }} className="btn-primary flex items-center gap-2"><HiOutlinePlus className="w-4 h-4" /> Add Page</button>
      </PageHeader>

      {loading ? <LoadingSkeleton type="table" count={4} /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400 mb-4">No CMS pages yet. Create your first page or use quick templates:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {defaultPages.map(p => (
                  <button key={p} onClick={async () => { try { await cmsService.createPage({ pageName: p, seo: { metaTitle: p } }); toast.success(`${p} page created`); fetchPages(); } catch {} }} className="btn-secondary text-sm capitalize">{p}</button>
                ))}
              </div>
            </div>
          ) : pages.map((p) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 hover:shadow-xl transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{p.pageName}</h3>
                  <p className="text-xs text-gray-400 mt-1">{p.sections?.length || 0} sections</p>
                  {p.seo?.metaTitle && <p className="text-xs text-primary-400 mt-1 truncate max-w-[200px]">SEO: {p.seo.metaTitle}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelected(p); setForm({ pageName: p.pageName, seo: p.seo || {} }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400"><HiOutlinePencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.pageName)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
                <p className="text-xs text-gray-400">Updated: {new Date(p.updatedAt).toLocaleDateString()}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? 'Edit Page' : 'New Page'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page Name *</label><input className="input-field" required value={form.pageName} onChange={(e) => setForm({...form, pageName: e.target.value})} disabled={!!selected} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Title</label><input className="input-field" value={form.seo?.metaTitle || ''} onChange={(e) => setForm({...form, seo: {...form.seo, metaTitle: e.target.value}})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meta Description</label><textarea className="input-field" rows="3" value={form.seo?.metaDescription || ''} onChange={(e) => setForm({...form, seo: {...form.seo, metaDescription: e.target.value}})} /></div>
          <div className="flex gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button><button type="submit" className="btn-primary flex-1">{selected ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default CMS;
