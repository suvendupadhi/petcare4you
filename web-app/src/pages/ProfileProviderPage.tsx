import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  DollarSign,
  Plus,
  Trash2,
  Camera,
  Star,
  Check
} from 'lucide-react';
import Layout from '../components/Layout';
import { 
  userService, 
  providerService, 
  providerServicePricingService,
  serviceTypeService,
  User, 
  Provider, 
  ProviderService, 
  ServiceType 
} from '../services/petCareService';

export default function ProfileProviderPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit Business state
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    companyName: '',
    description: '',
    hourlyRate: 0,
    address: '',
    city: '',
    serviceTypeIds: [] as number[]
  });

  // Service Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    serviceTypeId: 0,
    price: 0,
    description: ''
  });

  useEffect(() => {
    loadData();
    serviceTypeService.getServiceTypes().then(setServiceTypes).catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [userData, servicesData] = await Promise.all([
        userService.getCurrentUser(),
        providerServicePricingService.getMyServices()
      ]);
      setProfile(userData);
      setServices(servicesData);
      
      if (userData.provider) {
        const p = userData.provider;
        setProvider(p);
        
        // Extract existing service type IDs from providerServices if serviceTypeIds is not populated
        const existingServiceIds = p.serviceTypeIds && p.serviceTypeIds.length > 0 
          ? p.serviceTypeIds 
          : (p.providerServices?.map(ps => ps.serviceTypeId) || []);

        setEditForm({
          companyName: p.companyName,
          description: p.description,
          hourlyRate: p.hourlyRate,
          address: p.address,
          city: p.city,
          serviceTypeIds: existingServiceIds
        });
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBusiness = async () => {
    if (!provider) return;
    try {
      await providerService.updateProvider(provider.id, editForm);
      setEditMode(false);
      loadData();
      alert('Business profile updated successfully');
    } catch (error) {
      alert('Failed to update business profile');
    }
  };

  const handleAddService = async () => {
    try {
      if (editingService?.id) {
        // Send only the necessary fields to the API, avoiding navigation properties
        const updateData = {
          id: editingService.id,
          providerId: editingService.providerId,
          serviceTypeId: serviceForm.serviceTypeId,
          price: serviceForm.price,
          description: serviceForm.description
        };
        await providerServicePricingService.updateService(editingService.id, updateData as ProviderService);
      } else {
        await providerServicePricingService.createService(serviceForm as ProviderService);
      }
      setShowServiceModal(false);
      loadData();
      alert('Service saved successfully!');
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service');
    }
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this service?')) {
      try {
        await providerServicePricingService.deleteService(id);
        loadData();
      } catch (error) {
        alert('Failed to delete service');
      }
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Profile...</div>;

  const sortedServiceTypes = [...serviceTypes].sort((a, b) => {
    const aSelected = services.some(s => s.serviceTypeId === a.id) || editForm.serviceTypeIds.includes(a.id);
    const bSelected = services.some(s => s.serviceTypeId === b.id) || editForm.serviceTypeIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Business Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-orange-600/5" />
          <div className="relative flex flex-col md:flex-row gap-8 items-start">
            <div className="w-40 h-40 bg-slate-100 rounded-3xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 group relative">
              {provider?.profileImageUrl ? (
                <img src={provider.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <Building2 size={64} />
                </div>
              )}
              <button className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                <Camera size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-6 pt-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  {editMode ? (
                    <input 
                      type="text" 
                      value={editForm.companyName}
                      onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })}
                      className="text-3xl font-bold text-slate-900 bg-slate-50 border-b-2 border-orange-600 focus:outline-none px-2"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold text-slate-900">{provider?.companyName}</h1>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded font-bold text-sm">
                      <Star size={14} fill="currentColor" />
                      4.8
                    </div>
                    <div className="text-slate-500 text-sm font-medium flex items-center gap-1">
                      <MapPin size={16} />
                      {provider?.address}, {provider?.city}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => editMode ? handleSaveBusiness() : setEditMode(true)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                    editMode ? 'bg-green-600 text-white shadow-green-600/20' : 'bg-orange-600 text-white shadow-orange-600/20'
                  }`}
                >
                  {editMode ? <><Save size={20} /> Save Business Profile</> : <><Edit size={20} /> Edit Business Profile</>}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                <InfoItem icon={<Mail size={18} />} label="Email" value={profile?.email || ''} />
                <InfoItem icon={<Phone size={18} />} label="Phone" value={profile?.phoneNumber || 'Not provided'} />
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">About Business</label>
                  {editMode ? (
                    <div className="space-y-4">
                      <textarea 
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                      />
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Service Specialties</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {sortedServiceTypes.map(type => (
                            <label key={type.id} className={`flex items-center gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                              editForm.serviceTypeIds.includes(type.id) 
                                ? 'bg-orange-50 border-orange-200 text-orange-700' 
                                : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'
                            }`}>
                              <input 
                                type="checkbox"
                                checked={editForm.serviceTypeIds.includes(type.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setEditForm({ ...editForm, serviceTypeIds: [...editForm.serviceTypeIds, type.id] });
                                  } else {
                                    setEditForm({ ...editForm, serviceTypeIds: editForm.serviceTypeIds.filter(id => id !== type.id) });
                                  }
                                }}
                                className="accent-orange-600"
                              />
                              <span className="text-sm font-bold">{type.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-600 leading-relaxed">{provider?.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <DollarSign size={24} className="text-orange-600" />
                Services & Specific Pricing
              </h2>
              {/* Commented out to suspend add functionality besides availability
              <button 
                onClick={() => { setEditingService(null); setServiceForm({ serviceTypeId: 0, price: 0, description: '' }); setShowServiceModal(true); }}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-800 transition-all"
              >
                <Plus size={18} />
                Add Service
              </button>
              */}
            </div>

            <div className="grid grid-cols-1 gap-4">
              {services.map(service => (
                <div key={service.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 border border-orange-100">
                      <Check size={28} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{service.serviceType?.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-1">{service.description || 'No description provided.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Price</div>
                      <div className="text-xl font-black text-orange-600">${service.price}</div>
                    </div>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => { setEditingService(service); setServiceForm({ serviceTypeId: service.serviceTypeId, price: service.price, description: service.description || '' }); setShowServiceModal(true); }}
                        className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteService(service.id!)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-500">
                  No individual services listed yet. Add one to set specific pricing for your services!
                </div>
              )}
            </div>
          </div>

          {/* Business Summary Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Base Business Settings</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Standard Hourly Rate</label>
                  {editMode ? (
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input 
                        type="number" 
                        value={editForm.hourlyRate}
                        onChange={(e) => setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) })}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="text-2xl font-black text-slate-900">${provider?.hourlyRate}/hr</div>
                  )}
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-50">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Service Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {provider?.serviceTypes?.map(st => (
                      <span key={st.id} className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                        {st.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setShowServiceModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Type</label>
                <select 
                  value={serviceForm.serviceTypeId}
                  onChange={(e) => setServiceForm({ ...serviceForm, serviceTypeId: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value={0}>Select a service</option>
                  {sortedServiceTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Price ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-3.5 text-slate-400" size={18} />
                  <input 
                    type="number" 
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: parseFloat(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Service Description</label>
                <textarea 
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Describe what's included in this service..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 h-24"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowServiceModal(false)}
                className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddService}
                disabled={!serviceForm.serviceTypeId || !serviceForm.price}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 disabled:opacity-50"
              >
                {editingService ? 'Save Changes' : 'Add Service'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-2 text-slate-700 font-semibold">
        <span className="text-slate-400">{icon}</span>
        {value}
      </div>
    </div>
  );
}
