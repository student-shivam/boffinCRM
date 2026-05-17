import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { login, clearError } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import TechBackground from '../../components/ui/TechBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Premium Constellation & Tech Background */}
      <TechBackground />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative w-full max-w-[440px] z-20"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 bg-white/95 shadow-[0_0_35px_rgba(99,102,241,0.25)] p-2 border border-white/10 hover:scale-105 transition-all duration-350 ease-out">
            <img 
              src="/logo/boffin logo.jpg" 
              alt="Company Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
            Enterprise Management
          </h1>
          <p className="text-slate-400 mt-2 text-sm tracking-wide">
            Sign in to your admin dashboard
          </p>
        </div>

        {/* Premium Glassmorphic Login Card */}
        <div className="bg-slate-900/50 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:border-indigo-500/20 transition-all duration-500 ease-out">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-950/60 border border-white/5 rounded-xl text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/80 outline-none transition-all duration-300 backdrop-blur-sm shadow-inner"
                autoComplete="current-password"
              />
            </div>
            <div className="flex items-center justify-end">
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors tracking-wide"
              >
                Forgot password?
              </Link>
            </div>
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-95 shadow-[0_4px_25px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_35px_rgba(168,85,247,0.4)] transition-all duration-300 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
