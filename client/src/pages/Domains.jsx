import GenericCRUD from '../components/GenericCRUD';
import { domainService } from '../services/dataService';

const fields = [
  { key: 'domainName', label: 'Domain Name', type: 'text', required: true, showInTable: true },
  { key: 'provider', label: 'Provider', type: 'text', showInTable: true, hideOnMobile: true },
  { key: 'expiryDate', label: 'Expiry Date', type: 'date', required: true, showInTable: true },
  { key: 'sslExpiry', label: 'SSL Expiry', type: 'date', showInTable: false },
  { key: 'renewalCost', label: 'Renewal Cost (₹)', type: 'currency', showInTable: true, hideOnMobile: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Expired', 'Expiring Soon', 'Transferred'], default: 'Active', showInTable: true },
  { key: 'notes', label: 'Notes', type: 'textarea', fullWidth: true, showInTable: false },
];

const Domains = () => <GenericCRUD title="Domains" subtitle="Manage domain names and expiry dates" service={domainService} fields={fields} />;
export default Domains;
