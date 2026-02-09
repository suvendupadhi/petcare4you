import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform, Modal, FlatList, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Bell,
  Settings,
  CheckCircle,
  AlertCircle,
  Users,
  PawPrint,
  MapPin,
  Phone,
  User as UserIcon,
  LogOut,
  X,
  Trash2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService, appointmentService, Appointment, userService, User, Provider, paymentService, RevenueSummary } from '@/services/petCareService';
import { api } from '@/services/api';
import { APPOINTMENT_STATUS, getStatusLabel } from '@/constants/status';
import { useColorScheme } from 'react-native';

export default function ProviderDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadDashboardData();
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      // Use Promise.allSettled to prevent one failure from blocking both
      const results = await Promise.allSettled([
        api.getNotifications(),
        api.getUnreadCount()
      ]);
      
      let notifs = [];
      let count = unreadCount;

      if (results[0].status === 'fulfilled') {
        notifs = results[0].value || [];
      } else {
        console.error('Error fetching notifications list:', results[0].reason);
      }

      if (results[1].status === 'fulfilled') {
        count = results[1].value || 0;
      } else {
        console.error('Error fetching unread count:', results[1].reason);
      }
      
      // Normalize notifications to handle potential PascalCase from API
      const normalizedNotifs = notifs.map((n: any) => ({
        id: n.id ?? n.Id,
        title: n.title ?? n.Title,
        message: n.message ?? n.Message,
        type: n.type ?? n.Type,
        referenceId: n.referenceId ?? n.ReferenceId,
        isRead: n.isRead ?? n.IsRead,
        createdAt: n.createdAt ?? n.CreatedAt,
      }));

      setNotifications(normalizedNotifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markNotificationsAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      const notification = notifications.find(n => n.id === id);
      await api.markNotificationAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Navigate to appointment if reference_id exists
      if (notification?.referenceId) {
        setShowNotifications(false);
        router.push({
          pathname: '/appointment-detail',
          params: { id: notification.referenceId }
        });
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await api.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      const wasUnread = !notifications.find(n => n.id === id)?.isRead;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        authService.logout().then(() => router.replace('/'));
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: async () => {
              await authService.logout();
              router.replace('/');
            },
          },
        ]
      );
    }
  };

  const loadDashboardData = async () => {
    try {
      const [currentUser, appointments] = await Promise.all([
        userService.getCurrentUser(),
        appointmentService.getProviderAppointments()
      ]);
      
      setUser(currentUser);
      if (currentUser.provider) {
        setProvider(currentUser.provider);
        const revenueData = await paymentService.getRevenueSummary();
        setRevenue(revenueData);
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointments.filter(a => a.appointmentDate.startsWith(today));
      const upcomingApps = appointments.filter(a => {
        const appDate = a.appointmentDate.split('T')[0];
        return appDate > today && a.status !== APPOINTMENT_STATUS.CANCELLED;
      });
      
      setTodayAppointments(todayApps);
      setUpcomingAppointments(upcomingApps);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-muted-foreground mt-4">Loading dashboard...</Text>
      </SafeAreaView>
    );
  }

  const getStatusColor = (status: number) => {
    return status === APPOINTMENT_STATUS.CONFIRMED ? 'text-green-600' : 'text-yellow-600';
  };

  const getStatusBgColor = (status: number) => {
    return status === APPOINTMENT_STATUS.CONFIRMED ? 'bg-green-100' : 'bg-yellow-100';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 128 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-10 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground text-sm">Welcome back,</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">{user?.firstName || 'Provider'}</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <ThemeToggle />
            <TouchableOpacity onPress={() => router.push('/profile-provider')}>
              <UserIcon color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              className="relative"
              onPress={() => {
                Keyboard.dismiss();
                setShowNotifications(true);
              }}
            >
              <Bell color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                  <Text className="text-white text-[10px] font-bold">{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <LogOut color={isDark ? '#f87171' : '#dc2626'} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-[32px] h-[80%]">
              <View className="p-6 border-b border-border flex-row justify-between items-center">
                <View>
                  <Text className="text-foreground text-xl font-bold">Notifications</Text>
                  {unreadCount > 0 && (
                    <Text className="text-muted-foreground text-sm">{unreadCount} unread messages</Text>
                  )}
                </View>
                <View className="flex-row items-center gap-4">
                  {unreadCount > 0 && (
                    <TouchableOpacity onPress={handleMarkAllAsRead}>
                      <Text className="text-primary font-semibold text-sm">Mark all read</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    onPress={() => setShowNotifications(false)}
                    className="bg-secondary p-2 rounded-full"
                  >
                    <X color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={notifications}
                keyExtractor={(item) => (item.id || item.Id || Math.random().toString()).toString()}
                contentContainerStyle={{ padding: 24 }}
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center py-20">
                    <Bell color={isDark ? '#1e293b' : '#f1f5f9'} size={64} />
                    <Text className="text-muted-foreground text-lg mt-4">No notifications yet</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    className={`p-4 rounded-2xl mb-3 border ${item.isRead ? 'bg-card border-border' : 'bg-primary/5 border-primary/20'}`}
                    onPress={() => handleMarkAsRead(item.id)}
                  >
                    <View className="flex-row justify-between items-start mb-1">
                      <Text className={`font-bold ${item.isRead ? 'text-foreground' : 'text-primary'}`}>{item.title}</Text>
                      <TouchableOpacity onPress={() => handleDeleteNotification(item.id)}>
                        <Trash2 color="#ef4444" size={16} />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-muted-foreground text-sm mb-2">{item.message}</Text>
                    <Text className="text-muted-foreground text-[10px]">
                      {new Date(item.createdAt).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>

        {/* Revenue Summary Cards */}
        <View className="px-6 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">Revenue Summary</Text>
          <View className="gap-3">
            <View className="flex-row gap-3">
              <View className="flex-1 bg-card border border-border rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <DollarSign color={isDark ? '#fb923c' : '#2563eb'} size={20} />
                  <TrendingUp color="#16a34a" size={16} />
                </View>
                <Text className="text-foreground text-2xl font-bold">${revenue?.weeklyRevenue || 0}</Text>
                <Text className="text-muted-foreground text-xs mt-1">This Week</Text>
              </View>

              <View className="flex-1 bg-card border border-border rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <DollarSign color={isDark ? '#fb923c' : '#2563eb'} size={20} />
                  <TrendingUp color="#16a34a" size={16} />
                </View>
                <Text className="text-foreground text-2xl font-bold">${revenue?.monthlyRevenue || 0}</Text>
                <Text className="text-muted-foreground text-xs mt-1">This Month</Text>
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 bg-card border border-border rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <DollarSign color={isDark ? '#fb923c' : '#2563eb'} size={20} />
                  <TrendingUp color="#16a34a" size={16} />
                </View>
                <Text className="text-foreground text-2xl font-bold">${revenue?.totalRevenue || 0}</Text>
                <Text className="text-muted-foreground text-xs mt-1">Total Earnings</Text>
              </View>

              <View className="flex-1 bg-card border border-border rounded-2xl p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Clock color={isDark ? '#fb923c' : '#2563eb'} size={20} />
                  <AlertCircle color="#eab308" size={16} />
                </View>
                <Text className="text-foreground text-2xl font-bold">${revenue?.pendingRevenue || 0}</Text>
                <Text className="text-muted-foreground text-xs mt-1">Pending</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">Quick Actions</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              className="flex-1 bg-primary rounded-2xl p-4 items-center"
              onPress={() => router.push('/manage-availability')}
            >
              <Calendar color="#ffffff" size={24} />
              <Text className="text-primary-foreground font-semibold text-center mt-2">Manage Availability</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center"
              onPress={() => router.push('/appointments-provider')}
            >
              <Clock color={isDark ? '#fb923c' : '#2563eb'} size={24} />
              <Text className="text-foreground font-semibold text-center mt-2">All Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center"
              onPress={() => router.push('/payment-invoice')}
            >
              <DollarSign color={isDark ? '#fb923c' : '#2563eb'} size={24} />
              <Text className="text-foreground font-semibold text-center mt-2">Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-lg font-semibold">Today&apos;s Schedule</Text>
            <Text className="text-primary font-medium">{todayAppointments.length} appointments</Text>
          </View>

          {todayAppointments.length > 0 ? (
            <View className="gap-3">
              {todayAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className="bg-card border border-border rounded-2xl p-4"
                  onPress={() => {
                    router.push({
                      pathname: '/appointment-detail',
                      params: { id: appointment.id }
                    });
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <PawPrint color={isDark ? '#fb923c' : '#ea580c'} size={20} />
                      </View>
                      <View>
                        <Text className="text-foreground font-semibold">{appointment.petName}</Text>
                        <Text className="text-muted-foreground text-sm">
                          {appointment.owner?.firstName} {appointment.owner?.lastName}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end gap-1">
                      <View className={`${getStatusBgColor(appointment.status)} px-2 py-0.5 rounded-full`}>
                        <Text className={`${getStatusColor(appointment.status)} text-[10px] font-bold capitalize`}>
                          {getStatusLabel(appointment.status)}
                        </Text>
                      </View>
                      <View className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1">
                        <Clock color={isDark ? '#fb923c' : '#ea580c'} size={10} />
                        <Text className="text-primary font-bold text-[10px]">
                          {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <DollarSign color={isDark ? '#94a3b8' : '#64748b'} size={14} />
                      <Text className="text-muted-foreground text-sm font-medium">${appointment.totalPrice}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Users color={isDark ? '#94a3b8' : '#64748b'} size={14} />
                      <Text className="text-muted-foreground text-sm font-medium">{appointment.petType}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-card border border-border rounded-2xl p-6 items-center">
              <Calendar color={isDark ? '#475569' : '#94a3b8'} size={48} />
              <Text className="text-foreground font-semibold">No appointments today</Text>
              <Text className="text-muted-foreground text-sm text-center mt-1">
                You have a free day! Check upcoming bookings below.
              </Text>
            </View>
          )}
        </View>

        {/* Upcoming Appointments */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-lg font-semibold">Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/appointments-provider')}>
              <Text className="text-primary font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {upcomingAppointments.length > 0 ? (
            <View className="gap-2">
              {upcomingAppointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  className="bg-card border border-border rounded-xl p-3"
                  onPress={() => {
                    router.push({
                      pathname: '/appointment-detail',
                      params: { id: appointment.id }
                    });
                  }}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center">
                        <PawPrint color={isDark ? '#fb923c' : '#ea580c'} size={16} />
                      </View>
                      <View>
                        <Text className="text-foreground font-medium">{appointment.petName}</Text>
                        <Text className="text-muted-foreground text-xs">
                          {appointment.owner?.firstName} {appointment.owner?.lastName}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-foreground text-sm font-medium">
                        {new Date(appointment.appointmentDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </Text>
                      <Text className="text-muted-foreground text-xs">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-card border border-border rounded-2xl p-4 items-center">
              <Text className="text-muted-foreground text-sm">No upcoming appointments</Text>
            </View>
          )}
        </View>

        {/* Business Stats */}
        <View className="px-6 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">Business Performance</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-4">
              <View className="items-center flex-1">
                <Text className="text-foreground text-xl font-bold">{revenue?.totalAppointments || 0}</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">Total Bookings</Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="items-center flex-1">
                <Text className="text-foreground text-xl font-bold">{revenue?.completedAppointments || 0}</Text>
                <Text className="text-muted-foreground text-[10px] mt-1">Completed</Text>
              </View>
              <View className="w-px h-8 bg-border" />
              <View className="items-center flex-1">
                <View className="flex-row items-center gap-1">
                  <Text className={`text-xl font-bold ${(revenue?.growthRate || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(revenue?.growthRate || 0).toFixed(1)}%
                  </Text>
                </View>
                <Text className="text-muted-foreground text-[10px] mt-1">Growth</Text>
              </View>
            </View>
            <View className="pt-4 border-t border-border">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground text-sm">Avg. Revenue per Booking</Text>
                <Text className="text-foreground font-bold">${(revenue?.averageRevenuePerAppointment || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Tip */}
        <View className="px-6 mb-6">
          <View className="bg-primary/10 border border-primary/20 rounded-2xl p-4">
            <View className="flex-row items-start gap-3">
              <AlertCircle className="text-primary" size={20} />
              <View className="flex-1">
                <Text className="text-foreground font-semibold mb-1">Business Tip</Text>
                <Text className="text-muted-foreground text-sm">
                  Keep your availability calendar updated to receive more bookings. Clients prefer providers with clear schedules.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}