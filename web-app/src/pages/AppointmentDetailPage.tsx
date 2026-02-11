import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  PawPrint, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Clock4,
  AlertCircle
} from 'lucide-react';
import Layout from '../components/Layout';
import { appointmentService, Appointment } from '../services/petCareService';

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        const data = await appointmentService.getAppointment(parseInt(id));
        setAppointment(data);
      } catch (error) {
        console.error('Error loading appointment details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleStatusUpdate = async (status: number) => {
    if (!id) return;
    try {
      await appointmentService.updateStatus(parseInt(id), status);
      const data = await appointmentService.getAppointment(parseInt(id));
      setAppointment(data);
      alert('Status updated successfully');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading details...</div>;
  if (!appointment) return <div className="flex items-center justify-center h-screen">Appointment not found</div>;

  return (
    <Layout userType={appointment.ownerId ? 'provider' : 'owner'}>
      <div className="max-w-4xl mx-auto space-y-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-600 transition-colors font-bold"
        >
          <ArrowLeft size={20} />
          Back to list
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-50 pb-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Appointment Details</h1>
                  <p className="text-slate-500 font-medium">Ref ID: #{appointment.id.toString().padStart(6, '0')}</p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <DetailSection icon={<Calendar size={20} />} label="Date" value={new Date(appointment.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
                <DetailSection icon={<Clock size={20} />} label="Time" value={`${appointment.startTime} - ${appointment.endTime}`} />
                <DetailSection icon={<User size={20} />} label={appointment.provider ? "Service Provider" : "Client"} value={appointment.provider ? appointment.provider.companyName : `${appointment.owner?.firstName} ${appointment.owner?.lastName}`} />
                <DetailSection icon={<DollarSign size={20} />} label="Total Price" value={`$${appointment.totalPrice}`} />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Notes from Client</h3>
                <div className="p-4 bg-slate-50 rounded-2xl text-slate-600 italic">
                  "{appointment.description || 'No notes provided.'}"
                </div>
              </div>
            </div>

            {/* Pet Info */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <PawPrint size={24} className="text-orange-600" />
                Pet Information
              </h2>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-2xl border border-orange-100">
                  {appointment.pet?.profileImageUrl ? (
                    <img src={appointment.pet.profileImageUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    appointment.petName[0]
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</div>
                    <div className="text-lg font-bold text-slate-900">{appointment.petName}</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Type</div>
                    <div className="text-lg font-bold text-slate-900">{appointment.petType}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg space-y-6">
              <h3 className="text-lg font-bold text-slate-800">Actions</h3>
              
              {appointment.status === 1 ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => handleStatusUpdate(2)}
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md shadow-green-600/20"
                  >
                    <CheckCircle size={20} />
                    Approve Booking
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(3)}
                    className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-all"
                  >
                    <XCircle size={20} />
                    Decline Request
                  </button>
                </div>
              ) : appointment.status === 2 ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 text-sm font-medium flex items-start gap-3">
                    <CheckCircle size={18} className="mt-0.5" />
                    This booking is confirmed. Prepare for your appointment!
                  </div>
                  <button 
                    onClick={() => handleStatusUpdate(4)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Mark as Completed
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 text-slate-500 rounded-2xl border border-slate-100 text-sm font-medium text-center italic">
                  No actions available for this status.
                </div>
              )}

              <div className="pt-4 border-t border-slate-50 space-y-4">
                <button className="w-full py-2.5 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
                  <MapPin size={18} />
                  Get Directions
                </button>
                <button className="w-full py-2.5 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors flex items-center justify-center gap-2">
                  <AlertCircle size={18} />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DetailSection({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <span className="text-slate-300">{icon}</span>
        {label}
      </div>
      <div className="text-slate-800 font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const configs: Record<number, { label: string, color: string, icon: any }> = {
    1: { label: 'Pending Request', color: 'bg-orange-50 text-orange-600 border-orange-100', icon: <Clock4 size={14} /> },
    2: { label: 'Confirmed', color: 'bg-green-50 text-green-600 border-green-100', icon: <CheckCircle size={14} /> },
    3: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100', icon: <XCircle size={14} /> },
    4: { label: 'Completed', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: <CheckCircle size={14} /> },
  };
  const config = configs[status] || { label: 'Unknown', color: 'bg-slate-50 text-slate-400 border-slate-100', icon: <AlertCircle size={14} /> };
  return (
    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest shadow-sm ${config.color}`}>
      {config.icon}
      {config.label}
    </div>
  );
}
