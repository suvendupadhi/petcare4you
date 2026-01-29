import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  ChevronLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Clock,
  DollarSign,
  Calendar,
  Scissors,
  Home as HomeIcon,
  Check,
  ChevronRight
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { providerService, appointmentService, availabilityService, Provider, Availability } from '@/services/petCareService';

const { width } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [showBooking, setShowBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadProviderData();
    }
  }, [id]);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const [providerData, availabilityData] = await Promise.all([
        providerService.getProvider(Number(id)),
        availabilityService.getProviderAvailability(Number(id))
      ]);
      setProvider(providerData);
      setAvailabilities(availabilityData);
      // Automatically select the provider's service type
      setSelectedService(providerData.serviceType);
    } catch (error) {
      console.error('Error loading provider data:', error);
      Alert.alert('Error', 'Failed to load provider details');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for things not yet in backend
  const photos = [
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
  ];

  const reviews = [
    {
      id: '1',
      userName: 'Sarah M.',
      rating: 5,
      date: 'March 15, 2024',
      comment: 'Amazing service! My golden retriever always looks fantastic. The staff is so gentle and caring.'
    },
    {
      id: '2',
      userName: 'Mike T.',
      rating: 5,
      date: 'March 10, 2024',
      comment: 'Best groomer in town! Very professional and my dog actually enjoys going there.'
    }
  ];

  const availableDates = Array.from(new Set(availabilities.map(a => a.date.split('T')[0])))
    .sort()
    .map(dateStr => {
      const date = new Date(dateStr);
      return {
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate().toString()
      };
    });

  const timeSlots = availabilities
    .filter(a => a.date.split('T')[0] === selectedDate)
    .map(a => ({
      id: a.id?.toString() || a.startTime,
      time: a.startTime.split('T')[1].substring(0, 5),
      label: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      available: !a.isBooked
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select a date and time');
      return;
    }

    if (!provider) return;

    setIsSubmitting(true);
    try {
      // Find the selected availability slot to get the correct end time if available
      const selectedSlot = availabilities.find(a => 
        a.date.split('T')[0] === selectedDate && 
        a.startTime.split('T')[1].substring(0, 5) === selectedTime
      );

      const startTime = selectedSlot ? selectedSlot.startTime : `${selectedDate}T${selectedTime}:00`;
      const endTime = selectedSlot ? selectedSlot.endTime : `${selectedDate}T${(parseInt(selectedTime.split(':')[0]) + 1).toString().padStart(2, '0')}:00`;

      const appointmentData = {
        providerId: provider.id,
        appointmentDate: selectedDate,
        startTime: startTime,
        endTime: endTime,
        petName: 'Max', // Mock pet name for now
        petType: 'Dog',
        description: `Booking for ${provider.serviceType}`,
        totalPrice: provider.hourlyRate,
        status: 'pending'
      };

      await appointmentService.createAppointment(appointmentData);
      
      Alert.alert('Success', 'Appointment booked successfully!', [
        { text: 'OK', onPress: () => router.push('/owner-dashboard') }
      ]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading provider details...</Text>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Provider not found</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">Provider Details</Text>
          <ThemeToggle />
        </View>

        {/* Photo Gallery */}
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={{ width, height: 250 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Business Info */}
        <View className="p-6">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-foreground mb-1">
                {provider.companyName}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center">
                  <Star className="text-yellow-500" size={18} fill="#EAB308" />
                  <Text className="text-foreground font-semibold ml-1">
                    4.8
                  </Text>
                  <Text className="text-muted-foreground ml-1">
                    (127 reviews)
                  </Text>
                </View>
                <View className="bg-green-500/20 px-2 py-1 rounded">
                  <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
                    Licensed
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Service Tags */}
          <View className="flex-row gap-2 mb-4">
            <View className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
              {provider.serviceType.toLowerCase().includes('grooming') ? (
                <Scissors className="text-primary" size={14} />
              ) : (
                <HomeIcon className="text-primary" size={14} />
              )}
              <Text className="text-primary text-sm font-medium">{provider.serviceType}</Text>
            </View>
          </View>

          {/* Contact Info */}
          <View className="bg-card border border-border rounded-xl p-4 gap-3 mb-4">
            <View className="flex-row items-center gap-3">
              <MapPin className="text-muted-foreground" size={20} />
              <Text className="text-foreground flex-1">{provider.address}, {provider.city}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Phone className="text-muted-foreground" size={20} />
              <Text className="text-foreground">{provider.user?.email || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Globe className="text-muted-foreground" size={20} />
              <Text className="text-primary">www.{provider.companyName.toLowerCase().replace(/\s/g, '')}.com</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Clock className="text-muted-foreground" size={20} />
              <Text className="text-foreground">Mon-Sat: 8:00 AM - 6:00 PM</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">About</Text>
            <Text className="text-muted-foreground leading-6">
              {provider.description}
            </Text>
          </View>

          {/* Pricing Info */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Service & Pricing</Text>
            <TouchableOpacity
              onPress={() => setShowBooking(true)}
              className={`bg-card border-2 rounded-xl p-4 ${
                selectedService ? 'border-primary' : 'border-border'
              }`}
            >
              <View className="flex-row items-start justify-between mb-2">
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base mb-1">
                    {provider.serviceType}
                  </Text>
                  <Text className="text-muted-foreground text-sm mb-2">
                    Professional {provider.serviceType.toLowerCase()} service
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <Clock className="text-muted-foreground" size={14} />
                      <Text className="text-muted-foreground text-sm">1 hour</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <DollarSign className="text-primary" size={14} />
                      <Text className="text-primary font-bold">${provider.hourlyRate}/hr</Text>
                    </View>
                  </View>
                </View>
                {selectedService && (
                  <View className="bg-primary rounded-full p-1">
                    <Check className="text-primary-foreground" size={16} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Booking Section */}
          {showBooking && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">Select Date & Time</Text>
              
              {/* Date Selection */}
              <Text className="text-sm font-semibold text-foreground mb-2">Available Dates</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 8, gap: 8 }}
                className="mb-4"
              >
                {availableDates.map((dateItem) => (
                  <TouchableOpacity
                    key={dateItem.date}
                    onPress={() => setSelectedDate(dateItem.date)}
                    className={`border-2 rounded-xl px-4 py-3 items-center min-w-[70px] ${
                      selectedDate === dateItem.date 
                        ? 'bg-primary border-primary' 
                        : 'bg-card border-border'
                    }`}
                  >
                    <Text className={`text-xs font-medium mb-1 ${
                      selectedDate === dateItem.date ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {dateItem.dayName}
                    </Text>
                    <Text className={`text-xl font-bold ${
                      selectedDate === dateItem.date ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {dateItem.dayNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Time Selection */}
              {selectedDate && (
                <>
                  <Text className="text-sm font-semibold text-foreground mb-2">Available Times</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {timeSlots.map((slot) => (
                      <TouchableOpacity
                        key={slot.id}
                        disabled={!slot.available}
                        onPress={() => setSelectedTime(slot.time)}
                        className={`border-2 rounded-lg px-4 py-2.5 ${
                          !slot.available
                            ? 'bg-muted border-border opacity-40'
                            : selectedTime === slot.time
                            ? 'bg-primary border-primary'
                            : 'bg-card border-border'
                        }`}
                      >
                        <Text className={`font-medium ${
                          !slot.available
                            ? 'text-muted-foreground line-through'
                            : selectedTime === slot.time
                            ? 'text-primary-foreground'
                            : 'text-foreground'
                        }`}>
                          {slot.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Reviews */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Reviews</Text>
              <TouchableOpacity className="flex-row items-center gap-1">
                <Text className="text-primary font-medium">See All</Text>
                <ChevronRight className="text-primary" size={16} />
              </TouchableOpacity>
            </View>
            <View className="gap-3">
              {reviews.map((review) => (
                <View key={review.id} className="bg-card border border-border rounded-xl p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-foreground font-semibold">{review.userName}</Text>
                    <View className="flex-row items-center gap-1">
                      <Star className="text-yellow-500" size={14} fill="#EAB308" />
                      <Text className="text-foreground font-medium">{review.rating}</Text>
                    </View>
                  </View>
                  <Text className="text-muted-foreground text-xs mb-2">{review.date}</Text>
                  <Text className="text-foreground leading-5">{review.comment}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      {selectedService && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t border-border">
          <TouchableOpacity
            onPress={handleBooking}
            disabled={isSubmitting || !selectedDate || !selectedTime}
            className={`py-4 rounded-xl items-center justify-center ${
              isSubmitting || !selectedDate || !selectedTime ? 'bg-muted' : 'bg-primary'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-primary-foreground font-bold text-lg">
                Confirm Booking
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
