import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, PawPrint, Star, MapPin, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { 
  petService, 
  providerService, 
  appointmentService, 
  recentProviderService, 
  tipService, 
  systemConfigService,
  Pet, 
  Provider, 
  Appointment, 
  Tip 
} from '../services/petCareService';
import { useAuth } from '../context/AuthContext';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<Provider[]>([]);
  const [recentProviders, setRecentProviders] = useState<Provider[]>([]);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [petsData, appointmentsData, providersData, recentData, configs] = await Promise.all([
          petService.getMyPets(),
          appointmentService.getOwnerAppointments(),
          providerService.getProviders(),
          recentProviderService.getRecentProviders(),
          systemConfigService.getConfigurations()
        ]);
        setPets(petsData);
        setUpcomingAppointments(appointmentsData.filter(a => a.status === 1 || a.status === 2).slice(0, 3));
        setFeaturedProviders(providersData.slice(0, 4));
        setRecentProviders(recentData.length > 0 ? recentData.slice(0, 4) : providersData.slice(0, 4));

        const hideTipsConfig = configs.find(c => c.key === 'hide_tips_management');
        if (hideTipsConfig?.value?.toLowerCase() !== 'true' || user?.roleId === 4) {
          try {
            const tipData = await tipService.getRandomTip();
            setCurrentTip(tipData);
          } catch (e) {
            console.log('No tips available');
          }
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading Dashboard...</div>;

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        const [hours, minutes] = timeString.split(':');
        const dummyDate = new Date();
        dummyDate.setHours(parseInt(hours), parseInt(minutes));
        return dummyDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      }
      return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  return (
    <Layout userType="owner">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello there! 🐾</h1>
          <p className="text-slate-500">Here's what's happening with your pets today.</p>
        </div>

        {/* Quick Stats/Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
              <PawPrint size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{pets.length}</div>
              <div className="text-sm text-slate-500 font-medium">My Pets</div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-xl text-orange-600">
              <Calendar size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</div>
              <div className="text-sm text-slate-500 font-medium">Upcoming Bookings</div>
            </div>
          </div>
          <button 
            onClick={() => navigate('/search-providers')}
            className="bg-orange-600 p-6 rounded-2xl shadow-md flex items-center justify-center gap-3 text-white font-bold hover:bg-orange-700 transition-colors cursor-pointer"
          >
            <Search size={24} />
            Find a Provider
          </button>
        </div>

        {/* Dynamic Tip Section */}
        {currentTip && (
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 flex items-start gap-4">
            <div className="bg-orange-600 p-2 rounded-lg text-white mt-1">
              <PawPrint size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{currentTip.title}</h3>
              <p className="text-slate-600 text-sm mt-1">{currentTip.content}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Bookings</h2>
              <button 
                onClick={() => navigate('/appointments-owner')} 
                disabled={upcomingAppointments.length === 0}
                className={`text-sm font-bold ${
                  upcomingAppointments.length === 0 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-orange-600 hover:underline cursor-pointer'
                }`}
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                <div key={app.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{app.provider?.companyName}</div>
                      <div className="text-sm text-slate-500">{new Date(app.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {formatTime(app.startTime)}</div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    app.status === 2 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {app.status === 2 ? 'Confirmed' : 'Pending'}
                  </div>
                </div>
              )) : (
                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                  No upcoming bookings. Time to book a service!
                </div>
              )}
            </div>

            {/* Recent Providers */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Recent Providers</h2>
                <button onClick={() => navigate('/search-providers')} className="text-sm text-orange-600 font-bold hover:underline cursor-pointer">Explore More</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentProviders.map(provider => (
                  <div 
                    key={provider.id} 
                    onClick={() => navigate(`/provider-detail/${provider.id}`)}
                    className="bg-white p-4 rounded-xl border border-slate-100 hover:border-orange-200 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                        {provider.profileImageUrl ? (
                          <img src={provider.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={32} /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{provider.companyName}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          <span>{provider.city}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold">
                            <Star size={12} fill="currentColor" />
                            {provider.rating.toFixed(1)}
                          </div>
                          <span className="text-sm font-bold text-orange-600">${provider.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Providers */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800">Top Rated Providers</h2>
                <button onClick={() => navigate('/search-providers')} className="text-sm text-orange-600 font-bold hover:underline cursor-pointer">Browse All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featuredProviders.map(provider => (
                  <div 
                    key={provider.id} 
                    onClick={() => navigate(`/provider-detail/${provider.id}`)}
                    className="bg-white p-4 rounded-xl border border-slate-100 hover:border-orange-200 transition-all cursor-pointer shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden">
                        {provider.profileImageUrl ? (
                          <img src={provider.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300"><Building2 size={32} /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{provider.companyName}</h3>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          <span>{provider.city}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold">
                            <Star size={12} fill="currentColor" />
                            {provider.rating.toFixed(1)}
                          </div>
                          <span className="text-sm font-bold text-orange-600">${provider.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Column - My Pets */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">My Pets</h2>
              <button onClick={() => navigate('/profile-owner')} className="bg-orange-50 text-orange-600 p-1.5 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                <PawPrint size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {pets.map(pet => (
                <div key={pet.id} className="bg-white p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    {pet.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{pet.name}</div>
                    <div className="text-xs text-slate-500">{pet.petType?.name} • {pet.breed?.name}</div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/profile-owner')}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-bold hover:border-orange-300 hover:text-orange-500 transition-all cursor-pointer"
              >
                + Add New Pet
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const Building2 = ({ size, className }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);
