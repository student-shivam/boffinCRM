import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { serviceManagementService, serviceCategoryService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiOutlineArrowLeft, HiOutlineSparkles, HiOutlineLink, HiOutlineTrash, 
  HiOutlineCloudArrowUp, HiOutlineEye, HiOutlineCodeBracket, HiOutlineMagnifyingGlass 
} from 'react-icons/hi2';

const tabs = [
  { id: 'general', label: 'General Info', icon: HiOutlineSparkles },
  { id: 'features', label: 'Features & Tech', icon: HiOutlineCodeBracket },
  { id: 'images', label: 'Media Assets', icon: HiOutlineCloudArrowUp },
  { id: 'seo', label: 'SEO Settings', icon: HiOutlineMagnifyingGlass }
];

const ServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [activeTab, setActiveTab] = useState('general');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    serviceName: '',
    shortDescription: '',
    fullDescription: '',
    category: '',
    price: 0,
    discountPrice: 0,
    duration: '',
    featured: false,
    status: 'Active',
    image: '',
    gallery: [],
    portfolioLinks: [],
    technologies: [],
    features: [],
    metaTitle: '',
    metaDescription: '',
    keywords: []
  });

  // Local helper input states
  const [techInput, setTechInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [portfolioInput, setPortfolioInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) fetchService();
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await serviceCategoryService.getAll();
      if (res.data.success) {
        setCategories(res.data.data);
        if (!isEdit && res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load categories');
    }
  };

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await serviceManagementService.getAll();
      if (res.data.success) {
        const item = res.data.data.find(s => s._id === id);
        if (item) {
          setFormData({
            ...item,
            category: item.category?._id || item.category || ''
          });
        } else {
          toast.error('Service not found');
          navigate('/admin/services');
        }
      }
    } catch (err) {
      toast.error('Failed to fetch service details');
    } finally {
      setLoading(false);
    }
  };

  // Thumbnail upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setFormData(prev => ({ ...prev, image: res.data.url }));
        toast.success('Thumbnail uploaded successfully');
      }
    } catch (err) {
      toast.error('Thumbnail upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  // Gallery multi-upload
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setUploadingGallery(true);
      const urls = [];
      for (const file of files) {
        const res = await uploadService.uploadFile(file);
        if (res.data.success) urls.push(res.data.url);
      }
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...urls] }));
      toast.success('Gallery images uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload gallery images');
    } finally {
      setUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Tag & List item adding/removing handlers
  const handleAddTech = () => {
    if (!techInput.trim()) return;
    if (formData.technologies.includes(techInput.trim())) return;
    setFormData(prev => ({ ...prev, technologies: [...prev.technologies, techInput.trim()] }));
    setTechInput('');
  };

  const handleRemoveTech = (tag) => {
    setFormData(prev => ({ ...prev, technologies: prev.technologies.filter(t => t !== tag) }));
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (formData.keywords.includes(keywordInput.trim())) return;
    setFormData(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw) => {
    setFormData(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const handleAddPortfolio = () => {
    if (!portfolioInput.trim()) return;
    setFormData(prev => ({ ...prev, portfolioLinks: [...prev.portfolioLinks, portfolioInput.trim()] }));
    setPortfolioInput('');
  };

  const handleRemovePortfolio = (idx) => {
    setFormData(prev => ({ ...prev, portfolioLinks: prev.portfolioLinks.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceName.trim()) return toast.error('Service Name is required');
    if (!formData.image) return toast.error('Main thumbnail image is required');
    if (!formData.category) return toast.error('Please select a category');

    try {
      setSubmitting(true);
      if (isEdit) {
        const res = await serviceManagementService.update(id, formData);
        if (res.data.success) {
          toast.success('Service updated successfully');
          navigate('/admin/services');
        }
      } else {
        const res = await serviceManagementService.create(formData);
        if (res.data.success) {
          toast.success('Service launched successfully');
          navigate('/admin/services');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Top Navigation / Breadcrumbs */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate('/admin/services')}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-dark-border rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          Back to Services
        </button>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-full">
          {isEdit ? 'Revision Mode' : 'New Integration'}
        </span>
      </div>

      {/* Header Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {isEdit ? 'Edit Service' : 'Add New Service'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sync this data live with the dynamic website by keeping the information premium and SEO optimized.
        </p>
      </div>

      {/* Dynamic Tab Switcher */}
      <div className="flex border-b border-gray-200 dark:border-dark-border overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm space-y-6">
        
        {/* TAB 1: General Info */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">Basic Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.serviceName}
                  onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                  placeholder="e.g., Website Development"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 50000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Discount Price (₹)
                </label>
                <input
                  type="number"
                  value={formData.discountPrice}
                  onChange={(e) => setFormData({ ...formData, discountPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g., 40000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Duration (e.g., 2 Weeks, Monthly)
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 3-4 Weeks"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              {/* Status / Featured Toggles */}
              <div className="flex items-center gap-8 bg-gray-50 dark:bg-dark-border px-4 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="featured" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
                    Featured Service
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="status"
                    checked={formData.status === 'Active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="status" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none">
                    Active / Live
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Short Tagline / Brief Description *
              </label>
              <input
                type="text"
                required
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="Brief summary shown on listings..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Full Service Description
              </label>
              <textarea
                rows="6"
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                placeholder="Describe your service in details, outlining packages and deliverables..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        )}

        {/* TAB 2: Features & Tech */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">Highlights & Stack</h2>
            
            {/* Technologies */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Technologies Used
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g., React, Tailwind, Node.js"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                />
                <button
                  type="button"
                  onClick={handleAddTech}
                  className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                >
                  Add Tag
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.technologies.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-300">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTech(tag)} className="text-red-500 hover:text-red-600 font-bold ml-1">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features list */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Features List / Key Deliverables
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  placeholder="e.g., 100% responsive interface, 24/7 technical support"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                />
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {formData.features.map((feature, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-dark-border/50 px-4 py-2 rounded-xl">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-red-500 hover:text-red-600">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Media Uploads */}
        {activeTab === 'images' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">Service Media Assets</h2>
            
            {/* Thumbnail Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Service Thumbnail *
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-dark-border/30 transition relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    disabled={uploadingImage}
                  />
                  <div className="flex flex-col items-center">
                    <HiOutlineCloudArrowUp className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {uploadingImage ? 'Uploading image...' : 'Click to select main thumbnail'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Supports PNG, JPG, WEBP (Max 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Preview Thumbnail */}
              <div className="flex flex-col justify-center items-center bg-gray-50 dark:bg-dark-border/40 rounded-2xl p-4 border border-gray-100 dark:border-dark-border">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview Thumbnail"
                    className="w-full max-h-48 object-cover rounded-xl shadow"
                  />
                ) : (
                  <span className="text-sm text-gray-400">No thumbnail selected yet.</span>
                )}
              </div>
            </div>

            {/* Gallery Multi Upload */}
            <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Gallery Images
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-dark-border/30 transition relative mb-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleGalleryUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  disabled={uploadingGallery}
                />
                <div className="flex flex-col items-center">
                  <HiOutlineCloudArrowUp className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {uploadingGallery ? 'Uploading images...' : 'Click to select multiple gallery images'}
                  </p>
                </div>
              </div>

              {/* Gallery Previews */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formData.gallery.map((img, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border shadow-sm">
                    <img src={img} alt="Gallery item" className="h-28 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition duration-200"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SEO Settings */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">Search Engine optimization</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  placeholder="e.g., Premium Web Development Services"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Keywords / Tag Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    placeholder="e.g., SEO, Branding, Marketing"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  />
                  <button
                    type="button"
                    onClick={handleAddKeyword}
                    className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.keywords.map(kw => (
                    <span key={kw} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-dark-border rounded-lg text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {kw}
                      <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-red-500 hover:text-red-600 font-bold ml-1">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Meta Description
              </label>
              <textarea
                rows="4"
                value={formData.metaDescription}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="Include key SEO phrases for better listing rank..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
              />
            </div>

            {/* Portfolio Links */}
            <div className="pt-6 border-t border-gray-100 dark:border-dark-border">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Related Portfolio Projects (URLs)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={portfolioInput}
                  onChange={(e) => setPortfolioInput(e.target.value)}
                  placeholder="e.g., https://github.com/project or your project domain"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPortfolio())}
                />
                <button
                  type="button"
                  onClick={handleAddPortfolio}
                  className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
                >
                  Add Link
                </button>
              </div>
              <div className="space-y-2 mt-3">
                {formData.portfolioLinks.map((link, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 dark:bg-dark-border/50 px-4 py-2 rounded-xl">
                    <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1.5">
                      <HiOutlineLink className="w-4 h-4" /> {link}
                    </a>
                    <button type="button" onClick={() => handleRemovePortfolio(idx)} className="text-red-500 hover:text-red-600">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Actions Submit Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-dark-border">
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="px-6 py-2.5 border border-gray-300 dark:border-dark-border rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-border transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
          >
            {submitting ? 'Saving Integration...' : isEdit ? 'Publish Updates' : 'Launch Offering'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ServiceForm;
