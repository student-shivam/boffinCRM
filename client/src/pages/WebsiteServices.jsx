import { useState, useEffect } from 'react';
import { serviceManagementService, serviceCategoryService } from '../services/dataService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiOutlineArrowRight, HiOutlineClock, HiOutlineSparkles } from 'react-icons/hi2';

const WebsiteServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        serviceManagementService.getAll({ status: 'Active' }),
        serviceCategoryService.getAll()
      ]);

      if (servicesRes.data.success) {
        setServices(servicesRes.data.data);
      }
      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data.filter(c => c.status === 'Active'));
      }
    } catch (error) {
      console.error('Failed to load website services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category?._id === selectedCategory || s.category === selectedCategory || s.category?.slug === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-16">
      
      {/* Decorative Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 py-24 px-6 border-b border-slate-800">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_60%)]" />
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs tracking-wider uppercase rounded-full"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            Our Expertise & Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white"
          >
            Powering Your <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Digital Future</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed"
          >
            We design, develop, and scale professional digital solutions. Select a category below to explore our dynamic service offerings.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 space-y-12">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All Services
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800/60 max-w-xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-2">No active services</h3>
            <p className="text-slate-400">Please check back later or contact admin for immediate enquiries.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group flex flex-col justify-between overflow-hidden bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 hover:border-indigo-500/40 rounded-3xl hover:shadow-2xl hover:shadow-indigo-950/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Thumbnail */}
                <div className="relative overflow-hidden aspect-[16/10]">
                  <img
                    src={service.image}
                    alt={service.serviceName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {service.featured && (
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600/90 backdrop-blur-sm text-xs font-bold text-white rounded-lg shadow-md border border-indigo-500">
                      Popular
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
                      {service.category?.name || 'Enterprise'}
                    </span>
                    <h3 className="text-2xl font-bold text-white group-hover:text-indigo-400 transition duration-200">
                      {service.serviceName}
                    </h3>
                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>

                  {/* Footer Stats & Pricing */}
                  <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Base Pricing</p>
                      <h4 className="text-xl font-black text-white">
                        {service.discountPrice ? (
                          <>
                            <span className="text-slate-500 line-through text-sm mr-1.5">₹{service.price?.toLocaleString()}</span>
                            <span className="text-indigo-400">₹{service.discountPrice?.toLocaleString()}</span>
                          </>
                        ) : (
                          `₹${service.price?.toLocaleString()}`
                        )}
                      </h4>
                    </div>

                    <button
                      onClick={() => navigate(`/services/${service.slug}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 group-hover:bg-indigo-600 text-slate-200 group-hover:text-white rounded-xl font-semibold text-sm transition-all duration-300"
                    >
                      Details
                      <HiOutlineArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default WebsiteServices;
