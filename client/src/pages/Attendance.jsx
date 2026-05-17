import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { attendanceService } from '../services/dataService';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { fetchAttendance(); }, [date]);

  const fetchAttendance = async () => {
    try { setLoading(true); const { data } = await attendanceService.getDaily(date); setRecords(data.data); } catch { setRecords([]); } finally { setLoading(false); }
  };

  const markStatus = async (employeeId, status) => {
    try {
      await attendanceService.mark({ employeeId, date, status });
      toast.success(`Marked ${status}`);
      fetchAttendance();
    } catch { toast.error('Error marking attendance'); }
  };

  const statusColors = { Present: 'bg-emerald-500', Absent: 'bg-red-500', HalfDay: 'bg-amber-500', Leave: 'bg-purple-500', 'Not Marked': 'bg-gray-400' };

  return (
    <div>
      <PageHeader title="Attendance" subtitle="Mark and track daily attendance">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field w-44" />
      </PageHeader>

      {loading ? <LoadingSkeleton type="table" count={5} /> : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 dark:border-dark-border">
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Department</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {records.length === 0 ? <tr><td colSpan="4" className="text-center py-12 text-gray-400">No employees found. Add employees first.</td></tr> : records.map((r) => (
                  <tr key={r.employee._id} className="border-b border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                    <td className="py-4 px-6"><p className="font-medium text-gray-900 dark:text-white text-sm">{r.employee.name}</p><p className="text-xs text-gray-400">{r.employee.designation}</p></td>
                    <td className="py-4 px-6 hidden md:table-cell"><span className="badge-blue">{r.employee.department}</span></td>
                    <td className="py-4 px-6"><div className="flex items-center gap-2"><div className={`w-2.5 h-2.5 rounded-full ${statusColors[r.status]}`} /><span className="text-sm text-gray-700 dark:text-gray-300">{r.status}</span></div></td>
                    <td className="py-4 px-6"><div className="flex gap-1">
                      {['Present', 'Absent', 'HalfDay', 'Leave'].map(s => (
                        <button key={s} onClick={() => markStatus(r.employee._id, s)} className={`px-3 py-1 text-xs rounded-lg transition-all ${r.status === s ? `${statusColors[s]} text-white` : 'bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-border'}`}>
                          {s === 'HalfDay' ? '½' : s[0]}
                        </button>
                      ))}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Attendance;
