const StatusBadge = ({ status }) => {
  const styles = {
    Active: 'badge-green', Paid: 'badge-green', Completed: 'badge-green', Published: 'badge-green', Present: 'badge-green', Approved: 'badge-green', Converted: 'badge-green',
    Pending: 'badge-yellow', 'In Progress': 'badge-yellow', Draft: 'badge-yellow', Processing: 'badge-yellow', New: 'badge-yellow', HalfDay: 'badge-yellow',
    Inactive: 'badge-gray', Absent: 'badge-red', Rejected: 'badge-red', Expired: 'badge-red', Lost: 'badge-red', Cancelled: 'badge-red', Terminated: 'badge-red', Overdue: 'badge-red',
    'Expiring Soon': 'badge-red', Contacted: 'badge-blue', Qualified: 'badge-blue', Review: 'badge-blue', 'On Leave': 'badge-purple', Leave: 'badge-purple',
    Proposal: 'badge-purple', Negotiation: 'badge-purple', Holiday: 'badge-blue',
  };

  return <span className={styles[status] || 'badge-gray'}>{status}</span>;
};

export default StatusBadge;
