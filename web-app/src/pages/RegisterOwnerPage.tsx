import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, User, Mail, Lock, MapPin, ArrowRight } from 'lucide-react';
import { authService } from '../services/petCareService';
import CountryCodePicker from '../components/CountryCodePicker';
import { countries, Country } from '../constants/countries';

export default function RegisterOwnerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]); // Default to US
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    roleId: 1, // Owner
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be 8+ chars, with uppercase, lowercase, number and special char';
    }

    const phoneDigits = formData.phoneNumber.replace(/[\s()-]/g, '');
    if (!phoneDigits) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{1,14}$/.test(phoneDigits)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.dialCode}${formData.phoneNumber.replace(/[\s()-]/g, '')}`;
      await authService.register({
        ...formData,
        phoneNumber: fullPhoneNumber
      });
      alert('Registration successful! Please login.');
      navigate('/');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-orange-600 rounded-full p-3">
              <PawPrint className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PetCare</h1>
              <p className="text-sm text-slate-500">Owner Registration</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8">Join our community of pet lovers</p>

          <form onSubmit={handleRegister} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.firstName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="John"
                />
              </div>
              {errors.firstName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.lastName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Doe"
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
              <div className="flex">
                <CountryCodePicker 
                  selectedCountry={selectedCountry} 
                  onSelect={setSelectedCountry} 
                  error={!!errors.phoneNumber}
                />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className={`w-full px-4 py-3 bg-slate-50 border ${errors.phoneNumber ? 'border-red-500' : 'border-slate-200'} rounded-r-xl focus:outline-none focus:ring-2 focus:ring-orange-500 border-l-0`}
                  placeholder="123 456 7890"
                />
              </div>
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1 ml-1">{errors.phoneNumber}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.password ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-red-500 text-[10px] mt-1 ml-1 leading-tight">{errors.password}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="123 Street Name, City"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-70 mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                {!loading && <ArrowRight size={20} />}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-600">Already have an account? <Link to="/" className="text-orange-600 font-bold hover:underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
