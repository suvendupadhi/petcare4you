import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Info, Calendar, MessageSquare, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { notificationService } from '../services/petCareService';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
      case 'booking':
        return <Calendar size={20} />;
      case 'payment':
        return <CheckCircle size={20} />;
      case 'message':
        return <MessageSquare size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appointment':
      case 'booking':
        return 'bg-blue-50 text-blue-600';
      case 'payment':
        return 'bg-green-50 text-green-600';
      case 'message':
        return 'bg-purple-50 text-purple-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={handleMarkAllAsRead}
              className="text-sm font-bold text-orange-600 hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
            <Bell className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No notifications yet</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                onClick={() => handleMarkAsRead(notif.id)}
                className={`p-6 flex gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${!notif.isRead ? 'bg-orange-50/20' : ''}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${getIconColor(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm md:text-base ${notif.isRead ? 'text-slate-900' : 'text-orange-600'}`}>
                      {notif.title}
                    </h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-bold">
                        {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notif.id);
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed">{notif.message}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-orange-600 self-center" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
