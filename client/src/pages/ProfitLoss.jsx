import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown, HiBanknotes } from 'react-icons/hi2';
import PageHeader from '../components/ui/PageHeader';
import StatsCard from '../components/ui/StatsCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { reportService } from '../services/dataService';

const ProfitLoss = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => { fetchAnalytics(); }, [year]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const start = new Date(year, 0, 1).toISOString();
      const end = new Date(year, 11, 31).toISOString();
      const res = await reportService.getFinancial({ startDate: start, endDate: end });
      setData(res.data.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Profit & Loss" subtitle="Financial analytics and revenue dashboard">
        <select 
          value={year} 
          onChange={(e) => setYear(Number(e.target.value))} 
          className="input-field py-2"
        >
          {[0, 1, 2, 3, 4].map(y => (
            <option key={y} value={new Date().getFullYear() - y}>
              {new Date().getFullYear() - y}
            </option>
          ))}
        </select>
      </PageHeader>

      {loading || !data ? <LoadingSkeleton type="dashboard" /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Total Income" 
              value={`₹${data.totalIncome.toLocaleString()}`} 
              icon={HiOutlineArrowTrendingUp} 
              color="green" 
            />
            <StatsCard 
              title="Total Expenses" 
              value={`₹${data.totalExpense.toLocaleString()}`} 
              icon={HiOutlineArrowTrendingDown} 
              color="red" 
            />
            <StatsCard 
              title="Net Profit" 
              value={`₹${data.profit.toLocaleString()}`} 
              icon={HiBanknotes} 
              color={data.profit >= 0 ? "indigo" : "red"} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart: Income vs Expense Trend */}
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                    <Legend iconType="circle" />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" name="Income" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart: Monthly Profit */}
            <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Monthly Profit</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }} itemStyle={{ color: '#fff' }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="profit" name="Net Profit" radius={[4, 4, 0, 0]}>
                      {
                        data.chartData.map((entry, index) => (
                          <cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#6366f1' : '#ef4444'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfitLoss;
