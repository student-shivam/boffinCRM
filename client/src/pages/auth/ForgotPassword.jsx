import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { forgotPassword, clearError, clearMessage } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.auth);

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
    if (message) { toast.success(message); dispatch(clearMessage()); }
  }, [error, message, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    dispatch(forgotPassword(email));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-28 h-28 rounded-2xl overflow-hidden flex items-center justify-center mx-auto mb-4 shadow-lg bg-white p-2 border border-gray-150">
            <img 
              src="/logo/boffin logo.jpg" 
              alt="Company Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-gray-400 mt-1 text-sm">Enter your email to reset your password</p>
        </div>
        <div className="bg-dark-card/80 backdrop-blur-xl border border-dark-border/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" className="input-field" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Send Reset Link'}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300">Back to Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
