import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineDocumentArrowDown } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { reportService } from '../services/dataService';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { fetchReport(); }, []);

  const fetchReport = async () => {
    try { setLoading(true); const { data } = await reportService.getFinancial({ startDate, endDate }); setReport(data.data); } catch { setReport({ income: [], expenses: [], totalIncome: 0, totalExpense: 0, profit: 0 }); } finally { setLoading(false); }
  };

  const handleExport = async (type) => {
    try {
      const res = await reportService.exportExcel(type);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${type}-report.xlsx`; a.click();
      toast.success(`${type} exported`);
    } catch { toast.error('Export failed'); }
  };

  if (loading) return <LoadingSkeleton type="card" count={4} />;

  return (
    <div>
      <PageHeader title="Reports" subtitle="Financial reports and analytics">
        <div className="flex gap-2 flex-wrap">
          {['clients', 'leads', 'employees', 'income', 'expenses'].map(t => (
            <button key={t} onClick={() => handleExport(t)} className="btn-secondary text-xs flex items-center gap-1 capitalize">
              <HiOutlineDocumentArrowDown className="w-3 h-3" /> {t}
            </button>
          ))}
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-6"><p className="text-sm text-gray-400">Total Income</p><p className="text-2xl font-bold text-emerald-500">₹{(report?.totalIncome || 0).toLocaleString()}</p></div>
        <div className="glass-card p-6"><p className="text-sm text-gray-400">Total Expenses</p><p className="text-2xl font-bold text-red-500">₹{(report?.totalExpense || 0).toLocaleString()}</p></div>
        <div className="glass-card p-6"><p className="text-sm text-gray-400">Profit</p><p className={`text-2xl font-bold ${(report?.profit || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>₹{(report?.profit || 0).toLocaleString()}</p></div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={report?.income?.map(i => ({ name: i._id, value: i.total })) || []} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={5}>
                {(report?.income || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} formatter={(v) => `₹${v.toLocaleString()}`} />
              <Legend formatter={(v) => <span className="text-gray-400 text-xs">{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report?.expenses?.map(e => ({ name: e._id, amount: e.total })) || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f8fafc' }} formatter={(v) => `₹${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;
