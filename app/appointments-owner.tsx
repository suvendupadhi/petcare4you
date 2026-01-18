import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  PawPrint,
  Phone,
  ChevronLeft,
  Star,
  X,
  Edit,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Mock data - Replace with API calls
const mockAppointments = [
  {
    id: '1',
    providerName: 'Pawsome Grooming Spa',
    serviceType: 'Full Grooming Package',
    date: '2024-01-25',
    time: '10:00 AM',
    duration: '2 hours',
    petName: 'Max',
    address: '123 Pet Street, City, ST 12345',
    phone: '(555) 123-4567',
    status: 'confirmed',
    providerRating: 4.8,
    price: 75,
    canCancel: true,
    canReschedule: true
  },
  {
    id: '2',
    providerName: 'Happy Tails Daycare',
    serviceType: 'Full Day Daycare',
    date: '2024-01-28',
    time: '8:00 AM',
    duration: '8 hours',
    petName: 'Bella',
    address: '456 Dog Avenue, City, ST 12345',
    phone: '(555) 234-5678',
    status: 'pending',
    providerRating: 4.9,
    price: 50,
    canCancel: true,
    canReschedule: true
  },
  {
    id: '3',
    providerName: 'Pampered Paws',
    serviceType: 'Bath & Brush',
    date: '2024-01-20',
    time: '2:00 PM',
    duration: '1 hour',
    petName: 'Max',
    address: '789 Pet Lane, City, ST 12345',
    phone: '(555) 345-6789',
    status: 'completed',
    providerRating: 4.7,
    price: 45,
    canCancel: false,
    canReschedule: false
  },
  {
    id: '4',
    providerName: 'Furry Friends Care',
    serviceType: 'Nail Trim',
    date: '2024-01-18',
    time: '11:00 AM',
    duration: '30 min',
    petName: 'Bella',
    address: '321 Animal Road, City, ST 12345',
    phone: '(555) 456-7890',
    status: 'completed',
    providerRating: 4.6,
    price: 25,
    canCancel: false,
    canReschedule: false
  },
  {
    id: '5',
    providerName: 'Elite Pet Grooming',
    serviceType: 'Premium Spa Day',
    date: '2024-01-15',
    time: '9:00 AM',
    duration: '3 hours',
    petName: 'Max',
    address: '654 Pet Plaza, City, ST 12345',
    phone: '(555) 567-8901',
    status: 'cancelled',
    providerRating: 4.9,
    price: 120,
    canCancel: false,
    canReschedule: false
  }
];

