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

export default function ManageAvailabilityPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  
  // Form state for new slot
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");

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
      alert('Failed to load availability');
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
      
      alert('Availability slot added successfully!');
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      alert('Failed to add availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this availability slot?')) return;
    
    try {
      await availabilityService.deleteAvailability(id);
      setAvailabilities(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      alert('Failed to delete availability');
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
                      onChange={(e) => setStartTime(e.target.value)}
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
                          {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    </Layout>
  );
}
