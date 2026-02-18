import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  Smartphone,
  Globe,
  LogOut,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/petCareService';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      alert('Password changed successfully');
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Account Settings',
      items: [
        { 
          icon: User, 
          label: 'Personal Information', 
          sub: 'Update your name and contact details',
          action: () => navigate(user?.roleId === 1 ? '/profile-owner' : '/profile-provider')
        },
        { 
          icon: Lock, 
          label: 'Security & Password', 
          sub: 'Manage your password and authentication',
          action: () => setIsChangePasswordOpen(true)
        },
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

        {/* {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{section.title}</h2>
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {section.items.map((item) => (
                <button 
                  key={item.label}
                  onClick={item.action}
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
        ))} */}

        <div className="space-y-8">
          {sections.filter(s => s.title !== 'Preferences' && s.title !== 'Support').map((section) => (
            <div key={section.title} className="space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-4">{section.title}</h2>
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                {section.items.filter(i => i.label !== 'Notification Preferences').map((item) => (
                  <button 
                    key={item.label}
                    onClick={item.action}
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

          <div className="px-4 py-2">
             <p className="text-slate-900 font-bold">Have issue? Send Feedback.</p>
          </div>
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

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
              <button onClick={() => setIsChangePasswordOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
