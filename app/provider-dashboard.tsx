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
  Phone
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - Replace with API calls
const mockTodayAppointments = [
  {
    id: '1',
    petOwnerName: 'Sarah Johnson',
    petName: 'Max',
    serviceType: 'Grooming',
    time: '10:00 AM',
    duration: '1 hour',
    status: 'confirmed',
    phone: '(555) 123-4567'
  },
  {
    id: '2',
    petOwnerName: 'Mike Chen',
    petName: 'Luna',
    serviceType: 'Daycare',
    time: '11:30 AM',
    duration: '4 hours',
    status: 'confirmed',
    phone: '(555) 234-5678'
  },
  {
    id: '3',
    petOwnerName: 'Emily Davis',
    petName: 'Charlie',
    serviceType: 'Grooming',
    time: '2:00 PM',
    duration: '1.5 hours',
    status: 'pending',
    phone: '(555) 345-6789'
  }
];

const mockUpcomingAppointments = [
  {
    id: '4',
    date: 'Tomorrow',
    petOwnerName: 'John Smith',
    petName: 'Bella',
    serviceType: 'Daycare',
    time: '9:00 AM'
  },
  {
    id: '5',
    date: 'Jan 26',
    petOwnerName: 'Lisa Brown',
    petName: 'Rocky',
    serviceType: 'Grooming',
    time: '3:00 PM'
  }
];

const mockRevenueData = {
  today: 450,
  week: 2850,
  month: 12400
};

export default function ProviderDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState(mockTodayAppointments);
  const [upcomingAppointments, setUpcomingAppointments] = useState(mockUpcomingAppointments);
  const [revenue, setRevenue] = useState(mockRevenueData);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/provider/dashboard', {
      //   headers: { Authorization: `Bearer ${userToken}` }
      // });
      // const data = await response.json();
      // setTodayAppointments(data.todayAppointments);
      // setUpcomingAppointments(data.upcomingAppointments);
      // setRevenue(data.revenue);

      // Simulate API call
      setTimeout(() => {
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
            <Text className="text-foreground text-2xl font-bold mt-1">Pawsome Grooming</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <ThemeToggle />
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
              onPress={() => router.push('/availability-management')}
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
                    // TODO: Navigate to appointment details
                    // router.push(`/appointment-details?id=${appointment.id}`);
                  }}
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center gap-2">
                      <View className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center">
                        <PawPrint className="text-primary" size={20} />
                      </View>
                      <View>
                        <Text className="text-foreground font-semibold">{appointment.petName}</Text>
                        <Text className="text-muted-foreground text-sm">{appointment.petOwnerName}</Text>
                      </View>
                    </View>
                    <View className={`${getStatusBgColor(appointment.status)} px-3 py-1 rounded-full`}>
                      <Text className={`${getStatusColor(appointment.status)} text-xs font-medium capitalize`}>
                        {appointment.status}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Clock className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm">{appointment.time}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Calendar className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm">{appointment.duration}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Users className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm">{appointment.serviceType}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1 mt-2">
                    <Phone className="text-muted-foreground" size={14} />
                    <Text className="text-muted-foreground text-sm">{appointment.phone}</Text>
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
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-primary/10 w-8 h-8 rounded-full items-center justify-center">
                        <PawPrint className="text-primary" size={16} />
                      </View>
                      <View>
                        <Text className="text-foreground font-medium">{appointment.petName}</Text>
                        <Text className="text-muted-foreground text-xs">{appointment.petOwnerName}</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-foreground text-sm font-medium">{appointment.date}</Text>
                      <Text className="text-muted-foreground text-xs">{appointment.time}</Text>
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