import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking } from 'react-native';
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
  FileText
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

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

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    loadAppointmentDetails();
  }, []);

  const loadAppointmentDetails = async () => {
    try {
      // TODO: Replace with actual API call
      // const appointmentId = route.params.id;
      // const response = await fetch(`/api/appointments/${appointmentId}`, {
      //   headers: { 'Authorization': `Bearer ${userToken}` }
      // });
      // const data = await response.json();
      
      // Simulate API delay
      setTimeout(() => {
        setAppointment(mockAppointmentDetail);
        setLoading(false);
      }, 600);
    } catch (error) {
      console.error('Error loading appointment details:', error);
      setLoading(false);
    }
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
          label: 'Pending Confirmation'
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

  const handleCancelAppointment = () => {
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
              // await fetch(`/api/appointments/${appointment.id}/cancel`, {
              //   method: 'POST',
              //   headers: { 'Authorization': `Bearer ${userToken}` }
              // });
              
              Alert.alert('Success', 'Appointment cancelled successfully', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          }
        }
      ]
    );
  };

  const handleReschedule = () => {
    // TODO: Navigate to reschedule screen
    Alert.alert('Reschedule', 'Navigate to booking screen with pre-filled data');
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
    Alert.alert('Message', 'Open messaging interface');
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
          <ThemeToggle />
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
            <Text className={`${statusConfig.color} text-sm mt-1`}>
              Booked on {appointment.appointment.bookingDate}
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
                {appointment.appointment.dayOfWeek}, {appointment.appointment.date}
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
                {appointment.appointment.time} - {appointment.appointment.endTime}
              </Text>
              <Text className="text-muted-foreground text-sm">
                Duration: {appointment.service.duration}
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
                {appointment.service.name}
              </Text>
              <Text className="text-muted-foreground text-sm mt-1">
                {appointment.service.description}
              </Text>
            </View>
          </View>

          <View className="bg-muted p-3 rounded-xl">
            <Text className="text-foreground font-bold text-2xl">
              ${appointment.service.price}
            </Text>
            <Text className="text-muted-foreground text-sm">Service Price</Text>
          </View>
        </View>

        {/* Pet Information Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Pet Information</Text>
          
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Pet Name</Text>
              <Text className="text-foreground font-semibold">{appointment.pet.name}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Breed</Text>
              <Text className="text-foreground font-semibold">{appointment.pet.breed}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Age</Text>
              <Text className="text-foreground font-semibold">{appointment.pet.age}</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Weight</Text>
              <Text className="text-foreground font-semibold">{appointment.pet.weight}</Text>
            </View>
          </View>

          {appointment.pet.specialNotes && (
            <View className="mt-4 bg-yellow-50 p-3 rounded-xl">
              <Text className="text-yellow-800 font-semibold mb-1">Special Notes</Text>
              <Text className="text-yellow-700 text-sm">{appointment.pet.specialNotes}</Text>
            </View>
          )}
        </View>

        {/* Provider Information Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Provider Information</Text>
          
          <View className="flex-row items-center gap-3 mb-4">
            <View className="bg-primary/10 w-14 h-14 rounded-full items-center justify-center">
              <User className="text-primary" size={24} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-bold text-lg">
                {appointment.provider.businessName}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <Star className="text-yellow-500" size={14} fill="#EAB308" />
                <Text className="text-muted-foreground text-sm">
                  {appointment.provider.rating} ({appointment.provider.reviewCount} reviews)
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={() => handleCall(appointment.provider.phone)}
              className="flex-row items-center gap-3 p-3 bg-muted rounded-xl"
            >
              <Phone className="text-primary" size={20} />
              <Text className="text-foreground font-medium flex-1">
                {appointment.provider.phone}
              </Text>
              <Text className="text-primary text-sm">Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleEmail(appointment.provider.email)}
              className="flex-row items-center gap-3 p-3 bg-muted rounded-xl"
            >
              <Mail className="text-primary" size={20} />
              <Text className="text-foreground font-medium flex-1">
                {appointment.provider.email}
              </Text>
              <Text className="text-primary text-sm">Email</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleGetDirections(appointment.provider.address)}
              className="flex-row items-center gap-3 p-3 bg-muted rounded-xl"
            >
              <MapPin className="text-primary" size={20} />
              <Text className="text-foreground font-medium flex-1">
                {appointment.provider.address}
              </Text>
              <Navigation className="text-primary" size={16} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleMessage}
              className="flex-row items-center justify-center gap-2 p-3 bg-primary rounded-xl"
            >
              <MessageCircle className="text-primary-foreground" size={20} />
              <Text className="text-primary-foreground font-semibold">
                Send Message
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Information Card */}
        <View className="mx-6 mt-4 bg-card rounded-2xl border border-border p-5">
          <Text className="text-foreground font-bold text-lg mb-4">Payment Information</Text>
          
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Service Price</Text>
              <Text className="text-foreground font-semibold">
                ${appointment.payment.amount.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted-foreground">Service Fee</Text>
              <Text className="text-foreground font-semibold">
                ${appointment.payment.serviceFee.toFixed(2)}
              </Text>
            </View>
            <View className="h-px bg-border" />
            <View className="flex-row items-center justify-between">
              <Text className="text-foreground font-bold text-lg">Total</Text>
              <Text className="text-foreground font-bold text-xl">
                ${appointment.payment.total.toFixed(2)}
              </Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center gap-2 p-3 bg-muted rounded-xl">
            <CreditCard className="text-muted-foreground" size={20} />
            <Text className="text-foreground">
              {appointment.payment.method} • {appointment.payment.status === 'pending' ? 'Payment due at service' : 'Paid'}
            </Text>
          </View>
        </View>

        {/* Booking Reference */}
        <View className="mx-6 mt-4 mb-4 bg-muted p-4 rounded-xl flex-row items-center gap-3">
          <FileText className="text-muted-foreground" size={20} />
          <View className="flex-1">
            <Text className="text-muted-foreground text-sm">Booking Reference</Text>
            <Text className="text-foreground font-mono font-bold">#{appointment.id.toUpperCase()}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      {(appointment.canCancel || appointment.canReschedule) && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-6">
          <View className="flex-row gap-3">
            {appointment.canReschedule && (
              <TouchableOpacity
                onPress={handleReschedule}
                className="flex-1 bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Edit className="text-primary-foreground" size={20} />
                <Text className="text-primary-foreground font-bold">Reschedule</Text>
              </TouchableOpacity>
            )}
            {appointment.canCancel && (
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