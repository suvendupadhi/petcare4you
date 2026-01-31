import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
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
  User as UserIcon
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { appointmentService, Appointment, userService, User, Provider } from '@/services/petCareService';

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [revenue, setRevenue] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [currentUser, appointments] = await Promise.all([
        userService.getCurrentUser(),
        appointmentService.getProviderAppointments()
      ]);
      
      setUser(currentUser);
      if (currentUser.provider) {
        setProvider(currentUser.provider);
      }
      
      const today = new Date().toISOString().split('T')[0];
      const todayApps = appointments.filter(a => a.appointmentDate.startsWith(today));
      const upcomingApps = appointments.filter(a => {
        const appDate = a.appointmentDate.split('T')[0];
        return appDate > today && a.status !== 'cancelled';
      });
      
      setTodayAppointments(todayApps);
      setUpcomingAppointments(upcomingApps);
      
      // Calculate simple revenue
      const todayRevenue = todayApps
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
        
      const totalRevenue = appointments
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

      setRevenue({
        today: todayRevenue,
        week: totalRevenue, // Simplification
        month: totalRevenue // Simplification
      });
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

  const getStatusColor = (status: string) => {
    return status === 'confirmed' ? 'text-green-600' : 'text-yellow-600';
  };

  const getStatusBgColor = (status: string) => {
    return status === 'confirmed' ? 'bg-green-100' : 'bg-yellow-100';
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        {/* Header */}
        <View className="p-6 flex-row justify-between items-center">
          <View>
            <Text className="text-muted-foreground text-sm">Welcome back,</Text>
            <Text className="text-foreground text-2xl font-bold mt-1">{user?.firstName || 'Provider'}</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <ThemeToggle />
            <TouchableOpacity onPress={() => router.push('/profile-provider')}>
              <UserIcon className="text-foreground" size={24} />
            </TouchableOpacity>
            <TouchableOpacity className="relative">
              <Bell className="text-foreground" size={24} />
              <View className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Revenue Summary Cards */}
        <View className="px-6 mb-6">
          <Text className="text-foreground text-lg font-semibold mb-3">Revenue Summary</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-card border border-border rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <DollarSign className="text-primary" size={20} />
                <TrendingUp className="text-green-600" size={16} />
              </View>
              <Text className="text-foreground text-2xl font-bold">${revenue.today}</Text>
              <Text className="text-muted-foreground text-xs mt-1">Today</Text>
            </View>

            <View className="flex-1 bg-card border border-border rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <DollarSign className="text-primary" size={20} />
                <TrendingUp className="text-green-600" size={16} />
              </View>
              <Text className="text-foreground text-2xl font-bold">${revenue.week}</Text>
              <Text className="text-muted-foreground text-xs mt-1">This Week</Text>
            </View>

            <View className="flex-1 bg-card border border-border rounded-2xl p-4">
              <View className="flex-row items-center justify-between mb-2">
                <DollarSign className="text-primary" size={20} />
                <TrendingUp className="text-green-600" size={16} />
              </View>
              <Text className="text-foreground text-2xl font-bold">${revenue.month}</Text>
              <Text className="text-muted-foreground text-xs mt-1">This Month</Text>
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
              <Calendar className="text-primary-foreground mb-2" size={24} />
              <Text className="text-primary-foreground font-semibold text-center">Manage Availability</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center"
              onPress={() => router.push('/appointments-provider')}
            >
              <Clock className="text-primary mb-2" size={24} />
              <Text className="text-foreground font-semibold text-center">All Bookings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-1 bg-card border border-border rounded-2xl p-4 items-center"
              onPress={() => router.push('/payment-invoice')}
            >
              <DollarSign className="text-primary mb-2" size={24} />
              <Text className="text-foreground font-semibold text-center">Payments</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Schedule */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-foreground text-lg font-semibold">Today's Schedule</Text>
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
                        <PawPrint className="text-primary" size={20} />
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
                          {appointment.status}
                        </Text>
                      </View>
                      <View className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1">
                        <Clock className="text-primary" size={10} />
                        <Text className="text-primary font-bold text-[10px]">
                          {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <DollarSign className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm font-medium">${appointment.totalPrice}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Users className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm font-medium">{appointment.petType}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="bg-card border border-border rounded-2xl p-6 items-center">
              <Calendar className="text-muted-foreground mb-2" size={48} />
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
                        <PawPrint className="text-primary" size={16} />
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
          <Text className="text-foreground text-lg font-semibold mb-3">Business Stats</Text>
          <View className="bg-card border border-border rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="items-center flex-1">
                <Text className="text-foreground text-2xl font-bold">24</Text>
                <Text className="text-muted-foreground text-xs mt-1">This Week</Text>
              </View>
              <View className="w-px h-12 bg-border" />
              <View className="items-center flex-1">
                <Text className="text-foreground text-2xl font-bold">156</Text>
                <Text className="text-muted-foreground text-xs mt-1">Total Clients</Text>
              </View>
              <View className="w-px h-12 bg-border" />
              <View className="items-center flex-1">
                <Text className="text-foreground text-2xl font-bold">4.8</Text>
                <Text className="text-muted-foreground text-xs mt-1">Rating</Text>
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