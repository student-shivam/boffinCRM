import GenericCRUD from '../components/GenericCRUD';
import { serverService } from '../services/dataService';

const fields = [
  { key: 'name', label: 'Server Name', type: 'text', required: true, showInTable: true },
  { key: 'hostingProvider', label: 'Provider', type: 'text', showInTable: true, hideOnMobile: true },
  { key: 'serverIP', label: 'Server IP', type: 'text', showInTable: true, hideOnMobile: true },
  { key: 'type', label: 'Type', type: 'select', options: ['Shared', 'VPS', 'Dedicated', 'Cloud', 'Other'], default: 'Shared', showInTable: false },
  { key: 'plan', label: 'Plan', type: 'text', showInTable: false },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', showInTable: true },
  { key: 'renewalCost', label: 'Renewal Cost (₹)', type: 'currency', showInTable: false },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive', 'Maintenance', 'Expired'], default: 'Active', showInTable: true },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, showInTable: false },
];

const Servers = () => <GenericCRUD title="Servers" subtitle="Manage hosting and server infrastructure" service={serverService} fields={fields} />;
export default Servers;
