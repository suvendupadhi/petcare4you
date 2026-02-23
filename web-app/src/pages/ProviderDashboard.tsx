import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  Briefcase
} from 'lucide-react';
import Layout from '../components/Layout';
import { 
  appointmentService, 
  paymentService, 
  tipService,
  systemConfigService,
  Appointment, 
  RevenueSummary,
  Tip
} from '../services/petCareService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  // Decline Modal state
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appData, revData, configs] = await Promise.all([
          appointmentService.getProviderAppointments(),
          paymentService.getRevenueSummary(),
          systemConfigService.getConfigurations()
        ]);
        setAppointments(appData.slice(0, 5));
        setRevenue(revData);

        const hideTipsConfig = configs.find(c => c.key === 'hide_tips_management');
        if (hideTipsConfig?.value?.toLowerCase() !== 'true' || user?.roleId === 4) {
          try {
            const tipData = await tipService.getRandomTip();
            setTip(tipData);
          } catch (e) {
            console.log('No tips available');
          }
        }
      } catch (error) {
        console.error('Error loading provider data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusUpdate = async (id: number, status: number, reason?: string) => {
    if (status === 8 && !reason) {
      setSelectedAppointmentId(id);
      setDeclineReason('');
      setShowDeclineModal(true);
      return;
    }

    try {
      await appointmentService.updateStatus(id, status, reason);
      showToast(`Appointment ${status === 2 ? 'confirmed' : 'updated'}`, 'success');
      // Reload appointments
      const appData = await appointmentService.getProviderAppointments();
      setAppointments(appData.slice(0, 5));
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const confirmDecline = async () => {
    if (!selectedAppointmentId || !declineReason.trim()) return;
    
    try {
      await appointmentService.updateStatus(selectedAppointmentId, 8, declineReason);
      showToast('Appointment declined', 'success');
      setShowDeclineModal(false);
      // Reload appointments
      const appData = await appointmentService.getProviderAppointments();
      setAppointments(appData.slice(0, 5));
    } catch (error) {
      showToast('Failed to decline appointment', 'error');
    }
  };

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
    <Layout userType="provider">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Business Overview 📈</h1>
            <p className="text-slate-500">Track your performance and manage upcoming bookings.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/appointments-provider')}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              All Bookings
            </button>
            <button 
              onClick={() => navigate('/profile-provider')}
              className="px-4 py-2 bg-orange-600 rounded-xl text-sm font-bold text-white hover:bg-orange-700 transition-colors shadow-md cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard 
            icon={<DollarSign size={24} />} 
            label="Total Revenue" 
            value={`$${revenue?.totalRevenue || 0}`} 
            color="bg-green-50 text-green-600"
            subtext={`${revenue?.monthlyRevenue || 0} this month`}
            onClick={() => navigate('/payment-invoice')}
          />
          <StatCard 
            icon={<Calendar size={24} />} 
            label="Total Bookings" 
            value={revenue?.totalAppointments?.toString() || '0'} 
            color="bg-blue-50 text-blue-600"
            subtext={`${revenue?.completedAppointments || 0} completed`}
            onClick={() => navigate('/appointments-provider')}
          />
        </div>

        {/* Quick Actions Row */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionButton 
              icon={<Clock size={18} />} 
              label="Update Availability" 
              onClick={() => navigate('/manage-availability')} 
            />
            <ActionButton 
              icon={<Briefcase size={18} />} 
              label="My Services" 
              onClick={() => navigate('/profile-provider')} 
            />
            {/* <ActionButton 
              icon={<Users size={18} />} 
              label="Client List" 
              onClick={() => {}} 
            /> */}
          </div>
        </div>

        {/* Recent Booking Requests */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Booking Requests</h2>
              <button 
                onClick={() => navigate('/appointments-provider')} 
                disabled={appointments.length === 0}
                className={`text-sm font-bold ${
                  appointments.length === 0 
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-orange-600 hover:underline cursor-pointer'
                }`}
              >
                View Schedule
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Client & Pet</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.length > 0 ? appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                              {app.owner?.firstName[0]}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900">{app.owner?.firstName} {app.owner?.lastName}</div>
                              <div className="text-xs text-slate-500">{app.petName} ({app.petType})</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-700">{new Date(app.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                          <div className="text-xs text-slate-500">{formatTime(app.startTime)} - {formatTime(app.endTime)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {app.status === 1 && (
                              <>
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, 2)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, 8)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title="Decline"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => navigate(`/appointment-detail/${app.id}`)}
                              className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                          No recent booking requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>

        {/* Tips Section */}
        {tip && (
          <div className="bg-orange-600 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden mt-8">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-orange-200" />
                  <h3 className="font-bold text-xl">{tip.title} 🚀</h3>
                </div>
                <p className="text-orange-50 leading-relaxed max-w-2xl">{tip.content}</p>
              </div>
              <button 
                onClick={() => navigate('/profile-provider')}
                className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-all shadow-md active:scale-95 self-start md:self-center cursor-pointer"
              >
                Boost Profile
              </button>
            </div>
            {/* Decorative background element */}
            <div className="absolute -right-8 -bottom-8 bg-orange-500/20 w-64 h-64 rounded-full" />
          </div>
        )}
      </div>

      {showDeclineModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <XCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-900">Decline Appointment</h3>
                <p className="text-slate-500">Please provide a reason for declining this request.</p>
              </div>
            </div>

            <div className="mt-6">
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Enter reason here..."
                className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDecline}
                disabled={!declineReason.trim()}
                className="flex-1 px-6 py-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-orange-600/20 cursor-pointer"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function StatCard({ icon, label, value, color, subtext, onClick }: { icon: any, label: string, value: string, color: string, subtext: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3 ${onClick ? 'cursor-pointer hover:border-orange-200 transition-all' : ''}`}
    >
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
        <div className="text-xs text-slate-500 mt-1">{subtext}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: number }) {
  const configs: Record<number, { label: string, color: string }> = {
    1: { label: 'Pending', color: 'bg-orange-50 text-orange-600 border-orange-100' },
    2: { label: 'Confirmed', color: 'bg-green-50 text-green-600 border-green-100' },
    3: { label: 'Completed', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    4: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
    8: { label: 'Declined', color: 'bg-red-100 text-red-700 border-red-200' },
  };
  const config = configs[status] || { label: 'Unknown', color: 'bg-slate-50 text-slate-400 border-slate-100' };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide ${config.color}`}>
      {config.label}
    </span>
  );
}

function ActionButton({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600 transition-all text-left cursor-pointer"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </button>
  );
}
