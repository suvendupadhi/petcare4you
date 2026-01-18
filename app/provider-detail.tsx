import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native';
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
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Service {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export default function ProviderDetailScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [showBooking, setShowBooking] = useState(false);

  // TODO: Fetch from API - GET /api/providers/:id
  const provider = {
    id: '1',
    businessName: 'Paws & Claws Grooming',
    rating: 4.8,
    reviewCount: 127,
    isLicensed: true,
    address: '123 Main Street, Springfield, IL 62701',
    phone: '(555) 123-4567',
    website: 'www.pawsandclaws.com',
    description: 'Professional pet grooming services with over 10 years of experience. We specialize in breed-specific cuts, spa treatments, and gentle handling for anxious pets.',
    services: ['Grooming', 'Daycare'],
    businessHours: 'Mon-Sat: 8:00 AM - 6:00 PM',
    photos: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    ]
  };

  const services: Service[] = [
    {
      id: '1',
      name: 'Full Grooming',
      description: 'Bath, haircut, nail trim, ear cleaning',
      duration: '2 hours',
      price: '$65'
    },
    {
      id: '2',
      name: 'Bath & Brush',
      description: 'Bath, brush, nail trim',
      duration: '1 hour',
      price: '$45'
    },
    {
      id: '3',
      name: 'Nail Trim Only',
      description: 'Quick nail trimming service',
      duration: '15 min',
      price: '$15'
    },
    {
      id: '4',
      name: 'Full Day Daycare',
      description: 'Supervised play and socialization',
      duration: '8 hours',
      price: '$35'
    }
  ];

  const reviews: Review[] = [
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
    },
    {
      id: '3',
      userName: 'Jennifer L.',
      rating: 4,
      date: 'March 5, 2024',
      comment: 'Great experience overall. A bit pricey but worth it for the quality of service.'
    }
  ];

  // TODO: Fetch available dates from API
  const availableDates = [
    { date: '2024-03-20', dayName: 'Wed', dayNum: '20' },
    { date: '2024-03-21', dayName: 'Thu', dayNum: '21' },
    { date: '2024-03-22', dayName: 'Fri', dayNum: '22' },
    { date: '2024-03-23', dayName: 'Sat', dayNum: '23' },
    { date: '2024-03-25', dayName: 'Mon', dayNum: '25' },
  ];

  // TODO: Fetch time slots based on selected date
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '9:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '1:00 PM', available: true },
    { id: '5', time: '2:00 PM', available: true },
    { id: '6', time: '3:00 PM', available: true },
    { id: '7', time: '4:00 PM', available: false },
  ];

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please select a service, date, and time');
      return;
    }

    // TODO: POST /api/bookings
    // Body: { providerId, serviceId, date, time, petId }
    console.log('Booking:', { selectedService, selectedDate, selectedTime });
    
    // Show success and navigate
    alert('Booking confirmed! You will receive a confirmation email shortly.');
    router.push('/owner-dashboard');
  };

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
          {provider.photos.map((photo, index) => (
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
                {provider.businessName}
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-row items-center">
                  <Star className="text-yellow-500" size={18} fill="#EAB308" />
                  <Text className="text-foreground font-semibold ml-1">
                    {provider.rating}
                  </Text>
                  <Text className="text-muted-foreground ml-1">
                    ({provider.reviewCount} reviews)
                  </Text>
                </View>
                {provider.isLicensed && (
                  <View className="bg-green-500/20 px-2 py-1 rounded">
                    <Text className="text-green-600 dark:text-green-400 text-xs font-semibold">
                      Licensed
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Service Tags */}
          <View className="flex-row gap-2 mb-4">
            {provider.services.map((service, index) => (
              <View key={index} className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                {service === 'Grooming' ? (
                  <Scissors className="text-primary" size={14} />
                ) : (
                  <HomeIcon className="text-primary" size={14} />
                )}
                <Text className="text-primary text-sm font-medium">{service}</Text>
              </View>
            ))}
          </View>

          {/* Contact Info */}
          <View className="bg-card border border-border rounded-xl p-4 gap-3 mb-4">
            <View className="flex-row items-center gap-3">
              <MapPin className="text-muted-foreground" size={20} />
              <Text className="text-foreground flex-1">{provider.address}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Phone className="text-muted-foreground" size={20} />
              <Text className="text-foreground">{provider.phone}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Globe className="text-muted-foreground" size={20} />
              <Text className="text-primary">{provider.website}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Clock className="text-muted-foreground" size={20} />
              <Text className="text-foreground">{provider.businessHours}</Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">About</Text>
            <Text className="text-muted-foreground leading-6">
              {provider.description}
            </Text>
          </View>

          {/* Services */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Services & Pricing</Text>
            <View className="gap-3">
              {services.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => {
                    setSelectedService(service.id);
                    setShowBooking(true);
                  }}
                  className={`bg-card border-2 rounded-xl p-4 ${
                    selectedService === service.id ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View className="flex-row items-start justify-between mb-2">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">
                        {service.name}
                      </Text>
                      <Text className="text-muted-foreground text-sm mb-2">
                        {service.description}
                      </Text>
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                          <Clock className="text-muted-foreground" size={14} />
                          <Text className="text-muted-foreground text-sm">{service.duration}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <DollarSign className="text-primary" size={14} />
                          <Text className="text-primary font-bold">{service.price}</Text>
                        </View>
                      </View>
                    </View>
                    {selectedService === service.id && (
                      <View className="bg-primary rounded-full p-1">
                        <Check className="text-primary-foreground" size={16} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
                          {slot.time}
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

      {/* Fixed Bottom Booking Button */}
      {showBooking && (
        <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <TouchableOpacity
            onPress={handleBooking}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2"
          >
            <Calendar className="text-primary-foreground" size={20} />
            <Text className="text-primary-foreground font-bold text-base">
              Confirm Booking
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}