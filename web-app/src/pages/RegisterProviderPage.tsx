import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, MapPin, Building2, DollarSign, ArrowRight } from 'lucide-react';
import dogLogo from '../assets/dog_img.jpeg';
import { authService, serviceTypeService, ServiceType } from '../services/petCareService';
import CountryCodePicker from '../components/CountryCodePicker';
import { countries, Country } from '../constants/countries';
import { useToast } from '../context/ToastContext';

export default function RegisterProviderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    companyName: '',
    description: '',
    hourlyRate: 0,
    city: '',
    serviceTypeIds: [] as number[],
    roleId: 2, // Provider
  });

  useEffect(() => {
    serviceTypeService.getServiceTypes().then(setServiceTypes).catch(console.error);
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    const phoneDigits = formData.phoneNumber.replace(/[\s()-]/g, '');
    if (!phoneDigits) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{1,14}$/.test(phoneDigits)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 chars, 1 upper, 1 lower, 1 number, 1 special';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Min 8 chars, 1 upper, 1 lower, 1 number, 1 special';
    }
    if (!formData.companyName.trim()) newErrors.companyName = 'Business name is required';
    if (formData.hourlyRate <= 0) newErrors.hourlyRate = 'Hourly rate must be greater than 0';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (formData.serviceTypeIds.length === 0) newErrors.serviceTypeIds = 'Select at least one service';

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
        phoneNumber: fullPhoneNumber,
        companyName: formData.companyName,
        description: formData.description,
        hourlyRate: formData.hourlyRate,
        serviceTypeIds: formData.serviceTypeIds,
        city: formData.city,
        address: formData.address
      });
      showToast('Registration successful! Please login.', 'success');
      navigate('/');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceType = (id: number) => {
    const newIds = formData.serviceTypeIds.includes(id)
      ? formData.serviceTypeIds.filter(v => v !== id)
      : [...formData.serviceTypeIds, id];
    setFormData({ ...formData, serviceTypeIds: newIds });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <img src={dogLogo} alt="PetCare" className="w-12 h-12 rounded-lg object-cover border border-orange-200" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PetCare</h1>
              <p className="text-sm text-slate-500">Service Provider Registration</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">Partner with Us</h2>
          <p className="text-slate-500 mb-8">Grow your pet care business with PetCare Connect</p>

          <form onSubmit={handleRegister} noValidate className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2">Personal Information</h3>
            </div>
            
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
                  placeholder="Jane"
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
                  placeholder="Smith"
                />
              </div>
              {errors.lastName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.email ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="jane@business.com"
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
                  required
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
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b pb-2 mt-4">Business Information</h3>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Business/Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.companyName ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="Happy Paws Daycare"
                />
              </div>
              {errors.companyName && <p className="text-red-500 text-xs mt-1 ml-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Hourly Rate ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="number"
                  required
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.hourlyRate ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="50"
                />
              </div>
              {errors.hourlyRate && <p className="text-red-500 text-xs mt-1 ml-1">{errors.hourlyRate}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.city ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="New York"
                />
              </div>
              {errors.city && <p className="text-red-500 text-xs mt-1 ml-1">{errors.city}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${errors.address ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500`}
                  placeholder="456 Business Ave, Suite 101"
                />
              </div>
              {errors.address && <p className="text-red-500 text-xs mt-1 ml-1">{errors.address}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Services Offered</label>
              <div className="flex flex-wrap gap-2">
                {serviceTypes.map(st => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleServiceType(st.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      formData.serviceTypeIds.includes(st.id)
                        ? 'bg-orange-600 border-orange-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                    } ${errors.serviceTypeIds ? 'border-red-500' : ''}`}
                  >
                    {st.name}
                  </button>
                ))}
              </div>
              {errors.serviceTypeIds && <p className="text-red-500 text-xs mt-1 ml-1">{errors.serviceTypeIds}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                placeholder="Tell us about your services..."
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-70 mt-4"
              >
                {loading ? 'Creating Partner Account...' : 'Join as Partner'}
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
