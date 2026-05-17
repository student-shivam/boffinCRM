import api from './api';

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getActivities: () => api.get('/dashboard/activities'),
};

export const clientService = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  addNote: (id, text) => api.post(`/clients/${id}/notes`, { text }),
  addPayment: (id, data) => api.post(`/clients/${id}/payments`, data),
};

export const leadService = {
  getAll: (params) => api.get('/leads', { params }),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  convert: (id) => api.post(`/leads/${id}/convert`),
};

export const inquiryService = {
  getAll: (params) => api.get('/inquiries', { params }),
  create: (data) => api.post('/inquiries', data),
  update: (id, data) => api.put(`/inquiries/${id}`, data),
  delete: (id) => api.delete(`/inquiries/${id}`),
  convert: (id) => api.post(`/inquiries/${id}/convert`),
};

export const followUpService = {
  getAll: (params) => api.get('/followups', { params }),
  create: (data) => api.post('/followups', data),
  update: (id, data) => api.put(`/followups/${id}`, data),
  delete: (id) => api.delete(`/followups/${id}`),
};

export const employeeService = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const attendanceService = {
  getDaily: (date) => api.get('/attendance/daily', { params: { date } }),
  getMonthly: (params) => api.get('/attendance/monthly', { params }),
  mark: (data) => api.post('/attendance/mark', data),
  markBulk: (data) => api.post('/attendance/bulk', data),
};

export const leaveService = {
  getAll: (params) => api.get('/leaves', { params }),
  create: (data) => api.post('/leaves', data),
  updateStatus: (id, data) => api.put(`/leaves/${id}`, data),
  delete: (id) => api.delete(`/leaves/${id}`),
};

export const salaryService = {
  getAll: (params) => api.get('/salary', { params }),
  generate: (data) => api.post('/salary/generate', data),
  update: (id, data) => api.put(`/salary/${id}`, data),
  downloadSlip: (id) => api.get(`/salary/${id}/slip`, { responseType: 'blob' }),
};

export const payrollService = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  generate: (data) => api.post('/payroll/generate', data),
  update: (id, data) => api.put(`/payroll/${id}`, data),
  sendEmail: (id) => api.post('/payroll/send-email', { id }),
  downloadSlip: (id) => api.get(`/payroll/${id}/slip`, { responseType: 'blob' }),
};

export const incomeService = {
  getAll: (params) => api.get('/income', { params }),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
};

export const expenseService = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const invoiceService = {
  getAll: (params) => api.get('/invoices', { params }),
  create: (data) => api.post('/invoices', data),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  delete: (id) => api.delete(`/invoices/${id}`),
  downloadPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
};

export const paymentService = {
  getAll: (params) => api.get('/payments', { params }),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const domainService = {
  getAll: (params) => api.get('/domains', { params }),
  create: (data) => api.post('/domains', data),
  update: (id, data) => api.put(`/domains/${id}`, data),
  delete: (id) => api.delete(`/domains/${id}`),
};

export const serverService = {
  getAll: (params) => api.get('/servers', { params }),
  create: (data) => api.post('/servers', data),
  update: (id, data) => api.put(`/servers/${id}`, data),
  delete: (id) => api.delete(`/servers/${id}`),
};

export const blogService = {
  getAll: (params) => api.get('/blogs', { params }),
  getById: (id) => api.get(`/blogs/${id}`),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  delete: (id) => api.delete(`/blogs/${id}`),
};

export const taskService = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  addComment: (id, text) => api.post(`/tasks/${id}/comments`, { text }),
};

export const cmsService = {
  getAll: () => api.get('/cms'),
  getPage: (name) => api.get(`/cms/${name}`),
  createPage: (data) => api.post('/cms', data),
  updatePage: (name, data) => api.put(`/cms/${name}`, data),
  deletePage: (name) => api.delete(`/cms/${name}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const reportService = {
  getFinancial: (params) => api.get('/reports/financial', { params }),
  exportExcel: (type) => api.get(`/reports/export/${type}`, { responseType: 'blob' }),
};

export const serviceManagementService = {
  getAll: (params) => api.get('/services', { params }),
  getBySlug: (slug) => api.get(`/services/slug/${slug}`),
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getAnalytics: () => api.get('/services/analytics'),
};

export const serviceCategoryService = {
  getAll: () => api.get('/service-categories'),
  create: (data) => api.post('/service-categories', data),
  update: (id, data) => api.put(`/service-categories/${id}`, data),
  delete: (id) => api.delete(`/service-categories/${id}`),
};

export const uploadService = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadBase64: (base64) => api.post('/upload', { base64 }),
};

export const adminProfileService = {
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data) => api.put('/admin/profile', data),
  changePassword: (data) => api.put('/admin/change-password', data),
};

export const companyService = {
  getDetails: () => api.get('/company'),
  updateDetails: (data) => api.put('/company', data),
};
