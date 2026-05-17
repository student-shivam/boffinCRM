import GenericCRUD from '../components/GenericCRUD';
import { blogService } from '../services/dataService';

const fields = [
  { key: 'title', label: 'Title', type: 'text', required: true, showInTable: true },
  { key: 'category', label: 'Category', type: 'text', showInTable: true, hideOnMobile: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Draft', 'Published', 'Archived'], default: 'Draft', showInTable: true },
  { key: 'author', label: 'Author', type: 'text', default: 'Admin', showInTable: false },
  { key: 'excerpt', label: 'Excerpt', type: 'textarea', fullWidth: true, showInTable: false },
  { key: 'content', label: 'Content', type: 'textarea', fullWidth: true, required: true, showInTable: false },
  { key: 'metaTitle', label: 'Meta Title', type: 'text', showInTable: false },
  { key: 'metaDescription', label: 'Meta Description', type: 'textarea', fullWidth: true, showInTable: false },
];

const Blogs = () => <GenericCRUD title="Blogs" subtitle="Manage blog posts and content" service={blogService} fields={fields} />;
export default Blogs;
