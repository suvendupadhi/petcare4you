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
  CreditCard
} from 'lucide-react';
import { authService } from '../services/petCareService';

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'owner' | 'provider';
}

export default function Layout({ children, userType: propUserType }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = propUserType || (localStorage.getItem('user_type') as 'owner' | 'provider') || 'owner';

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const menuItems = userType === 'owner' ? [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/owner-dashboard' },
    { icon: Search, label: 'Find Providers', path: '/search-providers' },
    { icon: Calendar, label: 'My Bookings', path: '/appointments-owner' },
    { icon: PawPrint, label: 'My Pets', path: '/profile-owner' },
  ] : [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/provider-dashboard' },
    { icon: Calendar, label: 'Bookings', path: '/appointments-provider' },
    { icon: User, label: 'Profile', path: '/profile-provider' },
    { icon: CreditCard, label: 'Payments', path: '/payment-invoice' },
  ];

  const commonItems = [
    { icon: Bell, label: 'Notifications', path: '/notifications' },
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
            {menuItems.find(i => i.path === location.pathname)?.label || 
             commonItems.find(i => i.path === location.pathname)?.label || 
             'PetCare'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
            </button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300" />
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
