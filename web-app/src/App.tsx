import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterOwnerPage from './pages/RegisterOwnerPage';
import RegisterProviderPage from './pages/RegisterProviderPage';
import OwnerDashboard from './pages/OwnerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import SearchProvidersPage from './pages/SearchProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import AppointmentsOwnerPage from './pages/AppointmentsOwnerPage';
import AppointmentsProviderPage from './pages/AppointmentsProviderPage';
import ProfileOwnerPage from './pages/ProfileOwnerPage';
import ProfileProviderPage from './pages/ProfileProviderPage';
import ManageAvailabilityPage from './pages/ManageAvailabilityPage';
import PaymentInvoicePage from './pages/PaymentInvoicePage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import TipsManagementPage from './pages/TipsManagementPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register-owner" element={<RegisterOwnerPage />} />
          <Route path="/register-provider" element={<RegisterProviderPage />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          <Route path="/provider-dashboard" element={<ProviderDashboard />} />
          <Route path="/search-providers" element={<SearchProvidersPage />} />
          <Route path="/provider-detail/:id" element={<ProviderDetailPage />} />
          <Route path="/appointments-owner" element={<AppointmentsOwnerPage />} />
          <Route path="/appointments-provider" element={<AppointmentsProviderPage />} />
          <Route path="/appointment-detail/:id" element={<AppointmentDetailPage />} />
          <Route path="/profile-owner" element={<ProfileOwnerPage />} />
          <Route path="/profile-provider" element={<ProfileProviderPage />} />
          <Route path="/manage-availability" element={<ManageAvailabilityPage />} />
          <Route path="/payment-invoice" element={<PaymentInvoicePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/tips-management" element={<TipsManagementPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
