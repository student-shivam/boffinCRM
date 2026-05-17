import { useState, useEffect } from 'react';
import { serviceManagementService, serviceCategoryService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMagnifyingGlass, 
  HiStar, HiOutlineEye, HiOutlineEyeSlash, HiOutlineSparkles 
} from 'react-icons/hi2';

const Services = () => {
  const navigate = useNavigate();
  
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [analytics, setAnalytics] = useState({ total: 0, active: 0, featured: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes, analyticsRes] = await Promise.all([
        serviceManagementService.getAll(),
        serviceCategoryService.getAll(),
        serviceManagementService.getAnalytics()
      ]);

      if (servicesRes.data.success) setServices(servicesRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
    } catch (error) {
      toast.error('Failed to retrieve services or analytics information');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeatured = async (id, currentVal) => {
    try {
      const res = await serviceManagementService.update(id, { featured: !currentVal });
      if (res.data.success) {
        toast.success(`Service ${!currentVal ? 'featured' : 'unfeatured'} successfully`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to update featured status');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await serviceManagementService.update(id, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Service visibility updated to ${nextStatus}`);
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to change service visibility status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this service? This will remove it from the public website too.')) return;
    try {
      const res = await serviceManagementService.delete(id);
      if (res.data.success) {
        toast.success('Service deleted successfully');
        fetchData();
      }
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
                          service.shortDescription.toLowerCase().includes(search.toLowerCase());
    
    // Support either populated object or string ID comparison
    const matchesCategory = !categoryFilter || 
                            (service.category?._id === categoryFilter || service.category === categoryFilter || service.category?.slug === categoryFilter);
    const matchesStatus = !statusFilter || service.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Services CMS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Add, edit, and manage services displayed on the dynamic company website.</p>
        </div>
        <button
          onClick={() => navigate('/admin/services/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Services', value: analytics.total, color: 'from-blue-500 to-indigo-600' },
          { label: 'Active on Website', value: analytics.active, color: 'from-emerald-400 to-teal-600' },
          { label: 'Featured Offerings', value: analytics.featured, color: 'from-amber-400 to-orange-500' },
          { label: 'Inactive/Hidden', value: analytics.inactive, color: 'from-rose-400 to-red-600' },
        ].map((card, idx) => (
          <div key={idx} className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">{card.value}</h3>
              </div>
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-md`}>
                <HiOutlineSparkles className="w-6 h-6" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-100 to-transparent dark:via-dark-border" />
          </div>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm">
        <div className="flex-1 relative">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services by name or description..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-transparent dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
          />
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-card dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Services Table/List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl p-12 text-center border border-gray-100 dark:border-dark-border shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No services found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create a service now to launch it dynamically on your website.</p>
          <button
            onClick={() => navigate('/admin/services/new')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
          >
            <HiOutlinePlus className="w-5 h-5" /> Add Service
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-dark-border text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100 dark:border-dark-border">
                  <th className="px-6 py-4">Thumbnail</th>
                  <th className="px-6 py-4">Service Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-center">Featured</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredServices.map((service) => (
                  <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-dark-border/50 transition">
                    <td className="px-6 py-4">
                      <img 
                        src={service.image} 
                        alt={service.serviceName} 
                        className="w-14 h-10 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{service.serviceName}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">{service.shortDescription}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                      {service.category?.name || 'Uncategorized'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      ₹{service.price?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(service._id, service.featured)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          service.featured 
                            ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-900/20' 
                            : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50 dark:hover:bg-dark-border'
                        }`}
                      >
                        <HiStar className="w-5 h-5 fill-current" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(service._id, service.status)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          service.status === 'Active'
                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                        }`}
                      >
                        {service.status === 'Active' ? <HiOutlineEye className="w-4 h-4" /> : <HiOutlineEyeSlash className="w-4 h-4" />}
                        {service.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/services/edit/${service._id}`)}
                          className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition"
                        >
                          <HiOutlinePencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id)}
                          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
