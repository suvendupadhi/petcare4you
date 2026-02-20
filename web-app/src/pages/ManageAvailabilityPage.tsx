import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2,
  CalendarDays
} from 'lucide-react';
import Layout from '../components/Layout';
import { availabilityService, Availability } from '../services/petCareService';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ManageAvailabilityPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

  // Form state for new slot
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");

  const handleStartTimeChange = (val: string) => {
    setStartTime(val);
    try {
      const [hours, minutes] = val.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes + 30);
      const newEndHours = date.getHours().toString().padStart(2, '0');
      const newEndMinutes = date.getMinutes().toString().padStart(2, '0');
      setEndTime(`${newEndHours}:${newEndMinutes}`);
    } catch (e) {
      console.error('Error calculating end time:', e);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getMyAvailability();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error loading availability:', error);
      showToast('Failed to load availability', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const startDateTime = new Date(year, month - 1, day, startH, startM).toISOString();
      const endDateTime = new Date(year, month - 1, day, endH, endM).toISOString();
      const dateOnly = new Date(year, month - 1, day).toISOString();

      await availabilityService.createAvailability({
        date: dateOnly,
        startTime: startDateTime,
        endTime: endDateTime,
        isBooked: false
      });
      
      showToast('Availability slot added successfully!', 'success');
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      showToast('Failed to add availability', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = (id: number) => {
    setSlotToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;
    
    try {
      await availabilityService.deleteAvailability(slotToDelete);
      setAvailabilities(prev => prev.filter(a => a.id !== slotToDelete));
      showToast('Availability slot deleted', 'success');
    } catch (error) {
      showToast('Failed to delete availability', 'error');
    } finally {
      setShowDeleteModal(false);
      setSlotToDelete(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-slate-500">Loading Availability...</div>;

  return (
    <Layout userType="provider">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manage Availability 📅</h1>
            <p className="text-slate-500">Set your working hours and available dates.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Slot Form */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sticky top-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Plus size={20} className="text-orange-600" />
                Add New Slot
              </h2>
              
              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Select Date</label>
                  <input 
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Start Time</label>
                    <input 
                      type="time"
                      value={startTime}
                      onChange={(e) => handleStartTimeChange(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">End Time</label>
                    <input 
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors shadow-md disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {saving ? 'Adding...' : (
                    <>
                      <Plus size={18} />
                      Add Slot
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* List of Slots */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays size={20} className="text-orange-600" />
              Your Availability Slots
            </h2>

            {availabilities.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center space-y-3">
                <CalendarIcon size={48} className="mx-auto text-slate-300" />
                <p className="text-slate-500 font-medium">No slots found. Add some to start receiving bookings!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {availabilities
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((slot) => (
                  <div key={slot.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-orange-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                        <CalendarIcon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{new Date(slot.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1">
                          <Clock size={14} />
                          <span className="font-medium">
                            {new Date(slot.startTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {slot.isBooked ? (
                        <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">Booked</span>
                      ) : (
                        <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full border border-blue-100 uppercase tracking-wider">Available</span>
                      )}
                      <button 
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={slot.isBooked}
                        className={`p-2 rounded-lg transition-colors ${slot.isBooked ? 'text-slate-300 cursor-not-allowed' : 'text-red-500 hover:bg-red-50'}`}
                        title={slot.isBooked ? "Cannot delete booked slot" : "Delete slot"}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Availability Slot"
        message="Are you sure you want to delete this availability slot? This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Keep"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        type="danger"
      />
    </Layout>
  );
}
