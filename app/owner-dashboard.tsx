import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
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
  Star
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - Replace with API calls
const mockUpcomingAppointments = [
  {
    id: '1',
    providerName: 'Pawsome Grooming Spa',
    serviceType: 'Pet Grooming',
    date: '2024-01-25',
    time: '10:00 AM',
    petName: 'Max',
    address: '123 Pet Street, City',
    status: 'confirmed',
    providerRating: 4.8
  },
  {
    id: '2',
    providerName: 'Happy Tails Daycare',
    serviceType: 'Pet Daycare',
    date: '2024-01-28',
    time: '8:00 AM',
    petName: 'Bella',
    address: '456 Care Ave, City',
    status: 'confirmed',
    providerRating: 4.9
  }
];

const mockRecentProviders = [
  {
    id: '1',
    name: 'Pawsome Grooming Spa',
    rating: 4.8,
    reviews: 156,
    distance: '2.3 miles',
    services: ['Grooming', 'Bathing']
  },
  {
    id: '2',
    name: 'Happy Tails Daycare',
    rating: 4.9,
    reviews: 203,
    distance: '1.8 miles',
    services: ['Daycare', 'Boarding']
  },
  {
    id: '3',
    name: 'Pet Paradise Resort',
    rating: 4.7,
    reviews: 98,
    distance: '3.5 miles',
    services: ['Daycare', 'Grooming']
  }
];

export default function OwnerDashboardScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appointments, setAppointments] = useState(mockUpcomingAppointments);
  const [recentProviders, setRecentProviders] = useState(mockRecentProviders);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // TODO: Connect to your backend API
    // Example: GET /api/owner/dashboard
    // Fetch: upcoming appointments, recent bookings, favorite providers
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSearch = () => {
    // Navigate to search screen with query
    router.push('/search-providers');
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
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-muted-foreground text-sm">Welcome back,</Text>
              <Text className="text-foreground text-2xl font-bold">Pet Owner</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity>
                <Bell className="text-foreground" size={24} />
              </TouchableOpacity>
              <ThemeToggle />
              <TouchableOpacity onPress={() => router.push('/owner-profile')}>
                <User className="text-foreground" size={24} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Search */}
          <TouchableOpacity 
            onPress={handleSearch}
            className="bg-card border border-border rounded-2xl p-4 flex-row items-center"
          >
            <Search className="text-primary mr-3" size={22} />
            <Text className="flex-1 text-muted-foreground text-base">
              Search for pet services...
            </Text>
            <ChevronRight className="text-muted-foreground" size={20} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={handleSearch}
              className="flex-1 bg-primary rounded-xl p-4 items-center"
            >
              <Search className="text-primary-foreground mb-2" size={24} />
              <Text className="text-primary-foreground font-semibold text-sm">
                Find Services
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/owner-appointments')}
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
            >
              <Calendar className="text-primary mb-2" size={24} />
              <Text className="text-foreground font-semibold text-sm">
                My Bookings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.push('/owner-profile')}
              className="flex-1 bg-card border border-border rounded-xl p-4 items-center"
            >
              <User className="text-primary mb-2" size={24} />
              <Text className="text-foreground font-semibold text-sm">
                My Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <View className="mb-6">
          <View className="px-6 mb-4 flex-row items-center justify-between">
            <Text className="text-foreground text-xl font-bold">Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/owner-appointments')}>
              <Text className="text-primary font-semibold">See All</Text>
            </TouchableOpacity>
          </View>

          {appointments.length === 0 ? (
            <View className="mx-6 bg-muted rounded-xl p-8 items-center">
              <Calendar className="text-muted-foreground mb-3" size={48} />
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
                  onPress={() => router.push('/appointment-details')}
                  className="bg-card border border-border rounded-2xl p-4 w-80"
                >
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">
                        {appointment.providerName}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Star className="text-primary" size={14} fill="#EA580C" />
                        <Text className="text-muted-foreground text-sm">
                          {appointment.providerRating} · {appointment.serviceType}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-primary/10 rounded-full px-3 py-1">
                      <Text className="text-primary text-xs font-semibold capitalize">
                        {appointment.status}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-muted rounded-xl p-3 mb-3">
                    <View className="flex-row items-center mb-2">
                      <Calendar className="text-primary mr-2" size={16} />
                      <Text className="text-foreground font-semibold">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Clock className="text-primary mr-2" size={16} />
                      <Text className="text-foreground font-semibold">
                        {appointment.time}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <MapPin className="text-muted-foreground mr-2" size={16} />
                    <Text className="text-muted-foreground text-sm flex-1" numberOfLines={1}>
                      {appointment.address}
                    </Text>
                  </View>

                  <View className="flex-row items-center mt-2">
                    <PawPrint className="text-primary mr-2" size={16} />
                    <Text className="text-foreground font-semibold">
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
                onPress={() => router.push('/provider-details')}
                className="bg-card border border-border rounded-2xl p-4"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-base mb-1">
                      {provider.name}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Star className="text-primary" size={14} fill="#EA580C" />
                      <Text className="text-foreground font-semibold text-sm">
                        {provider.rating}
                      </Text>
                      <Text className="text-muted-foreground text-sm">
                        ({provider.reviews} reviews)
                      </Text>
                    </View>
                  </View>
                  <ChevronRight className="text-muted-foreground" size={20} />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    {provider.services.map((service, index) => (
                      <View key={index} className="bg-primary/10 rounded-full px-3 py-1">
                        <Text className="text-primary text-xs font-semibold">
                          {service}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row items-center">
                    <MapPin className="text-muted-foreground mr-1" size={14} />
                    <Text className="text-muted-foreground text-sm">
                      {provider.distance}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View className="px-6 mt-6">
          <View className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
            <View className="flex-row items-center mb-3">
              <View className="bg-primary rounded-full p-2 mr-3">
                <PawPrint className="text-primary-foreground" size={20} />
              </View>
              <Text className="text-foreground font-bold text-base flex-1">
                Pet Care Tip
              </Text>
            </View>
            <Text className="text-muted-foreground text-sm leading-5">
              Regular grooming keeps your pet healthy and happy! Book a grooming session 
              every 4-6 weeks for optimal coat and skin health.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}