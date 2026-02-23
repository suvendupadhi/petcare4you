import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { appointmentService, Appointment } from '../services/petCareService';
import { useToast } from '../context/ToastContext';

export default function AppointmentsProviderPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await appointmentService.getProviderAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: number, reason?: string) => {
    try {
      await appointmentService.updateStatus(id, status, reason);
      showToast(`Appointment ${status === 2 ? 'confirmed' : status === 8 ? 'declined' : 'updated'}`, 'success');
      loadAppointments();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const openDeclineModal = (id: number) => {
    setSelectedAppointmentId(id);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const confirmDecline = async () => {
    if (!selectedAppointmentId || !declineReason.trim()) return;
    await handleStatusUpdate(selectedAppointmentId, 8, declineReason);
    setShowDeclineModal(false);
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
    <Layout userType="provider">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>
            <p className="text-slate-500 text-sm">Review and update your service appointments.</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${filterStatus === 'all' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterStatus(1)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${filterStatus === 1 ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Requests
            </button>
            <button 
              onClick={() => setFilterStatus(2)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${filterStatus === 2 ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Confirmed
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400">Loading schedule...</div>
        ) : filteredAppointments.length > 0 ? (
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
                  {filteredAppointments.map((app) => (
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
                        <div className="text-sm font-medium text-slate-700">{new Date(app.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
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
                                onClick={() => openDeclineModal(app.id)}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-200 text-center space-y-4">
            <div className="text-slate-300 flex justify-center"><Calendar size={64} strokeWidth={1} /></div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-xl">No appointments found</h3>
              <p className="text-slate-500">Your schedule is currently empty.</p>
            </div>
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
                <p className="text-slate-500">Please provide a reason for declining this request so the client understands why.</p>
              </div>
            </div>

            <div className="mt-6">
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="E.g., I'm unavailable at this time, or my vehicle is undergoing maintenance..."
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
