import React from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Smartphone,
  Globe,
  LogOut
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/petCareService';

export default function SettingsPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { icon: User, label: 'Personal Information', sub: 'Update your name and contact details' },
        { icon: Lock, label: 'Security & Password', sub: 'Manage your password and authentication' },
        { icon: Bell, label: 'Notification Preferences', sub: 'Choose how you want to be notified' },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { icon: Globe, label: 'Language & Region', sub: 'English (US)' },
        { icon: Smartphone, label: 'App Display', sub: 'Theme and layout settings' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', sub: 'FAQs and support guides' },
        { icon: Shield, label: 'Privacy Policy', sub: 'View our data handling policies' },
      ]
    }
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your account and app experience.</p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{section.title}</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {section.items.map((item) => (
                  <button 
                    key={item.label}
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:text-orange-600 rounded-xl transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{item.label}</div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5">{item.sub}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 font-bold flex items-center justify-center gap-2 hover:bg-red-100 transition-all"
          >
            <LogOut size={20} />
            Sign Out of Your Account
          </button>
        </div>
      </div>
    </Layout>
  );
}