export default function AppointmentsOwnerScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/owner/appointments', {
      //   headers: { 'Authorization': `Bearer ${userToken}` }
      // });
      // const data = await response.json();
      
      // Simulate API delay
      setTimeout(() => {
        setAppointments(mockAppointments);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error loading appointments:', error);
      setLoading(false);
    }
  };

  const handleCancelAppointment = (appointmentId: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Replace with actual API call
              // await fetch(`/api/appointments/${appointmentId}/cancel`, {
              //   method: 'POST',
              //   headers: { 'Authorization': `Bearer ${userToken}` }
              // });
              
              // Update local state
              setAppointments(prev => 
                prev.map(apt => 
                  apt.id === appointmentId 
                    ? { ...apt, status: 'cancelled', canCancel: false, canReschedule: false }
                    : apt
                )
              );
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const handleRescheduleAppointment = (appointmentId: string) => {
    // TODO: Navigate to reschedule screen or show modal
    Alert.alert('Reschedule', 'Reschedule functionality will navigate to booking screen');
  };

  const handleViewDetails = (appointmentId: string) => {
    // TODO: Navigate to appointment details screen
    // router.push(`/appointment-detail?id=${appointmentId}`);
    Alert.alert('View Details', `Viewing details for appointment ${appointmentId}`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          label: 'Confirmed'
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          label: 'Pending'
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Completed'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          label: 'Cancelled'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          label: status
        };
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'confirmed' || apt.status === 'pending'
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status === 'completed' || apt.status === 'cancelled'
  );

  const displayAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading appointments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">My Appointments</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 py-4 gap-3">
        <TouchableOpacity
          onPress={() => setActiveTab('upcoming')}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === 'upcoming' ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <Text className={`text-center font-semibold ${
            activeTab === 'upcoming' ? 'text-primary-foreground' : 'text-muted-foreground'
          }`}>
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('past')}
          className={`flex-1 py-3 rounded-xl ${
            activeTab === 'past' ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <Text className={`text-center font-semibold ${
            activeTab === 'past' ? 'text-primary-foreground' : 'text-muted-foreground'
          }`}>
            Past ({pastAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Appointments List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, gap: 16 }}>
        {displayAppointments.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Calendar className="text-muted-foreground mb-4" size={64} />
            <Text className="text-xl font-semibold text-foreground mb-2">
              No {activeTab} appointments
            </Text>
            <Text className="text-muted-foreground text-center">
              {activeTab === 'upcoming' 
                ? 'Book a service to see your upcoming appointments here'
                : 'Your completed and cancelled appointments will appear here'
              }
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                onPress={() => router.push('/search-providers')}
                className="bg-primary px-6 py-3 rounded-xl mt-6"
              >
                <Text className="text-primary-foreground font-semibold">Find Services</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          displayAppointments.map((appointment) => {
            const statusConfig = getStatusConfig(appointment.status);
            const StatusIcon = statusConfig.icon;

            return (
              <TouchableOpacity
                key={appointment.id}
                onPress={() => handleViewDetails(appointment.id)}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Status Banner */}
                <View className={`${statusConfig.bg} px-4 py-2 flex-row items-center gap-2`}>
                  <StatusIcon className={statusConfig.color} size={16} />
                  <Text className={`${statusConfig.color} font-semibold text-sm`}>
                    {statusConfig.label}
                  </Text>
                </View>

                <View className="p-4">
                  {/* Provider Info */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {appointment.providerName}
                      </Text>
                      <View className="flex-row items-center gap-1">
                        <Star className="text-yellow-500" size={14} fill="#EAB308" />
                        <Text className="text-muted-foreground text-sm">
                          {appointment.providerRating}
                        </Text>
                      </View>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded-lg">
                      <Text className="text-primary font-semibold">${appointment.price}</Text>
                    </View>
                  </View>

                  {/* Service & Pet */}
                  <View className="flex-row items-center gap-2 mb-3">
                    <PawPrint className="text-primary" size={16} />
                    <Text className="text-foreground font-medium">
                      {appointment.serviceType} • {appointment.petName}
                    </Text>
                  </View>

                  {/* Date & Time */}
                  <View className="flex-row items-center gap-4 mb-3">
                    <View className="flex-row items-center gap-2">
                      <Calendar className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground">{appointment.date}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Clock className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground">
                        {appointment.time} ({appointment.duration})
                      </Text>
                    </View>
                  </View>

                  {/* Location */}
                  <View className="flex-row items-start gap-2 mb-3">
                    <MapPin className="text-muted-foreground mt-1" size={16} />
                    <Text className="text-muted-foreground flex-1">{appointment.address}</Text>
                  </View>

                  {/* Contact */}
                  <View className="flex-row items-center gap-2 mb-4">
                    <Phone className="text-muted-foreground" size={16} />
                    <Text className="text-muted-foreground">{appointment.phone}</Text>
                  </View>

                  {/* Action Buttons */}
                  {(appointment.canCancel || appointment.canReschedule) && (
                    <View className="flex-row gap-3 pt-3 border-t border-border">
                      {appointment.canReschedule && (
                        <TouchableOpacity
                          onPress={() => handleRescheduleAppointment(appointment.id)}
                          className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2"
                        >
                          <Edit className="text-primary-foreground" size={18} />
                          <Text className="text-primary-foreground font-semibold">
                            Reschedule
                          </Text>
                        </TouchableOpacity>
                      )}
                      {appointment.canCancel && (
                        <TouchableOpacity
                          onPress={() => handleCancelAppointment(appointment.id)}
                          className="flex-1 bg-red-50 py-3 rounded-xl flex-row items-center justify-center gap-2"
                        >
                          <X className="text-red-600" size={18} />
                          <Text className="text-red-600 font-semibold">Cancel</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}