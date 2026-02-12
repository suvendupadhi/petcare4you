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
  Appointment, 
  RevenueSummary,
  Tip
} from '../services/petCareService';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appData, revData, tipData] = await Promise.all([
          appointmentService.getProviderAppointments(),
          paymentService.getRevenueSummary(),
          tipService.getRandomTip()
        ]);
        setAppointments(appData.slice(0, 5));
        setRevenue(revData);
        setTip(tipData);
      } catch (error) {
        console.error('Error loading provider data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStatusUpdate = async (id: number, status: number) => {
    try {
      await appointmentService.updateStatus(id, status);
      // Reload appointments
      const appData = await appointmentService.getProviderAppointments();
      setAppointments(appData.slice(0, 5));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading Dashboard...</div>;

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
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              All Bookings
            </button>
            <button 
              onClick={() => navigate('/profile-provider')}
              className="px-4 py-2 bg-orange-600 rounded-xl text-sm font-bold text-white hover:bg-orange-700 transition-colors shadow-md"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<DollarSign size={24} />} 
            label="Total Revenue" 
            value={`$${revenue?.totalRevenue || 0}`} 
            color="bg-green-50 text-green-600"
            subtext={`${revenue?.monthlyRevenue || 0} this month`}
          />
          <StatCard 
            icon={<Calendar size={24} />} 
            label="Total Bookings" 
            value={revenue?.totalAppointments?.toString() || '0'} 
            color="bg-blue-50 text-blue-600"
            subtext={`${revenue?.completedAppointments || 0} completed`}
          />
          <StatCard 
            icon={<TrendingUp size={24} />} 
            label="Growth Rate" 
            value={`${revenue?.growthRate || 0}%`} 
            color="bg-purple-50 text-purple-600"
            subtext="Compared to last month"
          />
          <StatCard 
            icon={<Clock size={24} />} 
            label="Avg. Revenue" 
            value={`$${revenue?.averageRevenuePerAppointment?.toFixed(0) || 0}`} 
            color="bg-orange-50 text-orange-600"
            subtext="Per appointment"
          />
        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Recent Booking Requests</h2>
              <button onClick={() => navigate('/appointments-provider')} className="text-sm text-orange-600 font-bold hover:underline">View Schedule</button>
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
                          <div className="text-sm font-medium text-slate-700">{new Date(app.appointmentDate).toLocaleDateString()}</div>
                          <div className="text-xs text-slate-500">{app.startTime} - {app.endTime}</div>
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
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Approve"
                                >
                                  <CheckCircle size={18} />
                                </button>
                                <button 
                                  onClick={() => handleStatusUpdate(app.id, 3)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Decline"
                                >
                                  <XCircle size={18} />
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => navigate(`/appointment-detail/${app.id}`)}
                              className="px-3 py-1 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
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

          {/* Side Column - Quick Actions & Tips */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
              <div className="grid grid-cols-1 gap-3">
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
                <ActionButton 
                  icon={<Users size={18} />} 
                  label="Client List" 
                  onClick={() => {}} 
                />
              </div>
            </div>

            {tip && (
              <div className="bg-orange-600 p-6 rounded-2xl shadow-lg text-white">
                <h3 className="font-bold mb-2">{tip.title} 🚀</h3>
                <p className="text-sm text-orange-100 mb-4">{tip.content}</p>
                <button 
                  onClick={() => navigate('/profile-provider')}
                  className="w-full py-2 bg-white text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-50 transition-colors"
                >
                  Boost Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ icon, label, value, color, subtext }: { icon: any, label: string, value: string, color: string, subtext: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-3">
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
    3: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-100' },
    4: { label: 'Completed', color: 'bg-blue-50 text-blue-600 border-blue-100' },
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
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-100 hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-600 transition-all text-left"
    >
      <span className="text-slate-400">{icon}</span>
      {label}
    </button>
  );
}
