import React from 'react';
import { Bell, CheckCircle, Info, Calendar, MessageSquare } from 'lucide-react';
import Layout from '../components/Layout';

export default function NotificationsPage() {
  // Placeholder data - in a real app this would come from a notificationService
  const notifications = [
    { id: 1, type: 'booking', title: 'New Booking Request', message: 'John Doe wants to book Dog Walking for tomorrow.', time: '2 mins ago', read: false },
    { id: 2, type: 'payment', title: 'Payment Received', message: 'You received $50.00 for the grooming service.', time: '1 hour ago', read: true },
    { id: 3, type: 'system', title: 'Profile Verified', message: 'Your business profile has been successfully verified.', time: '5 hours ago', read: true },
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <button className="text-sm font-bold text-orange-600 hover:underline">Mark all as read</button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {notifications.map((notif) => (
            <div key={notif.id} className={`p-6 flex gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${!notif.read ? 'bg-orange-50/20' : ''}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                notif.type === 'booking' ? 'bg-blue-50 text-blue-600' : 
                notif.type === 'payment' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {notif.type === 'booking' ? <Calendar size={20} /> : 
                 notif.type === 'payment' ? <CheckCircle size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm md:text-base">{notif.title}</h3>
                  <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
              </div>
              {!notif.read && <div className="w-2 h-2 rounded-full bg-orange-600 self-center" />}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
