import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  PawPrint,
  Phone,
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  XCircle,
  Mail,
  Check
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { appointmentService, Appointment } from '@/services/petCareService';
import { APPOINTMENT_STATUS } from '@/constants/status';

export default function AppointmentsProviderScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getProviderAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error loading appointments:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to load appointments');
      } else {
        Alert.alert('Error', 'Failed to load appointments');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appointmentId: number, newStatus: number) => {
    try {
      await appointmentService.updateStatus(appointmentId, newStatus);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus }
            : apt
        )
      );
      if (Platform.OS === 'web') {
        window.alert(`Success: Appointment updated successfully`);
      } else {
        Alert.alert('Success', `Appointment updated successfully`);
      }
    } catch (error) {
      if (Platform.OS === 'web') {
        window.alert(`Error: Failed to update appointment status`);
      } else {
        Alert.alert('Error', `Failed to update appointment status`);
      }
    }
  };

  const handleViewDetails = (appointmentId: number) => {
    router.push({
      pathname: '/appointment-detail',
      params: { id: appointmentId }
    });
  };

  const getStatusConfig = (status: number) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50',
          label: 'Confirmed'
        };
      case APPOINTMENT_STATUS.PENDING:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          label: 'Pending'
        };
      case APPOINTMENT_STATUS.COMPLETED:
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          label: 'Completed'
        };
      case APPOINTMENT_STATUS.CANCELLED:
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
          label: 'Unknown'
        };
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === APPOINTMENT_STATUS.CONFIRMED || apt.status === APPOINTMENT_STATUS.PENDING
  );
  
  const pastAppointments = appointments.filter(apt => 
    apt.status === APPOINTMENT_STATUS.COMPLETED || apt.status === APPOINTMENT_STATUS.CANCELLED
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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return timeString;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeString;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-foreground">Client Bookings</Text>
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
              No {activeTab} bookings
            </Text>
            <Text className="text-muted-foreground text-center">
              {activeTab === 'upcoming' 
                ? 'When clients book your services, they will appear here'
                : 'Your completed and cancelled bookings will appear here'
              }
            </Text>
          </View>
        ) : (
          displayAppointments.map((appointment) => {
            const statusConfig = getStatusConfig(appointment.status);
            const StatusIcon = statusConfig.icon;
            const isPending = appointment.status === APPOINTMENT_STATUS.PENDING;
            const isConfirmed = appointment.status === APPOINTMENT_STATUS.CONFIRMED;

            return (
              <TouchableOpacity
                key={appointment.id}
                onPress={() => handleViewDetails(appointment.id)}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                {/* Status Banner */}
                <View className={`${statusConfig.bg} px-4 py-2 flex-row items-center justify-between`}>
                  <View className="flex-row items-center gap-2">
                    <StatusIcon className={statusConfig.color} size={16} />
                    <Text className={`${statusConfig.color} font-semibold text-sm`}>
                      {statusConfig.label}
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-xs font-medium">ID: #{appointment.id}</Text>
                </View>

                <View className="p-4">
                  {/* Client Info */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-foreground mb-1">
                        {appointment.owner?.firstName} {appointment.owner?.lastName}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <PawPrint className="text-primary" size={14} />
                        <Text className="text-muted-foreground text-sm font-medium">
                          {appointment.petName} ({appointment.petType})
                        </Text>
                      </View>
                    </View>
                    <View className="bg-primary/10 px-3 py-1 rounded-lg">
                      <Text className="text-primary font-semibold">${appointment.totalPrice}</Text>
                    </View>
                  </View>

                  <View className="h-px bg-border my-2" />

                  {/* Date & Time */}
                  <View className="flex-row items-center gap-4 mb-3">
                    <View className="flex-row items-center gap-2">
                      <Calendar className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground font-medium">{formatDate(appointment.appointmentDate)}</Text>
                    </View>
                    <View className="bg-primary/5 border border-primary/20 px-3 py-1 rounded-lg flex-row items-center gap-2">
                      <Clock className="text-primary" size={14} />
                      <Text className="text-primary font-bold text-xs">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </Text>
                    </View>
                  </View>

                  {/* Contact Info */}
                  <View className="flex-row items-center gap-4 mb-4">
                    <View className="flex-row items-center gap-2">
                      <Mail className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground text-sm">{appointment.owner?.email || 'N/A'}</Text>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  {activeTab === 'upcoming' && (
                    <View className="flex-row gap-3 pt-3 border-t border-border">
                      {isPending && (
                        <>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(appointment.id, APPOINTMENT_STATUS.CONFIRMED);
                            }}
                            className="flex-1 bg-primary py-3 rounded-xl flex-row items-center justify-center gap-2"
                          >
                            <Check className="text-primary-foreground" size={18} />
                            <Text className="text-primary-foreground font-semibold">Confirm</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED);
                            }}
                            className="flex-1 bg-muted py-3 rounded-xl flex-row items-center justify-center gap-2"
                          >
                            <XCircle className="text-muted-foreground" size={18} />
                            <Text className="text-muted-foreground font-semibold">Decline</Text>
                          </TouchableOpacity>
                        </>
                      )}
                      {isConfirmed && (
                        <>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(appointment.id, APPOINTMENT_STATUS.COMPLETED);
                            }}
                            className="flex-1 bg-green-600 py-3 rounded-xl flex-row items-center justify-center gap-2"
                          >
                            <CheckCircle className="text-white" size={18} />
                            <Text className="text-white font-semibold">Complete</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleUpdateStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED);
                            }}
                            className="flex-1 bg-muted py-3 rounded-xl flex-row items-center justify-center gap-2"
                          >
                            <XCircle className="text-muted-foreground" size={18} />
                            <Text className="text-muted-foreground font-semibold">Cancel</Text>
                          </TouchableOpacity>
                        </>
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
