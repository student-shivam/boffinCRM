import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { serviceManagementService } from '../services/dataService';
import { motion } from 'framer-motion';
import { 
  HiOutlineSparkles, HiOutlineCheckCircle, HiOutlineCpuChip,
  HiOutlineArrowLeft, HiOutlineBriefcase, HiOutlineLink 
} from 'react-icons/hi2';

const ServiceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceDetail();
  }, [slug]);

  const fetchServiceDetail = async () => {
    try {
      setLoading(true);
      const res = await serviceManagementService.getBySlug(slug);
      if (res.data.success) {
        const item = res.data.data;
        setService(item);
        
        // Dynamically inject SEO Tags
        document.title = item.metaTitle || `${item.serviceName} | Dynamic Professional Suite`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', item.metaDescription || item.shortDescription);
        }
      }
    } catch (error) {
      console.error('Failed to load service detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 space-y-4">
        <h2 className="text-3xl font-extrabold text-white">Service Not Found</h2>
        <p className="text-slate-400">The service you are requesting is either offline or has been changed.</p>
        <button
          onClick={() => navigate('/services')}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          View All Services
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24">
      {/* Banner / Hero */}
      <div className="relative py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-6 border-b border-slate-900 overflow-hidden">
        {/* Abstract background grid */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <button
            onClick={() => navigate('/services')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 rounded-xl text-slate-300 font-semibold text-sm transition"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Back to Catalog
          </button>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold text-xs tracking-wider uppercase rounded-lg">
                <HiOutlineSparkles className="w-4 h-4" />
                {service.category?.name || 'Dynamic CMS Integrator'}
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                {service.serviceName}
              </h1>
              <p className="text-lg text-slate-400 leading-relaxed font-medium">
                {service.shortDescription}
              </p>
              {service.duration && (
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <span className="font-bold">Projected Timeline:</span>
                  <span>{service.duration}</span>
                </div>
              )}
            </div>

            {/* Thumbnail Image display */}
            <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative aspect-[16/10]">
              <img
                src={service.image}
                alt={service.serviceName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Details (Col-2) */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Extended Description */}
          {service.fullDescription && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight">Overview</h2>
              <div className="text-slate-400 leading-relaxed whitespace-pre-line text-base sm:text-lg">
                {service.fullDescription}
              </div>
            </section>
          )}

          {/* Features Deliverable List */}
          {service.features && service.features.length > 0 && (
            <section className="space-y-6 pt-6 border-t border-slate-900">
              <h2 className="text-2xl font-bold text-white tracking-tight">Key Deliverables & Features</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.features.map((feature, idx) => (
                  <div key={idx} className="flex gap-3 bg-slate-900/60 border border-slate-900 p-4 rounded-2xl">
                    <HiOutlineCheckCircle className="w-6 h-6 text-indigo-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-slate-300 leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery display */}
          {service.gallery && service.gallery.length > 0 && (
            <section className="space-y-6 pt-6 border-t border-slate-900">
              <h2 className="text-2xl font-bold text-white tracking-tight">Gallery & Visual Assets</h2>
              <div className="grid grid-cols-2 gap-4">
                {service.gallery.map((img, idx) => (
                  <div key={idx} className="rounded-2xl overflow-hidden border border-slate-900 shadow aspect-[4/3]">
                    <img src={img} alt="Service gallery detail" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio Links */}
          {service.portfolioLinks && service.portfolioLinks.length > 0 && (
            <section className="space-y-6 pt-6 border-t border-slate-900">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <HiOutlineBriefcase className="w-6 h-6 text-indigo-400" /> Recent Case Studies
              </h2>
              <div className="space-y-3">
                {service.portfolioLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex justify-between items-center bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 p-4 rounded-2xl hover:bg-slate-900/80 transition group"
                  >
                    <span className="text-sm font-semibold text-slate-300 group-hover:text-indigo-400 transition">{link}</span>
                    <HiOutlineLink className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition" />
                  </a>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Sidebar Call to Action / Pricing (Col-1) */}
        <div className="space-y-8">
          <div className="bg-slate-900 border border-slate-800/80 rounded-3xl p-8 shadow-xl space-y-6 sticky top-24">
            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">Pricing Plan</span>
              <h3 className="text-3xl font-black text-white">
                {service.discountPrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-indigo-400">₹{service.discountPrice?.toLocaleString()}</span>
                    <span className="text-slate-600 line-through text-lg font-medium">₹{service.price?.toLocaleString()}</span>
                  </div>
                ) : (
                  `₹${service.price?.toLocaleString()}`
                )}
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Tax and other transaction charges may apply depending on chosen payment methods.
              </p>
            </div>

            {/* Tech Stack */}
            {service.technologies && service.technologies.length > 0 && (
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <HiOutlineCpuChip className="w-4 h-4 text-indigo-400" /> Technologies Powered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {service.technologies.map(tech => (
                    <span key={tech} className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA action */}
            <div className="pt-6">
              <a
                href={`mailto:sales@company.com?subject=Enquiry regarding ${service.serviceName}`}
                className="block text-center px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Hire Professional Staff
              </a>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default ServiceDetail;
