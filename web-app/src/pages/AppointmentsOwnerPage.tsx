import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Building2, ChevronRight, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import { appointmentService, Appointment } from '../services/petCareService';

export default function AppointmentsOwnerPage() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getOwnerAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = filterStatus === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filterStatus);

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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-500 text-sm">Manage your past and upcoming service requests.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterStatus === 'all' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus(1)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterStatus === 1 ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilterStatus(2)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${filterStatus === 2 ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Active
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">Loading bookings...</div>
        ) : filteredAppointments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredAppointments.map((app) => (
              <div 
                key={app.id} 
                onClick={() => navigate(`/appointment-detail/${app.id}`)}
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
                  <Calendar size={32} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {app.provider?.companyName}
                    </h3>
                    <StatusBadge status={app.status} />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Calendar size={16} />
                      <span className="font-medium">{new Date(app.appointmentDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={16} />
                      <span className="font-medium">{formatTime(app.startTime)} - {formatTime(app.endTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Building2 size={16} />
                      <span className="font-medium truncate">{app.petName} ({app.petType})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-6 md:border-l border-slate-100">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Price</div>
                    <div className="text-lg font-bold text-slate-900">${app.totalPrice}</div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300 group-hover:text-orange-600 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
            <div className="text-slate-400 flex justify-center"><Calendar size={64} strokeWidth={1} /></div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-xl">No bookings found</h3>
              <p className="text-slate-500">You haven't made any bookings matching this criteria.</p>
            </div>
            <button 
              onClick={() => navigate('/search-providers')}
              className="mt-4 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors"
            >
              Find a Provider
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatusBadge({ status }: { status: number }) {
  const configs: Record<number, { label: string, color: string }> = {
    1: { label: 'Pending', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    2: { label: 'Confirmed', color: 'bg-green-50 text-green-600 border-green-100' },
    3: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
    4: { label: 'Completed', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  };
  const config = configs[status] || { label: 'Unknown', color: 'bg-slate-50 text-slate-400 border-slate-100' };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest ${config.color}`}>
      {config.label}
    </span>
  );
}
