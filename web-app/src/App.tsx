import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth, setGlobalLogout } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
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
import SuperAdminConfigPage from './pages/SuperAdminConfigPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (token && user) {
    const target = user.roleId === 1 ? '/owner-dashboard' : '/provider-dashboard';
    return <Navigate to={target} replace />;
  }

  return <>{children}</>;
};

function Root() {
  const { logout } = useAuth();

  useEffect(() => {
    setGlobalLogout(logout);
  }, [logout]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Routes>
        <Route path="/" element={<AuthGuard><LoginPage /></AuthGuard>} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/register-owner" element={<RegisterOwnerPage />} />
        <Route path="/register-provider" element={<RegisterProviderPage />} />
        
        {/* Protected Routes */}
        <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
        <Route path="/provider-dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
        <Route path="/search-providers" element={<ProtectedRoute><SearchProvidersPage /></ProtectedRoute>} />
        <Route path="/provider-detail/:id" element={<ProtectedRoute><ProviderDetailPage /></ProtectedRoute>} />
        <Route path="/appointments-owner" element={<ProtectedRoute><AppointmentsOwnerPage /></ProtectedRoute>} />
        <Route path="/appointments-provider" element={<ProtectedRoute><AppointmentsProviderPage /></ProtectedRoute>} />
        <Route path="/appointment-detail/:id" element={<ProtectedRoute><AppointmentDetailPage /></ProtectedRoute>} />
        <Route path="/profile-owner" element={<ProtectedRoute><ProfileOwnerPage /></ProtectedRoute>} />
        <Route path="/profile-provider" element={<ProtectedRoute><ProfileProviderPage /></ProtectedRoute>} />
        <Route path="/manage-availability" element={<ProtectedRoute><ManageAvailabilityPage /></ProtectedRoute>} />
        <Route path="/payment-invoice" element={<ProtectedRoute><PaymentInvoicePage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/tips-management" element={<ProtectedRoute><TipsManagementPage /></ProtectedRoute>} />
        <Route path="/admin-config" element={<ProtectedRoute><SuperAdminConfigPage /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Root />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
