import { useState, useEffect } from 'react';
import { cmsService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, 
  HiOutlineCloudArrowUp, HiOutlineSparkles, HiStar 
} from 'react-icons/hi2';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    title: '',         // Client Name
    description: '',   // Client Testimonial Review text
    image: '',         // Avatar photo url
    icon: '5',         // Client Rating (1 to 5 stars)
    link: ''           // Client Designation / Company name
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getPage('testimonials');
      if (res.data.success && res.data.data) {
        const section = res.data.data.sections?.find(s => s.sectionName === 'Client Testimonials');
        setTestimonials(section?.items || []);
      } else {
        setTestimonials([]);
      }
    } catch (error) {
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setForm(prev => ({ ...prev, image: res.data.url }));
        toast.success('Avatar uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload avatar image');
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
        icon: item.icon || '5',
        link: item.link || ''
      });
    } else {
      setEditingItem(null);
      setForm({
        title: '',
        description: '',
        image: '',
        icon: '5',
        link: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Client name is required');
    if (!form.description.trim()) return toast.error('Review feedback description is required');

    try {
      let updatedItems = [];
      if (editingItem) {
        updatedItems = testimonials.map(item => 
          item._id === editingItem._id ? { ...item, ...form } : item
        );
      } else {
        updatedItems = [...testimonials, { ...form, _id: Date.now().toString() }];
      }

      const pageData = {
        pageName: 'testimonials',
        sections: [{
          sectionName: 'Client Testimonials',
          title: 'Premium Feedback Matrix',
          isActive: true,
          items: updatedItems
        }]
      };

      const res = await cmsService.updatePage('testimonials', pageData);
      if (res.data.success) {
        toast.success(editingItem ? 'Testimonial modified' : 'Testimonial listed live');
        setModalOpen(false);
        fetchTestimonials();
      }
    } catch (error) {
      toast.error('Failed to update testimonials');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to permanently remove this testimonial?')) return;

    try {
      const updatedItems = testimonials.filter(item => item._id !== itemId);
      const pageData = {
        pageName: 'testimonials',
        sections: [{
          sectionName: 'Client Testimonials',
          title: 'Premium Feedback Matrix',
          isActive: true,
          items: updatedItems
        }]
      };

      const res = await cmsService.updatePage('testimonials', pageData);
      if (res.data.success) {
        toast.success('Testimonial removed successfully');
        fetchTestimonials();
      }
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Testimonials CMS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage client reviews, stars, ratings and references live on your portal.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews listed</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Display customer testimonials dynamically to build market trust.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {testimonials.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between"
              >
                <div>
                  {/* Rating star badges */}
                  <div className="flex gap-0.5 text-amber-500 mb-4">
                    {Array.from({ length: parseInt(item.icon) || 5 }).map((_, i) => (
                      <HiStar key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>

                  {/* Review quote */}
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-6">
                    "{item.description}"
                  </p>
                </div>

                {/* Footer client card details */}
                <div className="flex justify-between items-center border-t border-gray-100 dark:border-dark-border pt-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={item.title}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 font-medium">{item.link || 'Verified Client'}</p>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenModal(item)}
                      className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg transition"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>

              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden border border-gray-100 dark:border-dark-border shadow-2xl"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-dark-border">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingItem ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border rounded-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Avatar picker */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Client Avatar / Picture
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={form.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt="Client avatar"
                    className="w-16 h-16 rounded-full object-cover border border-gray-200 shadow-sm"
                  />
                  <div className="relative border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl px-4 py-2 text-center hover:bg-gray-50 dark:hover:bg-dark-border/30 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      disabled={uploading}
                    />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {uploading ? 'Uploading...' : 'Choose avatar'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Designation / Company
                </label>
                <input
                  type="text"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="e.g., CEO, TechCorp Inc."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Client Star Rating
                </label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                >
                  <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                  <option value="3">⭐⭐⭐ (3 Stars)</option>
                  <option value="2">⭐⭐ (2 Stars)</option>
                  <option value="1">⭐ (1 Star)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Review Statement *
                </label>
                <textarea
                  rows="4"
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Paste what the customer said about your service..."
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
                  {editingItem ? 'Publish Updates' : 'Add Testimonial'}
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
