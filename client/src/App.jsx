import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './redux/slices/authSlice';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Leads from './pages/Leads';
import Inquiries from './pages/Inquiries';
import FollowUps from './pages/FollowUps';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Salary from './pages/Salary';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import ProfitLoss from './pages/ProfitLoss';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Tasks from './pages/Tasks';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import Blogs from './pages/Blogs';
import CMS from './pages/CMS';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';

// CMS Services Integration
import Services from './pages/Services';
import ServiceCategories from './pages/ServiceCategories';
import ServiceForm from './pages/ServiceForm';
import WebsiteServices from './pages/WebsiteServices';
import ServiceDetail from './pages/ServiceDetail';
import Gallery from './pages/Gallery';
import Testimonials from './pages/Testimonials';
import SeoSettings from './pages/SeoSettings';
import ProfileSettings from './pages/ProfileSettings';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { darkMode } = useSelector((state) => state.ui);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getMe());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Routes>
      {/* Public Dynamic Website Pages */}
      <Route path="/services" element={<WebsiteServices />} />
      <Route path="/services/:slug" element={<ServiceDetail />} />

      {/* Auth Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Dashboard Routes */}
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="leads" element={<Leads />} />
        <Route path="inquiries" element={<Inquiries />} />
        <Route path="followups" element={<FollowUps />} />
        <Route path="employees" element={<Employees />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="salary" element={<Salary />} />
        <Route path="income" element={<Income />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="profit-loss" element={<ProfitLoss />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="payments" element={<Payments />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="domains" element={<Domains />} />
        <Route path="servers" element={<Servers />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="cms" element={<CMS />} />
        
        {/* Admin Services CMS routes */}
        <Route path="admin/services" element={<Services />} />
        <Route path="admin/service-categories" element={<ServiceCategories />} />
        <Route path="admin/services/new" element={<ServiceForm />} />
        <Route path="admin/services/edit/:id" element={<ServiceForm />} />
        
        {/* Other CMS routes */}
        <Route path="admin/gallery" element={<Gallery />} />
        <Route path="admin/testimonials" element={<Testimonials />} />
        <Route path="admin/seo-settings" element={<SeoSettings />} />

        {/* Profile Settings */}
        <Route path="profile" element={<ProfileSettings />} />

        <Route path="reports" element={<Reports />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
