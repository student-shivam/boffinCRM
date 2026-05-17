import { useState, useEffect } from 'react';
import { cmsService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, 
  HiOutlineCloudArrowUp, HiOutlineSparkles, HiOutlineMagnifyingGlass 
} from 'react-icons/hi2';

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  // Form Fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    link: ''
  });

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getPage('gallery');
      if (res.data.success && res.data.data) {
        const section = res.data.data.sections?.find(s => s.sectionName === 'Gallery Catalog');
        setGalleryItems(section?.items || []);
      } else {
        setGalleryItems([]);
      }
    } catch (error) {
      // If page not found or empty, initialize empty
      setGalleryItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setForm(prev => ({ ...prev, image: res.data.url }));
        toast.success('Media uploaded successfully to Cloudinary');
      }
    } catch (error) {
      toast.error('Failed to upload media asset');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        description: item.description || '',
        image: item.image || '',
        link: item.link || ''
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        description: '',
        image: '',
        link: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.image) return toast.error('Please upload an image first');
    if (!form.title.trim()) return toast.error('Caption title is required');

    try {
      let updatedItems = [];
      if (editingItem) {
        // Edit existing item inside the array
        updatedItems = galleryItems.map(item => 
          item._id === editingItem._id ? { ...item, ...form } : item
        );
      } else {
        // Add new item to the array
        updatedItems = [...galleryItems, { ...form, _id: Date.now().toString() }];
      }

      // Upsert CMSPage using sections
      const pageData = {
        pageName: 'gallery',
        sections: [{
          sectionName: 'Gallery Catalog',
          title: 'Dynamic Media Catalog',
          isActive: true,
          items: updatedItems
        }]
      };

      const res = await cmsService.updatePage('gallery', pageData);
      if (res.data.success) {
        toast.success(editingItem ? 'Asset caption updated' : 'Media uploaded to catalog');
        setModalOpen(false);
        fetchGallery();
      }
    } catch (error) {
      toast.error('Failed to save gallery items');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently delete this media asset?')) return;

    try {
      const updatedItems = galleryItems.filter(item => item._id !== itemId);
      const pageData = {
        pageName: 'gallery',
        sections: [{
          sectionName: 'Gallery Catalog',
          title: 'Dynamic Media Catalog',
          isActive: true,
          items: updatedItems
        }]
      };

      const res = await cmsService.updatePage('gallery', pageData);
      if (res.data.success) {
        toast.success('Asset deleted from gallery');
        fetchGallery();
      }
    } catch (error) {
      toast.error('Failed to delete asset');
    }
  };

  const filteredItems = galleryItems.filter(item => 
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Gallery Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Upload portfolio assets and corporate media visible on your website.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Media Asset
        </button>
      </div>

      {/* Control bar */}
      <div className="flex bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex-1 relative">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search media assets by caption or tagline..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      {/* Gallery Cards Showcase */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No media assets found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Upload photos to create a gorgeous dynamic grid on your website.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add Asset
          </button>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative overflow-hidden bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                {/* Visual */}
                <div className="aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-dark-border relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Actions on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center gap-3">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-2.5 bg-white hover:bg-primary-50 text-gray-800 rounded-xl shadow-md transition transform hover:scale-110"
                    >
                      <HiOutlinePencil className="w-5 h-5 text-primary-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2.5 bg-white hover:bg-red-50 text-red-600 rounded-xl shadow-md transition transform hover:scale-110"
                    >
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'No tagline description provided.'}
                    </p>
                  </div>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline mt-3 block"
                    >
                      Related Link →
                    </a>
                  )}
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-dark-border shadow-2xl"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Asset Caption' : 'Upload Asset to Gallery'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Media Picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Image Asset *
                </label>
                {form.image ? (
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border mb-3">
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-dark-border/30 transition relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={uploading}
                    />
                    <div className="flex flex-col items-center">
                      <HiOutlineCloudArrowUp className="w-10 h-10 text-gray-400 mb-1" />
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {uploading ? 'Processing Image...' : 'Click to select media photo'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Direct upload to Cloudinary (PNG/JPG)</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Caption Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Annual Board Meeting 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Brief Tagline / Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell something about this event or milestone..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Action Link (Optional)
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="e.g., https://corporate-news.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-dark-border rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition"
                >
                  {editingItem ? 'Publish Updates' : 'Add to Catalog'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
