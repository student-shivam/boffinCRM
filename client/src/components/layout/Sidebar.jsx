import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleSidebar, toggleMobileSidebar, closeMobileSidebar } from '../../redux/slices/uiSlice';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineUserGroup, HiOutlineBriefcase,
  HiOutlineCurrencyDollar, HiOutlineCalendar, HiOutlineClipboardDocumentList,
  HiOutlineGlobeAlt, HiOutlineServer, HiOutlineDocumentText, HiOutlineChartBar,
  HiOutlineCog, HiOutlineNewspaper, HiOutlineBell, HiOutlineDocumentDuplicate,
  HiOutlineChevronLeft, HiOutlineChevronDown, HiOutlineChevronRight,
  HiArrowRightOnRectangle, HiBanknotes, HiOutlineClipboardDocumentCheck
} from 'react-icons/hi2';

const menuItems = [
  { name: 'Dashboard', icon: HiOutlineHome, path: '/' },
  {
    name: 'CRM', icon: HiOutlineUsers, children: [
      { name: 'Inquiries', path: '/inquiries' },
      { name: 'Leads', path: '/leads' },
      { name: 'Clients', path: '/clients' },
      { name: 'Follow-ups', path: '/followups' },
    ]
  },
  {
    name: 'HRM', icon: HiOutlineUserGroup, children: [
      { name: 'Employees', path: '/employees' },
      { name: 'Attendance', path: '/attendance' },
      { name: 'Leaves', path: '/leaves' },
    ]
  },
  { name: 'Payroll', icon: HiBanknotes, path: '/salary' },
  {
    name: 'Finance', icon: HiOutlineCurrencyDollar, children: [
      { name: 'Dashboard', path: '/profit-loss' },
      { name: 'Income', path: '/income' },
      { name: 'Expenses', path: '/expenses' },
      { name: 'Invoices', path: '/invoices' },
      { name: 'Payments', path: '/payments' },
    ]
  },
  { name: 'Tasks', icon: HiOutlineClipboardDocumentList, path: '/tasks' },
  {
    name: 'Infrastructure', icon: HiOutlineGlobeAlt, children: [
      { name: 'Domains', path: '/domains' },
      { name: 'Servers', path: '/servers' },
    ]
  },
  {
    name: 'CMS', icon: HiOutlineDocumentDuplicate, children: [
      { name: 'Services', path: '/admin/services' },
      { name: 'Categories', path: '/admin/service-categories' },
      { name: 'Blogs', path: '/blogs' },
      { name: 'Gallery', path: '/admin/gallery' },
      { name: 'Testimonials', path: '/admin/testimonials' },
      { name: 'SEO Settings', path: '/admin/seo-settings' },
    ]
  },
  { name: 'Reports', icon: HiOutlineChartBar, path: '/reports' },
  { name: 'Notifications', icon: HiOutlineBell, path: '/notifications' },
  { name: 'Settings', icon: HiOutlineCog, path: '/profile' },
];

const SidebarItem = ({ item, collapsed }) => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`sidebar-link w-full justify-between ${open ? 'text-primary-500 dark:text-primary-400' : ''}`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.name}</span>}
          </div>
          {!collapsed && (
            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <HiOutlineChevronDown className="w-4 h-4" />
            </motion.div>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden ml-4 border-l-2 border-slate-300 dark:border-slate-700/80"
            >
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  onClick={() => dispatch(closeMobileSidebar())}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 ml-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary-600 dark:text-primary-400 font-semibold bg-primary-50 dark:bg-primary-900/20'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium'
                    }`
                  }
                >
                  {child.name}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={() => dispatch(closeMobileSidebar())}
      className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
    >
      <item.icon className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="text-sm">{item.name}</span>}
    </NavLink>
  );
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const { sidebarOpen, mobileSidebarOpen } = useSelector((state) => state.ui);
  const { admin } = useSelector((state) => state.auth);

  const companyLogoSrc = admin?.companyLogo || "/logo/boffin logo.jpg";
  const companyName = admin?.companyName || "Boffin Web Technology";

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 76 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-white dark:bg-dark-card border-r border-slate-200/90 dark:border-slate-800 h-screen sticky top-0 overflow-hidden"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={`flex items-center gap-3 py-4 border-b border-slate-200/90 dark:border-slate-800 transition-all duration-300 ${sidebarOpen ? 'px-6' : 'justify-center px-2'}`}>
            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 flex-shrink-0 border border-slate-200/80 dark:border-slate-800/80 p-1 shadow-sm">
              <img 
                src={companyLogoSrc} 
                alt="Company Logo" 
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
              />
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                <h1 className="font-extrabold text-slate-950 dark:text-slate-50 text-base leading-tight tracking-tight max-w-[165px] whitespace-normal break-words">{companyName}</h1>
              </motion.div>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <SidebarItem key={item.name} item={item} collapsed={!sidebarOpen} />
            ))}
          </nav>

          {/* Collapse button */}
          <div className="px-3 py-4 border-t border-gray-200 dark:border-dark-border">
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="sidebar-link w-full justify-center"
            >
              {sidebarOpen ? <HiOutlineChevronLeft className="w-5 h-5" /> : <HiOutlineChevronRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => dispatch(closeMobileSidebar())}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed left-0 top-0 h-screen w-[260px] bg-white dark:bg-dark-card border-r border-slate-200 dark:border-slate-800 z-50 lg:hidden flex flex-col"
            >
              {/* Logo */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900/60 flex-shrink-0 border border-slate-200/80 dark:border-slate-800/80 p-1 shadow-sm">
                  <img 
                    src={companyLogoSrc} 
                    alt="Company Logo" 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" 
                  />
                </div>
                <div>
                  <h1 className="font-extrabold text-slate-950 dark:text-slate-50 text-base leading-tight tracking-tight max-w-[165px] whitespace-normal break-words">{companyName}</h1>
                </div>
              </div>

              {/* Menu */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <SidebarItem key={item.name} item={item} collapsed={false} />
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
