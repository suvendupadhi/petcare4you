import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Filter, SlidersHorizontal, Building2 } from 'lucide-react';
import Layout from '../components/Layout';
import { providerService, serviceTypeService, Provider, ServiceType } from '../services/petCare4YouService';

export default function SearchProvidersPage() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<number[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [providersData, typesData] = await Promise.all([
          providerService.getProviders(),
          serviceTypeService.getServiceTypes()
        ]);
        setProviders(providersData);
        setServiceTypes(typesData);
      } catch (error) {
        console.error('Error loading search data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const normalizedCity = searchCity.trim().toLowerCase();
      const data = await providerService.getProviders(
        selectedServiceTypes.length > 0 ? selectedServiceTypes : undefined,
        normalizedCity || undefined
      );
      setProviders(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleServiceType = (id: number) => {
    setSelectedServiceTypes(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  return (
    <Layout userType="owner">
      <div className="space-y-6">
        {/* Search Header */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-bold text-slate-700">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Enter city (e.g. New York)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto px-8 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Search
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <div className="flex items-center gap-2 text-slate-800 font-bold">
              <Filter size={18} />
              Filters
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Service Types</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {serviceTypes.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleServiceType(type.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium text-left border transition-all ${
                      selectedServiceTypes.includes(type.id)
                        ? 'bg-orange-50 border-orange-200 text-orange-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type.name}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { setSelectedServiceTypes([]); setSearchCity(''); handleSearch(); }}
              className="text-sm text-slate-400 font-bold hover:text-slate-600 underline"
            >
              Clear all filters
            </button>
          </aside>

          {/* Results Area */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between text-slate-500 text-sm font-medium">
              {loading ? 'Searching...' : `${providers.length} providers found`}
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} />
                Sort: Recommended
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Loading results...</div>
            ) : providers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {providers.map(provider => (
                  <div 
                    key={provider.id} 
                    onClick={() => navigate(`/provider-detail/${provider.id}`)}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0">
                        {provider.profileImageUrl ? (
                          <img src={provider.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Building2 size={32} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">{provider.companyName}</h3>
                          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold">
                            <Star size={12} fill="currentColor" />
                            {provider.rating.toFixed(1)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                          <MapPin size={14} />
                          <span className="truncate">{provider.address}, {provider.city}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {provider.serviceTypes?.slice(0, 3).map(st => (
                            <span key={st.id} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                              {st.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div className="text-sm font-bold text-orange-600">${provider.hourlyRate}/hr</div>
                      <button className="text-xs font-bold text-slate-500 hover:text-orange-600 flex items-center gap-1 transition-colors">
                        View Profile →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
                <div className="text-slate-400 flex justify-center"><Search size={48} strokeWidth={1} /></div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-lg">No providers found</h3>
                  <p className="text-slate-500">Try adjusting your filters or searching in a different city.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
