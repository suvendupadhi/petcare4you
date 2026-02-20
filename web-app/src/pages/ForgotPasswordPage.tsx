import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PawPrint, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { authService } from '../services/petCareService';
import { useToast } from '../context/ToastContext';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 rounded-full p-4">
              <Mail className="text-green-600" size={32} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Check your email</h2>
          <p className="text-slate-500 mb-8">
            We've sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. 
            Please follow the instructions in the email to reset your password.
          </p>
          <button
            onClick={() => navigate('/reset-password', { state: { email } })}
            className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold hover:bg-orange-700 transition-colors mb-4"
          >
            I have a token / Next Step
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-slate-100 text-slate-700 rounded-xl py-4 font-bold hover:bg-slate-200 transition-colors"
          >
            Back to Login
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
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Login</span>
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

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Forgot Password?</h2>
          <p className="text-slate-500 mb-8">Enter your email address and we'll send you a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-70"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
