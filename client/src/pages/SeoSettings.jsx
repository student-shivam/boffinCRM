import { useState, useEffect } from 'react';
import { cmsService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiOutlineSparkles, HiOutlineMagnifyingGlass, HiOutlineTrash, 
  HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineEye 
} from 'react-icons/hi2';

const SeoSettings = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');

  // SEO Form Fields
  const [seoForm, setSeoForm] = useState({
    metaTitle: '',
    metaDescription: '',
    ogImage: '',
    keywords: []
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await cmsService.getAll();
      if (res.data.success) {
        setPages(res.data.data);
        if (res.data.data.length > 0) {
          handleSelectPage(res.data.data[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load SEO pages catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPage = (page) => {
    setSelectedPage(page);
    setSeoForm({
      metaTitle: page.seo?.metaTitle || '',
      metaDescription: page.seo?.metaDescription || '',
      ogImage: page.seo?.ogImage || '',
      keywords: page.seo?.keywords || []
    });
  };

  const handleUploadOgImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setSeoForm(prev => ({ ...prev, ogImage: res.data.url }));
        toast.success('Social OpenGraph image uploaded successfully');
      }
    } catch (error) {
      toast.error('Failed to upload social sharing asset');
    } finally {
      setUploading(false);
    }
  };

  const handleAddKeyword = () => {
    if (!keywordInput.trim()) return;
    if (seoForm.keywords.includes(keywordInput.trim())) return;
    setSeoForm(prev => ({ ...prev, keywords: [...prev.keywords, keywordInput.trim()] }));
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw) => {
    setSeoForm(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPage) return;

    try {
      // Upsert CMSPage using updated SEO settings
      const pageData = {
        ...selectedPage,
        seo: seoForm
      };

      const res = await cmsService.updatePage(selectedPage.pageName, pageData);
      if (res.data.success) {
        toast.success(`SEO parameters updated for ${selectedPage.pageName}`);
        fetchPages();
      }
    } catch (error) {
      toast.error('Failed to save SEO parameters');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Search Engine Optimization</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Configure Meta tags, keywords, search ranking titles, and social share banners per page.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : pages.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No CMS Pages Available</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create pages inside CMS center first to authorize meta parameter tracking.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Col 1: Pages Selection List */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Catalog</h3>
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm p-4 space-y-2">
              {pages.map((p) => (
                <button
                  key={p._id}
                  onClick={() => handleSelectPage(p)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition flex justify-between items-center ${
                    selectedPage?.pageName === p.pageName
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-200/50'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-border border border-transparent'
                  }`}
                >
                  <span className="capitalize">{p.pageName} Page</span>
                  <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Col 2: SEO Form parameters */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
              SEO Profile: {selectedPage?.pageName}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Form Input parameters */}
              <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border p-6 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Meta Title Tag
                  </label>
                  <input
                    type="text"
                    required
                    value={seoForm.metaTitle}
                    onChange={(e) => setSeoForm({ ...seoForm, metaTitle: e.target.value })}
                    placeholder="e.g., Premium Web Development & Digital Branding Services"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Recommended length: 50-60 characters.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={seoForm.metaDescription}
                    onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                    placeholder="Provide a detailed meta snippet showing page deliverables..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Recommended length: 150-160 characters.</p>
                </div>

                {/* Keywords tags block */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    SEO Keywords
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="e.g., Branding, ERP"
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
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {seoForm.keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 dark:bg-dark-border rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {kw}
                        <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-red-500 hover:text-red-600 font-bold ml-1">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* OpenGraph Social Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    OpenGraph Social Image
                  </label>
                  {seoForm.ogImage ? (
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border mb-3">
                      <img src={seoForm.ogImage} alt="Social banner" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setSeoForm(prev => ({ ...prev, ogImage: '' }))}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 dark:border-dark-border rounded-xl p-4 text-center hover:bg-gray-50 dark:hover:bg-dark-border/30 transition relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadOgImage}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        disabled={uploading}
                      />
                      <div className="flex flex-col items-center">
                        <HiOutlineCloudArrowUp className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                          {uploading ? 'Uploading banner...' : 'Upload Social Sharing Banner'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-dark-border">
                  <button
                    type="submit"
                    className="w-full px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition"
                  >
                    Save SEO Profile
                  </button>
                </div>

              </form>

              {/* Live Preview Column (Col-2) */}
              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <HiOutlineEye className="w-5 h-5 text-primary-500" /> Google Search Preview
                </h4>
                
                {/* Search mock */}
                <div className="bg-white dark:bg-dark-card border border-gray-150 dark:border-dark-border p-6 rounded-2xl shadow-sm space-y-2">
                  <p className="text-[11px] text-gray-400 dark:text-gray-500">https://company.com/{selectedPage?.pageName}</p>
                  <h4 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer line-clamp-1">
                    {seoForm.metaTitle || 'Please type a meta title...'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {seoForm.metaDescription || 'Please write a descriptive meta tag description to display exact social preview indexing...'}
                  </p>
                </div>

                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 pt-4">
                  <HiOutlineSparkles className="w-5 h-5 text-primary-500" /> Facebook Social Share Card
                </h4>

                {/* Facebook mock */}
                <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-[16/9] bg-gray-100 dark:bg-dark-border relative">
                    {seoForm.ogImage ? (
                      <img src={seoForm.ogImage} alt="Social banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No OpenGraph Image Selected
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-dark-border/40 space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">COMPANY.COM</p>
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">
                      {seoForm.metaTitle || 'Meta Title tag goes here'}
                    </h5>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {seoForm.metaDescription || 'Meta description description mock tag...'}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default SeoSettings;
