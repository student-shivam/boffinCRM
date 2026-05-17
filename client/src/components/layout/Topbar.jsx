import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleDarkMode, toggleMobileSidebar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import { notificationService } from '../../services/dataService';
import {
  HiOutlineBell, HiOutlineMoon, HiOutlineSun, HiOutlineMagnifyingGlass,
  HiOutlineArrowRightOnRectangle, HiOutlineUser, HiOutlineBars3,
} from 'react-icons/hi2';

const Topbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { admin } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data.data.slice(0, 5));
      setUnreadCount(data.unreadCount);
    } catch (err) { /* ignore */ }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-[#f8fafc]/90 dark:bg-[#0B1329]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] dark:shadow-black/20">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Mobile menu & Brand active hub */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={() => dispatch(toggleMobileSidebar())}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-hover text-slate-800 dark:text-slate-200"
          >
            <HiOutlineBars3 className="w-6 h-6" />
          </button>
          <div className="hidden lg:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Live Hub</span>
            <span className="text-slate-300 dark:text-slate-700 text-xs">|</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Boffin CRM Suite</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={() => dispatch(toggleDarkMode())}
            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-hover text-slate-800 dark:text-slate-200 transition-colors"
          >
            {darkMode ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
              className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-hover text-slate-800 dark:text-slate-200 transition-colors relative"
            >
              <HiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                    <button onClick={() => navigate('/notifications')} className="text-xs text-primary-500 hover:text-primary-600">View All</button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-hover border-b border-gray-50 dark:border-dark-border cursor-pointer ${!n.read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover border border-slate-200/60 dark:border-slate-800/80 shadow-sm transition-all duration-200 flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0">
                {admin?.profileImage || admin?.avatar ? (
                  <img
                    src={admin.profileImage || admin.avatar}
                    alt={admin?.fullName || admin?.name || 'Admin'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">
                    {(admin?.fullName || admin?.name)?.[0]?.toUpperCase() || 'A'}
                  </span>
                )}
              </div>
            </button>

            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-200 dark:border-dark-border overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                    <p className="font-bold text-sm text-slate-800 dark:text-white leading-tight">{admin?.name || admin?.fullName || 'Admin User'}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{admin?.email}</p>
                  </div>
                  <div className="py-1 border-b border-gray-100 dark:border-dark-border">
                    <button 
                      onClick={() => {
                        setShowProfile(false);
                        navigate('/profile');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-hover transition-colors font-semibold"
                    >
                      <HiOutlineUser className="w-4 h-4 text-slate-400" />
                      My Profile
                    </button>
                  </div>
                  <div className="py-1">
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold"
                    >
                      <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
