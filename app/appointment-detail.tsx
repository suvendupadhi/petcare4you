import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking, Platform } from 'react-native';
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
  XCircle,
  Mail,
  DollarSign,
  User,
  MessageCircle,
  Navigation,
  CreditCard,
  FileText,
  LogOut
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { authService, appointmentService, Appointment, paymentService } from '@/services/petCareService';
import { APPOINTMENT_STATUS, PAYMENT_STATUS } from '@/constants/status';

/*
// Mock data - Replace with API calls
const mockAppointmentDetail = {
  id: '1',
  status: 'confirmed',
  
  // Provider Info
  provider: {
    id: 'p1',
    businessName: 'Pawsome Grooming Spa',
    ownerName: 'Sarah Johnson',
    phone: '(555) 123-4567',
    email: 'contact@pawsomegrooming.com',
    address: '123 Pet Street, City, ST 12345',
    rating: 4.8,
    reviewCount: 234,
    photo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400'
  },
  
  // Pet Owner Info (for provider view)
  owner: {
    name: 'John Smith',
    phone: '(555) 987-6543',
    email: 'john.smith@email.com'
  },
  
  // Service Details
  service: {
    name: 'Full Grooming Package',
    description: 'Complete grooming service including bath, haircut, nail trim, and ear cleaning',
    duration: '2 hours',
    price: 75
  },
  
  // Pet Details
  pet: {
    name: 'Max',
    breed: 'Golden Retriever',
    age: '3 years',
    weight: '65 lbs',
    specialNotes: 'Nervous around loud noises, prefers gentle handling'
  },
  
  // Appointment Details
  appointment: {
    date: '2024-01-25',
    dayOfWeek: 'Thursday',
    time: '10:00 AM',
    endTime: '12:00 PM',
    bookingDate: '2024-01-18'
  },
  
  // Payment Info
  payment: {
    status: 'pending',
    method: 'Credit Card',
    amount: 75,
    serviceFee: 3.75,
    total: 78.75
  },
  
  // Actions
  canCancel: true,
  canReschedule: true,
  canContact: true
};
*/

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (id) {
      loadAppointmentDetails();
    }
  }, [id]);

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

  const loadAppointmentDetails = async () => {
    try {
      const data = await appointmentService.getAppointment(Number(id));
      setAppointment(data);
    } catch (error) {
      console.error('Error loading appointment details:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to load appointment details');
      } else {
        Alert.alert('Error', 'Failed to load appointment details');
      }
    } finally {
      setLoading(false);
    }
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
          label: 'Pending Confirmation'
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

  const handleCancelAppointment = () => {
    const cancelAction = async () => {
      try {
        if (appointment) {
          await appointmentService.updateStatus(appointment.id, APPOINTMENT_STATUS.CANCELLED);
          
          if (Platform.OS === 'web') {
            window.alert('Success: Appointment cancelled successfully');
            router.back();
          } else {
            Alert.alert('Success', 'Appointment cancelled successfully', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        }
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Error: Failed to cancel appointment');
        } else {
          Alert.alert('Error', 'Failed to cancel appointment');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to cancel this appointment? This action cannot be undone.')) {
        cancelAction();
      }
    } else {
      Alert.alert(
        'Cancel Appointment',
        'Are you sure you want to cancel this appointment? This action cannot be undone.',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: cancelAction
          }
        ]
      );
    }
  };

  const handleReschedule = () => {
    if (appointment && appointment.providerId) {
      router.push(`/provider-detail?id=${appointment.providerId}&rescheduleId=${appointment.id}`);
    } else {
      if (Platform.OS === 'web') {
        window.alert('Error: Could not find provider information for this appointment');
      } else {
        Alert.alert('Error', 'Could not find provider information for this appointment');
      }
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleGetDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const handleMessage = () => {
    // TODO: Open messaging interface
    if (Platform.OS === 'web') {
      window.alert('Message: Open messaging interface');
    } else {
      Alert.alert('Message', 'Open messaging interface');
    }
  };

  const handlePay = async () => {
    if (!appointment) return;
    
    try {
      setLoading(true);
      await paymentService.createPayment({
        appointmentId: appointment.id,
        amount: appointment.totalPrice,
        paymentMethod: 'Credit Card',
        status: PAYMENT_STATUS.COMPLETED,
        transactionId: `TRX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      
      if (Platform.OS === 'web') {
        window.alert('Success: Payment processed successfully');
        loadAppointmentDetails();
      } else {
        Alert.alert('Success', 'Payment processed successfully', [
          { text: 'OK', onPress: () => loadAppointmentDetails() }
        ]);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to process payment');
      } else {
        Alert.alert('Error', 'Failed to process payment');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading details...</Text>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AlertCircle className="text-muted-foreground mb-4" size={48} />
        <Text className="text-foreground text-lg font-semibold">Appointment not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const statusConfig = getStatusConfig(appointment.status);
  const StatusIcon = statusConfig.icon;

  const canCancel = appointment.status === APPOINTMENT_STATUS.PENDING || appointment.status === APPOINTMENT_STATUS.CONFIRMED;
  const canReschedule = appointment.status === APPOINTMENT_STATUS.PENDING;
  const isPaid = appointment.payment && appointment.payment.status === PAYMENT_STATUS.COMPLETED;

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 py-4 border-b border-border">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Appointment Details</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <ThemeToggle />
            <TouchableOpacity onPress={handleLogout}>
              <LogOut className="text-destructive" size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Status Banner */}
        <View className={`${statusConfig.bg} mx-6 mt-6 p-4 rounded-xl flex-row items-center gap-3`}>
          <StatusIcon className={statusConfig.color} size={24} />
          <View className="flex-1">
            <Text className={`${statusConfig.color} font-bold text-lg`}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Date & Time Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Date & Time</Text>
          
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-primary/10 p-3 rounded-xl">
              <Calendar className="text-primary" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                {new Date(appointment.appointmentDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
              <Text className="text-muted-foreground text-sm">Appointment Date</Text>
            </View>
          </View>

          <View className="flex-row items-center gap-3">
            <View className="bg-primary/10 p-3 rounded-xl">
              <Clock className="text-primary" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                {new Date(appointment.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Details Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Service Details</Text>
          
          <View className="flex-row items-center gap-3 mb-3">
            <View className="bg-primary/10 p-3 rounded-xl">
              <PawPrint className="text-primary" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold">
                {appointment.provider?.serviceType || 'Service'}
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {appointment.description}
              </Text>
            </View>
          </View>

          <View className="bg-muted p-3 rounded-xl">
            <Text className="text-foreground font-bold text-2xl">
              ${appointment.totalPrice}
            </Text>
            <Text className="text-muted-foreground text-sm">Total Price</Text>
          </View>
        </View>

        {/* Pet Information Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Pet Information</Text>
          
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Pet Name</Text>
              <Text className="text-foreground font-semibold">{appointment.pet?.name || appointment.petName}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Pet Type</Text>
              <Text className="text-foreground font-semibold">{appointment.pet?.petType?.name || appointment.petType}</Text>
            </View>
            {appointment.pet?.breed?.name && (
              <View className="flex-row items-center justify-between">
                <Text className="text-muted-foreground">Breed</Text>
                <Text className="text-foreground font-semibold">{appointment.pet.breed.name}</Text>
              </View>
            )}
            {appointment.description && (
              <View className="mt-2 p-3 bg-muted rounded-xl">
                <Text className="text-muted-foreground text-xs mb-1">Special Notes</Text>
                <Text className="text-foreground text-sm">{appointment.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Provider Information Card */}
        {appointment.provider && (
          <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
            <Text className="text-foreground font-bold text-lg mb-4">Provider Information</Text>
            
            <View className="flex-row items-center gap-3 mb-4">
              <View className="bg-primary/10 w-14 h-14 rounded-full items-center justify-center">
                <User className="text-primary" size={24} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-lg">
                  {appointment.provider.companyName}
                </Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <Star className="text-yellow-500" size={14} fill="#EAB308" />
                  <Text className="text-muted-foreground text-sm">
                    4.8 (124 reviews)
                  </Text>
                </View>
              </View>
            </View>

            <View className="flex-row items-center gap-3 p-3 bg-muted rounded-xl mb-3">
              <MapPin className="text-primary" size={20} />
              <Text className="text-foreground font-medium flex-1">
                {appointment.provider.address}, {appointment.provider.city}
              </Text>
            </View>

            {/* Contact Actions */}
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => handleCall(appointment.provider?.user?.phoneNumber || '')}
                className="flex-row items-center gap-3 p-3 bg-muted rounded-xl"
              >
                <Phone className="text-primary" size={20} />
                <Text className="text-foreground font-medium flex-1">
                  {appointment.provider?.user?.phoneNumber || 'N/A'}
                </Text>
                <Text className="text-primary text-sm">Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEmail(appointment.provider?.user?.email || '')}
                className="flex-row items-center gap-3 p-3 bg-muted rounded-xl"
              >
                <Mail className="text-primary" size={20} />
                <Text className="text-foreground font-medium flex-1">
                  {appointment.provider?.user?.email || 'N/A'}
                </Text>
                <Text className="text-primary text-sm">Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Payment Information Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Payment Information</Text>
          
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Service Price</Text>
              <Text className="text-foreground font-semibold">
                ${(appointment.totalPrice || 0).toFixed(2)}
              </Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-bold text-lg">Total</Text>
              <Text className="text-foreground font-bold text-xl">
                ${(appointment.totalPrice || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center gap-2 p-3 bg-muted rounded-xl">
            <CreditCard className="text-muted-foreground" size={20} />
            <Text className="text-foreground">
              {isPaid ? 'Paid' : 'Payment Pending'} • {appointment.payment?.paymentMethod || 'Credit Card'}
            </Text>
          </View>
        </View>

        {/* Booking Reference */}
        <View className="mx-6 mt-4 mb-4 bg-muted p-4 rounded-xl flex-row items-center gap-3">
          <FileText className="text-muted-foreground" size={20} />
          <View className="flex-1">
            <Text className="text-muted-foreground text-sm">Booking Reference</Text>
            <Text className="text-foreground font-mono font-bold">#{appointment.id}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      {(canCancel || canReschedule || (!isPaid && appointment.status === 'confirmed')) && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-6">
          <View className="flex-row gap-3">
            {!isPaid && appointment.status === 'confirmed' && (
              <TouchableOpacity
                onPress={handlePay}
                className="flex-1 bg-green-600 py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <DollarSign className="text-white" size={20} />
                <Text className="text-white font-bold">Pay Now</Text>
              </TouchableOpacity>
            )}
            {canReschedule && (
              <TouchableOpacity
                onPress={handleReschedule}
                className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Edit className="text-primary-foreground" size={20} />
                <Text className="text-primary-foreground font-bold">Reschedule</Text>
              </TouchableOpacity>
            )}
            {canCancel && (
              <TouchableOpacity
                onPress={handleCancelAppointment}
                className="flex-1 bg-red-50 py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <X className="text-red-600" size={20} />
                <Text className="text-red-600 font-bold">Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}