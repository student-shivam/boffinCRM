import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateAdminState } from '../redux/slices/authSlice';
import { adminProfileService, uploadService } from '../services/dataService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineUser, HiOutlineBuildingOffice, HiOutlineLockClosed, 
  HiOutlineShare, HiOutlineClock, HiOutlineCloudArrowUp, 
  HiOutlineEye, HiOutlineEyeSlash, HiOutlineMapPin, HiOutlineCheck 
} from 'react-icons/hi2';

const ProfileSettings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [profile, setProfile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Form states
  const [personalForm, setPersonalForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    designation: '',
    bio: ''
  });

  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyWebsite: '',
    gstNumber: '',
    companyLogo: '',
    businessCategory: '',
    companyAddress: ''
  });

  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: ''
  });

  const [socialForm, setSocialForm] = useState({
    linkedin: '',
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    whatsapp: ''
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await adminProfileService.getProfile();
      if (res.data.success) {
        const data = res.data.data;
        setProfile(data);

        // Sync form states
        setPersonalForm({
          fullName: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          designation: data.designation || 'Administrator',
          bio: data.bio || ''
        });

        setCompanyForm({
          companyName: data.companyName || '',
          companyEmail: data.companyEmail || '',
          companyPhone: data.companyPhone || '',
          companyWebsite: data.companyWebsite || '',
          gstNumber: data.gstNumber || '',
          companyLogo: data.companyLogo || '',
          businessCategory: data.businessCategory || '',
          companyAddress: data.companyAddress || ''
        });

        setAddressForm({
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          pincode: data.pincode || ''
        });

        setSocialForm({
          linkedin: data.socialLinks?.linkedin || '',
          instagram: data.socialLinks?.instagram || '',
          facebook: data.socialLinks?.facebook || '',
          twitter: data.socialLinks?.twitter || '',
          youtube: data.socialLinks?.youtube || '',
          whatsapp: data.socialLinks?.whatsapp || ''
        });
      }
    } catch (error) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        // Save dynamically
        const updatedProfile = { ...profile, profileImage: res.data.url };
        const updateRes = await adminProfileService.updateProfile(updatedProfile);
        if (updateRes.data.success) {
          setProfile(updateRes.data.data);
          dispatch(updateAdminState(updateRes.data.data));
          toast.success('Profile avatar updated');
        }
      }
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await uploadService.uploadFile(file);
      if (res.data.success) {
        setCompanyForm(prev => ({ ...prev, companyLogo: res.data.url }));
        toast.success('Company logo uploaded to draft settings');
      }
    } catch (error) {
      toast.error('Failed to upload company logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    try {
      const res = await adminProfileService.updateProfile(personalForm);
      if (res.data.success) {
        dispatch(updateAdminState(res.data.data));
        toast.success('Personal profile details saved');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to save profile changes');
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    try {
      const res = await adminProfileService.updateProfile(companyForm);
      if (res.data.success) {
        toast.success('Company settings saved successfully');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to save company profile');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await adminProfileService.updateProfile(addressForm);
      if (res.data.success) {
        toast.success('Billing & office address updated');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update address configuration');
    }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    try {
      const res = await adminProfileService.updateProfile({ socialLinks: socialForm });
      if (res.data.success) {
        toast.success('Social handles synchronized live');
        fetchProfile();
      }
    } catch (error) {
      toast.error('Failed to update social channels');
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (securityForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    try {
      const res = await adminProfileService.changePassword({
        currentPassword: securityForm.currentPassword,
        newPassword: securityForm.newPassword
      });
      if (res.data.success) {
        toast.success('Password changed successfully');
        setSecurityForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password credentials');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: HiOutlineUser },
    { id: 'company', label: 'Company Info', icon: HiOutlineBuildingOffice },
    { id: 'address', label: 'Office Address', icon: HiOutlineMapPin },
    { id: 'socials', label: 'Social Networks', icon: HiOutlineShare },
    { id: 'security', label: 'Security & Access', icon: HiOutlineLockClosed },
    { id: 'logs', label: 'Activity Logs', icon: HiOutlineClock }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner Section */}
      <div className="relative bg-gradient-to-r from-primary-700 to-indigo-800 rounded-3xl p-8 overflow-hidden shadow-lg border border-primary-600">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            {/* Profile Avatar */}
            <div className="relative group">
              <img
                src={profile?.profileImage || profile?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'}
                alt={profile?.fullName || profile?.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-md group-hover:opacity-85 transition"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition">
                <input type="file" accept="image/*" onChange={handleUploadAvatar} className="hidden" />
                <HiOutlineCloudArrowUp className="w-6 h-6 text-white" />
              </label>
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent border-white"></div>
                </div>
              )}
            </div>
            
            <div className="space-y-1 text-white">
              <h2 className="text-2xl font-extrabold">{profile?.fullName || profile?.name}</h2>
              <p className="text-sm text-primary-200 font-semibold">{profile?.designation || 'Administrator'}</p>
              <p className="text-xs text-primary-300/80">{profile?.companyName || 'EMS Suite Client'}</p>
            </div>
          </div>

          <div className="text-center md:text-right text-white space-y-1">
            <p className="text-xs text-primary-200 font-semibold">Join Date: {new Date(profile?.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-primary-300">Role: Main Administrator</p>
          </div>
        </div>
      </div>

      {/* Profile Settings Sheet Tab Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Selector Col */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition border ${
                activeTab === tab.id
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200/50 dark:border-primary-800/30 shadow-sm'
                  : 'bg-white dark:bg-dark-card text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-dark-border border-transparent'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Forms Panel Col */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-white dark:bg-dark-card border border-gray-150 dark:border-dark-border rounded-3xl p-6 shadow-sm"
            >
              
              {/* PANEL 1: PERSONAL INFORMATION */}
              {activeTab === 'personal' && (
                <form onSubmit={handleSavePersonal} className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Personal Information Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={personalForm.fullName}
                        onChange={(e) => setPersonalForm({ ...personalForm, fullName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Contact Phone</label>
                      <input
                        type="text"
                        value={personalForm.phone}
                        onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                        placeholder="e.g., +91 9876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Designation Title</label>
                      <input
                        type="text"
                        value={personalForm.designation}
                        onChange={(e) => setPersonalForm({ ...personalForm, designation: e.target.value })}
                        placeholder="e.g., Chief Administrator"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">About Bio</label>
                      <textarea
                        rows="4"
                        value={personalForm.bio}
                        onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
                        placeholder="Write a brief professional summary about yourself..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <HiOutlineCheck className="w-5 h-5" /> Save Profile Details
                    </button>
                  </div>
                </form>
              )}

              {/* PANEL 2: COMPANY INFORMATION */}
              {activeTab === 'company' && (
                <form onSubmit={handleSaveCompany} className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Corporate Branding & Information
                  </h3>
                  
                  {/* Company Logo Image upload */}
                  <div className="flex items-center gap-5 bg-gray-50 dark:bg-dark-border/20 p-4 rounded-2xl">
                    <div className="relative w-16 h-16 bg-white dark:bg-dark-card rounded-xl overflow-hidden border border-gray-200 dark:border-dark-border flex items-center justify-center">
                      {companyForm.companyLogo ? (
                        <img src={companyForm.companyLogo} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <HiOutlineBuildingOffice className="w-8 h-8 text-gray-400" />
                      )}
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border font-bold text-xs rounded-lg text-gray-700 dark:text-gray-300 cursor-pointer shadow-sm">
                        <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                        <HiOutlineCloudArrowUp className="w-4 h-4" /> Change Company Logo
                      </label>
                      <p className="text-[10px] text-gray-400 mt-1">Accepts SVG, PNG, JPG format (Cloudinary hosted)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company Registered Name</label>
                      <input
                        type="text"
                        value={companyForm.companyName}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company Corporate Email</label>
                      <input
                        type="email"
                        value={companyForm.companyEmail}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyEmail: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Company Helpdesk Phone</label>
                      <input
                        type="text"
                        value={companyForm.companyPhone}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyPhone: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Official Website Link</label>
                      <input
                        type="url"
                        value={companyForm.companyWebsite}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyWebsite: e.target.value })}
                        placeholder="https://company.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">GST/TAX Number</label>
                      <input
                        type="text"
                        value={companyForm.gstNumber}
                        onChange={(e) => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                        placeholder="e.g., 07AAAAA1111A1Z1"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Business Category / Industry</label>
                      <input
                        type="text"
                        value={companyForm.businessCategory}
                        onChange={(e) => setCompanyForm({ ...companyForm, businessCategory: e.target.value })}
                        placeholder="e.g., IT consulting, Manufacturing"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Corporate Headquarters Address</label>
                      <textarea
                        rows="3"
                        value={companyForm.companyAddress}
                        onChange={(e) => setCompanyForm({ ...companyForm, companyAddress: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <HiOutlineCheck className="w-5 h-5" /> Save Corporate Settings
                    </button>
                  </div>
                </form>
              )}

              {/* PANEL 3: OFFICE ADDRESS */}
              {activeTab === 'address' && (
                <form onSubmit={handleSaveAddress} className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Office & Address Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Street Address</label>
                      <input
                        type="text"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        placeholder="Suite room, Building name, Cross Road"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">City</label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">State / Province</label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Postal Pincode</label>
                      <input
                        type="text"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="e.g., 110001"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <HiOutlineCheck className="w-5 h-5" /> Save Address Details
                    </button>
                  </div>
                </form>
              )}

              {/* PANEL 4: SOCIAL CHANNELS */}
              {activeTab === 'socials' && (
                <form onSubmit={handleSaveSocials} className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Social Profile Connections
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-450 uppercase mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        value={socialForm.linkedin}
                        onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-455 uppercase mb-1">Instagram Link</label>
                      <input
                        type="url"
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/username"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-460 uppercase mb-1">Facebook Handle</label>
                      <input
                        type="url"
                        value={socialForm.facebook}
                        onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                        placeholder="https://facebook.com/username"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-465 uppercase mb-1">Twitter / X Handle</label>
                      <input
                        type="url"
                        value={socialForm.twitter}
                        onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                        placeholder="https://twitter.com/username"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-470 uppercase mb-1">YouTube Channel</label>
                      <input
                        type="url"
                        value={socialForm.youtube}
                        onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                        placeholder="https://youtube.com/c/channelname"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-475 uppercase mb-1">WhatsApp Chat API</label>
                      <input
                        type="url"
                        value={socialForm.whatsapp}
                        onChange={(e) => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                        placeholder="https://wa.me/919876543210"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <HiOutlineCheck className="w-5 h-5" /> Synchronize Socials
                    </button>
                  </div>
                </form>
              )}

              {/* PANEL 5: SECURITY & CREDENTIALS */}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Security & Credentials Access
                  </h3>
                  <div className="grid grid-cols-1 gap-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrent ? 'text' : 'password'}
                          required
                          value={securityForm.currentPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrent(!showCurrent)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showCurrent ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">New Password</label>
                      <div className="relative">
                        <input
                          type={showNew ? 'text' : 'password'}
                          required
                          value={securityForm.newPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showNew ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showConfirm ? 'text' : 'password'}
                          required
                          value={securityForm.confirmPassword}
                          onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                          className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white outline-none focus:ring-2 focus:ring-primary-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showConfirm ? <HiOutlineEyeSlash className="w-5 h-5" /> : <HiOutlineEye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-dark-border">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      <HiOutlineLockClosed className="w-5 h-5" /> Update Access Credentials
                    </button>
                  </div>
                </form>
              )}

              {/* PANEL 6: ACTIVITY TIMELINES */}
              {activeTab === 'logs' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-dark-border pb-3">
                    Audit Activity Session Timeline
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Log 1 */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-border/20 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 flex-shrink-0">
                        <HiOutlineClock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Last Account Sign-in</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Just now (Active Session)'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Browser Client details: Chrome/Safari Engine</p>
                      </div>
                    </div>

                    {/* Log 2 */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-border/20 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 flex-shrink-0">
                        <HiOutlineLockClosed className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Last Credentials Change Audit</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {profile?.passwordChangedAt ? new Date(profile.passwordChangedAt).toLocaleString() : 'No recent password changes recorded'}
                        </p>
                      </div>
                    </div>

                    {/* Log 3 */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-dark-border/20 rounded-2xl">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 flex-shrink-0">
                        <HiOutlineUser className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Profile Details Revision Log</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Initial Setup'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
};

export default ProfileSettings;
