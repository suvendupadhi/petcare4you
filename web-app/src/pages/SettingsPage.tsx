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
  X,
  Eye,
  EyeOff,
  MessageSquare,
  Send
} from 'lucide-react';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';
import { authService, feedbackService } from '../services/petCareService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    subject: '',
    message: ''
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showToast('Password changed successfully', 'success');
      setIsChangePasswordOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setLoading(false);
    }
  };

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
                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all text-left group cursor-pointer"
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

          <button 
            onClick={() => setIsFeedbackOpen(true)}
            className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-all text-left group bg-white rounded-3xl border border-slate-100 shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <MessageSquare size={20} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Have issue? Send Feedback.</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Help us improve your experience</div>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        </div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Change Password</h2>
              <button onClick={() => setIsChangePasswordOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
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
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-70 cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Send Feedback</h2>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={feedbackData.subject}
                  onChange={(e) => setFeedbackData({ ...feedbackData, subject: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What is this about?"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Message</label>
                <textarea
                  required
                  value={feedbackData.message}
                  onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  placeholder="Tell us more details..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="flex-1 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submittingFeedback ? 'Sending...' : (
                    <>
                      <Send size={18} />
                      Send Feedback
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center px-4 mt-2">
                Your feedback helps us improve PetCare. We may contact you if we need more information.
              </p>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
