import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  PawPrint,
  Bell,
  User,
  Home,
  ChevronRight,
  Star,
  Plus,
  LogOut,
  X,
  Trash2
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService, appointmentService, providerService, recentProviderService, userService, tipService, Appointment, Provider, User as UserType, Tip } from '@/services/petCareService';
import { api, getToken } from '@/services/api';
import { getStatusLabel } from '@/constants/status';
import { useColorScheme } from 'react-native';

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentProviders, setRecentProviders] = useState<Provider[]>([]);
  const [user, setUser] = useState<UserType | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);

  useEffect(() => {
    let isMounted = true;
    loadDashboardData();
    fetchNotifications();
    const interval = setInterval(() => {
      if (isMounted) fetchNotifications();
    }, 30000); // Polling every 30s
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [notifs, count] = await Promise.all([
        api.getNotifications(),
        api.getUnreadCount()
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      // Don't log if it's just a 401/unauthorized error during logout
      const token = await getToken();
      if (token) {
        console.error('Error fetching notifications:', error);
      }
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

  const loadDashboardData = async () => {
    try {
      const [appointmentsData, providersData, userData, recentData, tipData] = await Promise.all([
        appointmentService.getOwnerAppointments(),
        providerService.getProviders(),
        userService.getCurrentUser(),
        recentProviderService.getRecentProviders(),
        tipService.getRandomTip().catch(() => null)
      ]);
      setAppointments(appointmentsData);
      setRecentProviders(recentData.length > 0 ? recentData.slice(0, 3) : providersData.slice(0, 3));
      setUser(userData);
      setCurrentTip(tipData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Navigate to search screen with query
    router.push('/search-providers');
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-muted-foreground mt-4">Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-10 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-muted-foreground text-sm">Welcome back,</Text>
              <Text className="text-foreground text-2xl font-bold">{user?.firstName || 'Pet Owner'}</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity onPress={() => router.push('/search-providers')}>
                <Plus color={isDark ? '#fb923c' : '#ea580c'} size={24} />
              </TouchableOpacity>
              <ThemeToggle />
              <TouchableOpacity onPress={() => router.push('/profile-owner')}>
                <User color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              </TouchableOpacity>
              <TouchableOpacity 
                className="relative"
                onPress={() => setShowNotifications(true)}
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
                  keyExtractor={(item) => item.id.toString()}
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

          {/* Quick Search */}
          <TouchableOpacity 
            onPress={handleSearch}
            className="bg-card border border-border rounded-2xl p-4 flex-row items-center"
          >
            <Search color={isDark ? '#fb923c' : '#ea580c'} size={22} />
            <Text className="flex-1 text-muted-foreground text-base ml-3">
              Book a new service...
            </Text>
            <ChevronRight color={isDark ? '#94a3b8' : '#64748b'} size={20} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleSearch}
              className="flex-1 bg-primary rounded-xl p-4 items-center"
            >
              <Search color="#ffffff" size={24} />
              <Text className="text-primary-foreground font-semibold text-sm mt-2">
                Book Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/appointments-owner')}
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
            >
              <Calendar color={isDark ? '#fb923c' : '#2563eb'} size={24} />
              <Text className="text-foreground font-semibold text-sm mt-2">
                My Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/profile-owner')}
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
            >
              <User color={isDark ? '#fb923c' : '#2563eb'} size={24} />
              <Text className="text-foreground font-semibold text-sm mt-2">
                My Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="mb-6">
          <View className="px-6 mb-4 flex-row items-center justify-between">
            <Text className="text-foreground text-xl font-bold">Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/appointments-owner')}>
              <Text className="text-primary font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {appointments.length === 0 ? (
            <View className="mx-6 bg-muted rounded-xl p-8 items-center">
              <Calendar color={isDark ? '#475569' : '#94a3b8'} size={48} />
              <Text className="text-foreground font-semibold text-base mb-2">
                No Upcoming Appointments
              </Text>
              <Text className="text-muted-foreground text-sm text-center mb-4">
                Book your first pet care service today!
              </Text>
              <TouchableOpacity 
                onPress={handleSearch}
                className="bg-primary rounded-xl px-6 py-3"
              >
                <Text className="text-primary-foreground font-bold">Find Services</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
            >
              {appointments.map((appointment) => (
                <TouchableOpacity
                  key={appointment.id}
                  onPress={() => router.push({ pathname: '/appointment-detail', params: { id: appointment.id } })}
                  className="bg-card border border-border rounded-2xl p-4 w-80"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">
                        {appointment.provider?.companyName || 'Unknown Provider'}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Star color={isDark ? '#fb923c' : '#ea580c'} size={14} fill={isDark ? '#fb923c' : '#EA580C'} />
                        <Text className="text-muted-foreground text-sm">
                          {appointment.provider?.serviceType?.name || 'Service'}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="text-primary text-xs font-semibold capitalize">
                        {getStatusLabel(appointment.status)}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-muted rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Calendar color={isDark ? '#fb923c' : '#ea580c'} size={16} />
                      <Text className="text-foreground font-semibold ml-2">
                        {new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock color={isDark ? '#fb923c' : '#ea580c'} size={16} />
                      <Text className="text-foreground font-semibold ml-2">
                        {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <MapPin color={isDark ? '#94a3b8' : '#64748b'} size={16} />
                    <Text className="text-muted-foreground text-sm flex-1 ml-2" numberOfLines={1}>
                      {appointment.provider?.address || 'Address not available'}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <PawPrint color={isDark ? '#fb923c' : '#ea580c'} size={16} />
                    <Text className="text-foreground font-semibold ml-2">
                      Pet: {appointment.petName}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Recent/Favorite Providers */}
        <View className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-foreground text-xl font-bold">Recent Providers</Text>
            <TouchableOpacity onPress={handleSearch}>
              <Text className="text-primary font-semibold">Explore More</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {recentProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                onPress={() => router.push({ pathname: '/provider-detail', params: { id: provider.id } })}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-base mb-1">
                      {provider.companyName}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Star color={isDark ? '#fb923c' : '#ea580c'} size={14} fill={isDark ? '#fb923c' : '#EA580C'} />
                      <Text className="text-foreground font-semibold text-sm">
                        {provider.rating.toFixed(1)}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        ({provider.reviewCount} reviews)
                      </Text>
                    </View>
                  </View>
                  <ChevronRight color={isDark ? '#94a3b8' : '#64748b'} size={20} />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="text-primary text-xs font-semibold">
                        {provider.serviceType?.name || 'Service'}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <MapPin className="text-muted-foreground mr-1" size={14} />
                    <Text className="text-muted-foreground text-sm">
                      {provider.city}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        {currentTip && (
          <View className="px-6 mt-6">
            <View className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <View className="flex-row items-center mb-3">
                <View className="bg-primary rounded-full p-2 mr-3">
                  <PawPrint className="text-primary-foreground" size={20} />
                </View>
                <Text className="text-foreground font-bold text-base flex-1">
                  {currentTip.title}
                </Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-5">
                {currentTip.content}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}