import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { notificationService } from '../services/dataService';

const typeIcons = { lead: '🎯', task: '📋', domain: '🌐', salary: '💰', expense: '💸', info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌' };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try { setLoading(true); const { data } = await notificationService.getAll(); setNotifications(data.data); } catch { setNotifications([]); } finally { setLoading(false); }
  };

  const markRead = async (id) => { try { await notificationService.markRead(id); fetchNotifications(); } catch {} };
  const markAllRead = async () => { try { await notificationService.markAllRead(); toast.success('All marked as read'); fetchNotifications(); } catch {} };
  const deleteNotif = async (id) => { try { await notificationService.delete(id); toast.success('Deleted'); fetchNotifications(); } catch {} };

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Stay updated with alerts">
        <button onClick={markAllRead} className="btn-secondary flex items-center gap-2 text-sm"><HiOutlineCheck className="w-4 h-4" /> Mark All Read</button>
      </PageHeader>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <HiOutlineBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">No notifications yet</p>
            </div>
          ) : notifications.map((n) => (
            <motion.div key={n._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className={`glass-card p-4 flex items-start gap-4 hover:shadow-lg transition-all ${!n.read ? 'border-l-4 border-l-primary-500' : ''}`}>
              <span className="text-2xl">{typeIcons[n.type] || 'ℹ️'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.read ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{n.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                {!n.read && <button onClick={() => markRead(n._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-green-500"><HiOutlineCheck className="w-4 h-4" /></button>}
                <button onClick={() => deleteNotif(n._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-400 hover:text-red-500"><HiOutlineTrash className="w-4 h-4" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
