import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  Settings, 
  LogOut, 
  PawPrint,
  Bell,
  MessageSquare,
  Search,
  CreditCard,
  Lightbulb,
  ShieldCheck,
  X,
  Send,
} from 'lucide-react';
import { authService, notificationService, systemConfigService, feedbackService } from '../services/petCareService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'owner' | 'provider';
  showFeedback?: boolean;
}

export default function Layout({ children, userType: propUserType, showFeedback = false }: LayoutProps) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const userType = propUserType || (user?.roleId === 1 ? 'owner' : 'provider') || 'owner';
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [hideTips, setHideTips] = React.useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = React.useState(showFeedback);
  const [feedbackData, setFeedbackData] = React.useState({
    subject: '',
    message: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);

  React.useEffect(() => {
    setIsFeedbackOpen(showFeedback);
  }, [showFeedback]);

  React.useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const configs = await systemConfigService.getConfigurations();
        const hideTipsConfig = configs.find(c => c.key === 'hide_tips_management');
        if (hideTipsConfig?.value?.toLowerCase() === 'true' && user?.roleId !== 4) {
          setHideTips(true);
        }
      } catch (error) {
        console.error('Error fetching configs:', error);
      }
    };

    fetchConfigs();
    
    const fetchUnreadCount = async () => {
      try {
        const count = await notificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackData.subject.trim() || !feedbackData.message.trim()) {
      showToast('Please fill in both subject and message', 'error');
      return;
    }

    setSubmittingFeedback(true);
    try {
      await feedbackService.submitFeedback(feedbackData);
      showToast('Thank you for your feedback!', 'success');
      setIsFeedbackOpen(false);
      setFeedbackData({ subject: '', message: '' });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const menuItems = userType === 'owner' ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/owner-dashboard' },
    { icon: Search, label: 'Find Providers', path: '/search-providers' },
    { icon: Calendar, label: 'My Bookings', path: '/appointments-owner' },
    { icon: PawPrint, label: 'My Pets', path: '/profile-owner' },
    { icon: CreditCard, label: 'Payments', path: '/payment-invoice' },
  ] : [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/provider-dashboard' },
    { icon: Calendar, label: 'Bookings', path: '/appointments-provider' },
    { icon: User, label: 'Profile', path: '/profile-provider' },
    { icon: CreditCard, label: 'Payments', path: '/payment-invoice' },
  ];

  const commonItems = [
    ...(hideTips ? [] : [{ icon: Lightbulb, label: 'Tips', path: '/tips-management' }]),
    ...(user?.roleId === 4 ? [{ icon: ShieldCheck, label: 'Admin Config', path: '/admin-config' }] : []),
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-orange-600 rounded-lg p-2">
            <PawPrint className="text-white" size={20} />
          </div>
          <span className="text-xl font-bold text-slate-900">PetCare</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Main Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}

          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-8 px-2">System</div>
          {commonItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {location.pathname === '/notifications' ? 'Notifications' : 
             menuItems.find(i => i.path === location.pathname)?.label || 
             commonItems.find(i => i.path === location.pathname)?.label || 
             'PetCare'}
          </h2>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsFeedbackOpen(true)}
              className="text-sm font-bold text-slate-900 hidden md:block hover:text-orange-600 transition-colors"
            >
              Have issue? Send Feedback.
            </button>
            <button 
              onClick={() => navigate('/notifications')}
              className={`p-2 transition-colors relative ${
                location.pathname === '/notifications'
                  ? 'text-orange-600'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50">
              <div className="flex items-center gap-2">
                <MessageSquare className="text-orange-600" size={20} />
                <h3 className="font-bold text-slate-900">Send Feedback</h3>
              </div>
              <button 
                onClick={() => setIsFeedbackOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={feedbackData.subject}
                  onChange={(e) => setFeedbackData({ ...feedbackData, subject: e.target.value })}
                  placeholder="What is this about?"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                  placeholder="Tell us more about the issue or suggestion..."
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all outline-none resize-none"
                />
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingFeedback ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={18} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
