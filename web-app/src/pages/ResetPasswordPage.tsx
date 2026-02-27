import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PawPrint, Lock, Key, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/petCare4YouService';
import { useToast } from '../context/ToastContext';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !newPassword || !confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ email, token, newPassword });
      setSuccess(true);
      showToast('Password reset successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Password reset failed. Please check your token.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Password Reset!</h2>
          <p className="text-slate-500 mb-8">
            Your password has been successfully reset. You can now log in with your new password.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold hover:bg-orange-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <button 
            onClick={() => navigate('/forgot-password')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back</span>
          </button>

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-600 rounded-full p-3">
              <PawPrint className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PetCare</h1>
              <p className="text-sm text-slate-500">Connect Web</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Reset Password</h2>
          <p className="text-slate-500 mb-8">Create a new secure password for your account.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Confirm your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Reset Token</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter token from email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-70 mt-6"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
