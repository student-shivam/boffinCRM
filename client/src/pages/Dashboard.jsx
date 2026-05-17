import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineUsers, HiOutlineCurrencyDollar, HiOutlineUserGroup, HiOutlineClipboardDocumentList, HiOutlineGlobeAlt, HiOutlineServer, HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from 'react-icons/hi2';
import { HiBanknotes } from 'react-icons/hi2';
import StatsCard from '../components/ui/StatsCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { dashboardService } from '../services/dataService';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#06b6d4', '#ef4444'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [statsRes, actRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivities(),
      ]);
      setStats(statsRes.data.data.stats);
      setCharts(statsRes.data.data.charts);
      setActivities(actRes.data.data);
    } catch (err) {
      // Use placeholder data when backend is not connected
      setStats({
        totalClients: 24, activeClients: 18, totalLeads: 47, newLeads: 12,
        totalEmployees: 15, totalIncome: 850000, monthlyIncome: 120000,
        totalExpenses: 420000, monthlyExpenses: 65000, totalProfit: 430000,
        monthlyProfit: 55000, pendingSalaries: 3, pendingTasks: 8,
        expiringDomains: 2, expiringServers: 1, unreadNotifications: 5,
      });
      setCharts({
        revenueData: [
          { _id: { month: 1 }, total: 95000 }, { _id: { month: 2 }, total: 110000 },
          { _id: { month: 3 }, total: 85000 }, { _id: { month: 4 }, total: 130000 },
          { _id: { month: 5 }, total: 120000 }, { _id: { month: 6 }, total: 150000 },
        ],
        expenseData: [
          { _id: { month: 1 }, total: 55000 }, { _id: { month: 2 }, total: 62000 },
          { _id: { month: 3 }, total: 48000 }, { _id: { month: 4 }, total: 70000 },
          { _id: { month: 5 }, total: 65000 }, { _id: { month: 6 }, total: 58000 },
        ],
        leadSources: [
          { _id: 'Website', count: 15 }, { _id: 'LinkedIn', count: 10 },
          { _id: 'Facebook', count: 8 }, { _id: 'WhatsApp', count: 7 },
          { _id: 'Referral', count: 5 }, { _id: 'Instagram', count: 2 },
        ],
        taskStatus: [
          { _id: 'Completed', count: 12 }, { _id: 'In Progress', count: 8 },
          { _id: 'Pending', count: 5 }, { _id: 'Review', count: 3 },
        ],
      });
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const revenueChartData = charts?.revenueData?.map((r, i) => ({
    month: MONTHS[(r._id.month || i + 1) - 1],
    income: r.total,
    expense: charts?.expenseData?.[i]?.total || 0,
  })) || [];

  const leadSourceData = charts?.leadSources?.map(l => ({ name: l._id, value: l.count })) || [];
  const taskStatusData = charts?.taskStatus?.map(t => ({ name: t._id, value: t.count })) || [];

  if (loading) return <LoadingSkeleton type="card" count={8} />;

  const formatCurrency = (val) => `₹${(val / 1000).toFixed(0)}K`;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's your business overview.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard title="Total Income" value={`₹${(stats.totalIncome / 1000).toFixed(0)}K`} icon={HiOutlineArrowTrendingUp} color="green" delay={0} />
        <StatsCard title="Total Expenses" value={`₹${(stats.totalExpenses / 1000).toFixed(0)}K`} icon={HiOutlineArrowTrendingDown} color="red" delay={0.05} />
        <StatsCard title="Total Profit" value={`₹${(stats.totalProfit / 1000).toFixed(0)}K`} icon={HiBanknotes} color="indigo" delay={0.1} />
        <StatsCard title="Monthly Income" value={`₹${(stats.monthlyIncome / 1000).toFixed(0)}K`} icon={HiOutlineCurrencyDollar} color="cyan" delay={0.15} />
        <StatsCard title="Total Clients" value={stats.totalClients} icon={HiOutlineUsers} color="blue" delay={0.2} />
        <StatsCard title="Total Leads" value={stats.totalLeads} icon={HiOutlineUserGroup} color="purple" delay={0.25} />
        <StatsCard title="Employees" value={stats.totalEmployees} icon={HiOutlineUserGroup} color="orange" delay={0.3} />
        <StatsCard title="Pending Tasks" value={stats.pendingTasks} icon={HiOutlineClipboardDocumentList} color="pink" delay={0.35} />
      </div>

      {/* Alert Cards */}
      {(stats.expiringDomains > 0 || stats.expiringServers > 0 || stats.pendingSalaries > 0) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.expiringDomains > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
              <HiOutlineGlobeAlt className="w-8 h-8 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-500">{stats.expiringDomains} Domain(s) Expiring</p>
                <p className="text-xs text-amber-500/70">Within 30 days</p>
              </div>
            </div>
          )}
          {stats.expiringServers > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
              <HiOutlineServer className="w-8 h-8 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-500">{stats.expiringServers} Server(s) Expiring</p>
                <p className="text-xs text-red-500/70">Within 30 days</p>
              </div>
            </div>
          )}
          {stats.pendingSalaries > 0 && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-center gap-3">
              <HiBanknotes className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-500">{stats.pendingSalaries} Salary Pending</p>
                <p className="text-xs text-blue-500/70">This month</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expense Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueChartData}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={formatCurrency} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} formatter={(v) => `₹${v.toLocaleString()}`} />
              <Legend />
              <Area type="monotone" dataKey="income" stroke="#6366f1" fill="url(#colorIncome)" strokeWidth={2} name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Lead Sources */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Lead Sources</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={leadSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                {leadSourceData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} />
              <Legend formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={taskStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activities */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {activities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No recent activities</p>
                <p className="text-gray-500 text-xs mt-1">Activities will appear here as you use the system</p>
              </div>
            ) : (
              activities.map((a) => (
                <div key={a._id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.action === 'CREATE' ? 'bg-emerald-500' : a.action === 'DELETE' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{a.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
