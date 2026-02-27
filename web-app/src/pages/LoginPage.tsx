import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import dogLogo from '../assets/dog_img.jpeg';
import { authService } from '../services/petCare4YouService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'owner' | 'provider'>('owner');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter email and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login({ email, password });
      showToast('Login successful!', 'success');
      
      // Update global auth state
      login(result.token, {
        id: result.userId,
        email: result.email,
        roleId: result.roleId,
        firstName: result.firstName || '',
        lastName: result.lastName || '',
      });

      // Navigation is handled by AuthGuard in App.tsx
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <img src={dogLogo} alt="PetCare4You" className="w-12 h-12 rounded-lg object-cover border border-orange-200" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PetCare4You</h1>
              <p className="text-sm text-slate-500">Connect Web</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Welcome Back!</h2>
          <p className="text-slate-500 mb-6">Sign in to manage your pet care services</p>

          <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setUserType('owner')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                userType === 'owner' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Pet Owner
            </button>
            <button
              onClick={() => setUserType('provider')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                userType === 'provider' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Service Provider
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter your password"
                />
              </div>
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-70 cursor-pointer"
            >
              {loading ? 'Signing In...' : 'Sign In'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">
              New to PetCare4You?{' '}
              <button
                onClick={() => navigate(userType === 'owner' ? '/register-owner' : '/register-provider')}
                className="text-orange-600 font-bold hover:underline cursor-pointer"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
