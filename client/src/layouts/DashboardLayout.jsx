import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import TechBackground from '../components/ui/TechBackground';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-sky-50/30 dark:bg-slate-950 overflow-hidden relative">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 relative bg-gradient-to-br from-sky-100/40 via-indigo-50/30 to-slate-100/90 dark:from-slate-950 dark:via-dark-bg dark:to-slate-950">
          {/* Subtle Constellation Tech Background behind dashboard routes */}
          <TechBackground 
            showBadges={false} 
            showCode={false} 
            transparent={true} 
            isDashboard={true} 
          />
          
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="h-full relative z-10"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
