import { useState, useEffect } from 'react';
import { companyService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiOutlineBuildingOffice, HiOutlineEnvelope, HiOutlinePhone, 
  HiOutlineGlobeAlt, HiOutlineDocumentText, HiOutlineSparkles,
  HiOutlineCloudArrowUp, HiOutlineTrash, HiOutlineCheckCircle,
  HiOutlineSwatch
} from 'react-icons/hi2';

const CompanySettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Form Fields
  const [form, setForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    website: '',
    gstNumber: '',
    panNumber: '',
    companyLogo: '',
    signature: '',
    stamp: '',
    themeColor: '#1e3a8a'
  });

  // Individual Upload Loading States
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSig, setUploadingSig] = useState(false);
  const [uploadingStamp, setUploadingStamp] = useState(false);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      setLoading(true);
      const res = await companyService.getDetails();
      if (res.data.success && res.data.data) {
        setForm(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to load company configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Loading State Selection
    let setUploadState;
    if (type === 'logo') setUploadState = setUploadingLogo;
    else if (type === 'sig') setUploadState = setUploadingSig;
    else if (type === 'stamp') setUploadState = setUploadingStamp;

    try {
      setUploadState(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setForm(prev => ({
          ...prev,
          [type === 'logo' ? 'companyLogo' : type === 'sig' ? 'signature' : 'stamp']: res.data.url
        }));
        toast.success(`${type === 'logo' ? 'Logo' : type === 'sig' ? 'Signature' : 'Stamp'} uploaded successfully!`);
      }
    } catch (error) {
      toast.error('File upload failed. Please try again.');
    } finally {
      setUploadState(false);
    }
  };

  const handleDeleteAsset = (field) => {
    setForm(prev => ({ ...prev, [field]: '' }));
    toast.success('Asset removed successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await companyService.updateDetails(form);
      if (res.data.success) {
        toast.success('Company settings saved successfully!');
        if (res.data.data) {
          setForm(res.data.data);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save company settings');
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    '#1e3a8a', // Navy Blue (Default)
    '#0f172a', // Slate Dark
    '#0284c7', // Sky Blue
    '#059669', // Emerald Green
    '#7c3aed', // Royal Violet
    '#db2777', // Rose Pink
    '#ea580c', // Dark Amber
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
          <div className="absolute top-0 left-0 w-16 h-16 flex items-center justify-center font-bold text-xs text-primary-600">
            CRM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Premium Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <HiOutlineBuildingOffice className="w-48 h-48" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="px-3 py-1 bg-primary-500/20 text-primary-300 border border-primary-500/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <HiOutlineSparkles className="w-3.5 h-3.5" /> Core Enterprise Engine
          </span>
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">Company Settings</h1>
          <p className="text-slate-400 max-w-2xl text-sm lg:text-base leading-relaxed">
            Manage your company profile, branding assets, custom color themes, legal tax information, and digital signing certificates. All configurations apply live across PDFs and reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Cards */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-dark-border shadow-sm p-4 space-y-1">
            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'general'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/40'
              }`}
            >
              <HiOutlineBuildingOffice className="w-5 h-5" />
              <span>General Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('tax')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'tax'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/40'
              }`}
            >
              <HiOutlineDocumentText className="w-5 h-5" />
              <span>Tax & Legal Registration</span>
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'branding'
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border border-primary-100 dark:border-primary-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-border/40'
              }`}
            >
              <HiOutlineSwatch className="w-5 h-5" />
              <span>Branding & Assets</span>
            </button>
          </div>

          {/* Quick Stats Panel */}
          <div className="bg-slate-50 dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Branding Identity</h4>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white dark:bg-dark-border rounded-xl flex items-center justify-center p-1.5 shadow-sm border border-slate-100 dark:border-dark-border">
                {form.companyLogo ? (
                  <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-primary-600">{form.companyName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1">{form.companyName || 'Not Set'}</h5>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{form.website || 'No website URL'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-dark-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">PDF Theme Color</span>
                <span className="flex items-center gap-1.5 font-bold dark:text-white">
                  <span className="w-3.5 h-3.5 rounded-full border border-white shadow-sm" style={{ backgroundColor: form.themeColor }}></span>
                  {form.themeColor.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Digital Seal Status</span>
                <span className={`font-semibold flex items-center gap-1 ${form.stamp ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <HiOutlineCheckCircle className="w-4 h-4" /> {form.stamp ? 'Installed' : 'Missing'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Signature Module</span>
                <span className={`font-semibold flex items-center gap-1 ${form.signature ? 'text-emerald-600' : 'text-amber-500'}`}>
                  <HiOutlineCheckCircle className="w-4 h-4" /> {form.signature ? 'Authorized' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Form Area */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border rounded-2xl p-6 lg:p-8 shadow-sm space-y-8">
            
            {/* General Tab */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">General Information</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">These details represent your legal identity and appear in PDF headers and email sign-offs.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <HiOutlineBuildingOffice className="w-4 h-4 text-slate-400" /> Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      required
                      value={form.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Boffin Web Technology"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <HiOutlineGlobeAlt className="w-4 h-4 text-slate-400" /> Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={form.website}
                      onChange={handleInputChange}
                      placeholder="e.g. https://boffinweb.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <HiOutlineEnvelope className="w-4 h-4 text-slate-400" /> Official Email
                    </label>
                    <input
                      type="email"
                      name="companyEmail"
                      required
                      value={form.companyEmail}
                      onChange={handleInputChange}
                      placeholder="e.g. contact@boffinweb.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                      <HiOutlinePhone className="w-4 h-4 text-slate-400" /> Official Phone Number
                    </label>
                    <input
                      type="text"
                      name="companyPhone"
                      required
                      value={form.companyPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 99999 99999"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Corporate Address
                  </label>
                  <textarea
                    name="companyAddress"
                    rows="3"
                    required
                    value={form.companyAddress}
                    onChange={handleInputChange}
                    placeholder="Full headquarters address..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  />
                </div>
              </motion.div>
            )}

            {/* Tax & Registration Tab */}
            {activeTab === 'tax' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Taxation & Legal Details</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Provide official government identification numbers for seamless compliance on payslips and business invoices.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      GSTIN (GST Number)
                    </label>
                    <input
                      type="text"
                      name="gstNumber"
                      value={form.gstNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 09AAACB1234C1Z2"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Permanent Account Number (PAN)
                    </label>
                    <input
                      type="text"
                      name="panNumber"
                      value={form.panNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. ABCDE1234F"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition uppercase"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Branding & Assets Tab */}
            {activeTab === 'branding' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Branding & Corporate Assets</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Configure visual items such as logos, stamps, authorized signatures, and colors to tailor PDF rendering.</p>
                </div>

                {/* Color Theme Picker */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    PDF Document Theme Color
                  </label>
                  <div className="flex flex-wrap items-center gap-3">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, themeColor: color }))}
                        className="w-9 h-9 rounded-xl border-2 shadow-sm transition flex items-center justify-center relative hover:scale-105"
                        style={{ 
                          backgroundColor: color,
                          borderColor: form.themeColor === color ? '#ffffff' : 'transparent',
                        }}
                      >
                        {form.themeColor === color && (
                          <HiOutlineCheckCircle className="w-5 h-5 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                    
                    {/* Custom Hex Input */}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={form.themeColor}
                        onChange={(e) => setForm(prev => ({ ...prev, themeColor: e.target.value }))}
                        className="w-8 h-8 rounded-lg border border-slate-300 dark:border-dark-border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        name="themeColor"
                        value={form.themeColor}
                        onChange={handleInputChange}
                        placeholder="#1E3A8A"
                        className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-dark-border bg-transparent dark:text-white text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Grids */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Logo Box */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Company Logo</label>
                    {form.companyLogo ? (
                      <div className="relative aspect-square bg-slate-50 dark:bg-dark-border rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border p-4 flex items-center justify-center">
                        <img src={form.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset('companyLogo')}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-2xl aspect-square flex flex-col items-center justify-center p-4 hover:bg-slate-50 dark:hover:bg-dark-border/10 transition relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'logo')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={uploadingLogo}
                        />
                        <HiOutlineCloudArrowUp className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">
                          {uploadingLogo ? 'Uploading logo...' : 'Upload High-Res Logo'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stamp Box */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Company Stamp / Seal</label>
                    {form.stamp ? (
                      <div className="relative aspect-square bg-slate-50 dark:bg-dark-border rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border p-4 flex items-center justify-center">
                        <img src={form.stamp} alt="Stamp" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset('stamp')}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-2xl aspect-square flex flex-col items-center justify-center p-4 hover:bg-slate-50 dark:hover:bg-dark-border/10 transition relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'stamp')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={uploadingStamp}
                        />
                        <HiOutlineCloudArrowUp className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">
                          {uploadingStamp ? 'Uploading seal...' : 'Upload Official Seal'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Signature Box */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase">Authorized Signature</label>
                    {form.signature ? (
                      <div className="relative aspect-square bg-slate-50 dark:bg-dark-border rounded-2xl overflow-hidden border border-slate-200 dark:border-dark-border p-4 flex items-center justify-center">
                        <img src={form.signature} alt="Signature" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset('signature')}
                          className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
                        >
                          <HiOutlineTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 dark:border-dark-border rounded-2xl aspect-square flex flex-col items-center justify-center p-4 hover:bg-slate-50 dark:hover:bg-dark-border/10 transition relative cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'sig')}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          disabled={uploadingSig}
                        />
                        <HiOutlineCloudArrowUp className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">
                          {uploadingSig ? 'Uploading signature...' : 'Upload Digital Signature'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            )}

            {/* Submission Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-dark-border flex justify-end">
              <button
                type="submit"
                disabled={saving || uploadingLogo || uploadingSig || uploadingStamp}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Saving Changes...
                  </>
                ) : (
                  'Save Settings & Assets'
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default CompanySettings;
