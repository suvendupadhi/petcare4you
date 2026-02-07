import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Dimensions, ActivityIndicator, Alert, TextInput, Platform } from 'react-native';
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
  Calendar as CalendarIcon,
  Scissors,
  Home as HomeIcon,
  Check,
  ChevronRight,
  LogOut,
  Heart
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  providerService, 
  appointmentService, 
  availabilityService, 
  petService, 
  authService, 
  providerPhotoService,
  savedProviderService,
  Provider, 
  Availability, 
  Appointment, 
  Pet, 
  PetType, 
  Breed,
  ProviderPhoto
} from '@/services/petCareService';
import { APPOINTMENT_STATUS } from '@/constants/status';
import { Calendar } from 'react-native-calendars';
import { format } from 'date-fns';
import { useColorScheme } from 'react-native';

const { width } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { id, rescheduleId } = useLocalSearchParams();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [myPets, setMyPets] = useState<Pet[]>([]);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [photos, setPhotos] = useState<ProviderPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [petName, setPetName] = useState<string>('');
  const [petType, setPetType] = useState<string>('Dog');
  const [selectedPetTypeId, setSelectedPetTypeId] = useState<number | null>(null);
  const [selectedBreedId, setSelectedBreedId] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('');
  const [showBooking, setShowBooking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (id) {
      loadProviderData();
      checkIfSaved();
    }
  }, [id]);

  const checkIfSaved = async () => {
    try {
      const saved = await savedProviderService.isProviderSaved(Number(id));
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if provider is saved:', error);
    }
  };

  const toggleSaveProvider = async () => {
    try {
      if (isSaved) {
        await savedProviderService.unsaveProvider(Number(id));
        setIsSaved(false);
      } else {
        await savedProviderService.saveProvider(Number(id));
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save provider:', error);
      Alert.alert('Error', 'Failed to update saved providers');
    }
  };

  useEffect(() => {
    if (rescheduleId) {
      loadAppointmentForReschedule();
    }
  }, [rescheduleId]);

  useEffect(() => {
    if (selectedPetTypeId) {
      loadBreeds(selectedPetTypeId);
    }
  }, [selectedPetTypeId]);

  const loadBreeds = async (typeId: number) => {
    try {
      const breedData = await petService.getBreeds(typeId);
      setBreeds(breedData);
    } catch (error) {
      console.error('Error loading breeds:', error);
    }
  };

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const [providerData, availabilityData, petsData, typesData, photoData] = await Promise.all([
        providerService.getProvider(Number(id)),
        availabilityService.getProviderAvailability(Number(id)),
        petService.getMyPets(),
        petService.getPetTypes(),
        providerPhotoService.getProviderPhotos(Number(id))
      ]);
      setProvider(providerData);
      setAvailabilities(availabilityData);
      setMyPets(petsData);
      setPetTypes(typesData);
      setPhotos(photoData);

      if (petsData.length > 0) {
        setSelectedPetId(petsData[0].id);
      }
      
      if (providerData.serviceTypes && providerData.serviceTypes.length > 0) {
        setSelectedService(providerData.serviceTypes[0].name);
      } else {
        setSelectedService('General Service');
      }
      
      setShowBooking(true);
      
      // Select first available date by default if exists
      const firstAvailableDate = availabilityData.find(a => !a.isBooked)?.date.split('T')[0];
      if (firstAvailableDate) {
        setSelectedDate(firstAvailableDate);
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
      if (Platform.OS === 'web') {
        window.alert('Failed to load provider details');
      } else {
        Alert.alert('Error', 'Failed to load provider details');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAppointmentForReschedule = async () => {
    try {
      const apt = await appointmentService.getAppointment(Number(rescheduleId));
      if (apt) {
        setSelectedPetId(apt.petId || null);
        setPetName(apt.petName);
        setPetType(apt.petType);
        setDescription(apt.description);
        setShowBooking(true);
        
        // Pre-select the original appointment date if it's available
        const originalDate = apt.appointmentDate.split('T')[0];
        const isDateAvailable = availabilities.some(a => a.date.split('T')[0] === originalDate && !a.isBooked);
        if (isDateAvailable) {
          setSelectedDate(originalDate);
        }
      }
    } catch (error) {
      console.error('Error loading appointment for reschedule:', error);
    }
  };

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

  const availableDates = availabilities.reduce((acc: any, curr) => {
    const dateStr = curr.date.split('T')[0];
    if (!curr.isBooked && !acc[dateStr]) {
      acc[dateStr] = { marked: true, dotColor: '#2563eb' };
    }
    return acc;
  }, {});

  const timeSlots = availabilities
    .filter(a => a.date.split('T')[0] === selectedDate && !a.isBooked)
    .map(a => ({
      id: a.id?.toString() || a.startTime,
      time: a.startTime.split('T')[1].substring(0, 5),
      label: new Date(a.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      available: !a.isBooked
    }))
    .sort((a, b) => a.time.localeCompare(b.time));

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please select a date and time');
      } else {
        Alert.alert('Error', 'Please select a date and time');
      }
      return;
    }

    if (!petName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Error: Please enter your pet\'s name');
      } else {
        Alert.alert('Error', 'Please enter your pet\'s name');
      }
      return;
    }

    if (!provider) return;

    setIsSubmitting(true);
    try {
      let petId = selectedPetId;

      // If no pet selected, create a new one first
      if (!petId) {
        if (!selectedPetTypeId) {
          if (Platform.OS === 'web') {
            window.alert('Error: Please select a pet type');
          } else {
            Alert.alert('Error', 'Please select a pet type');
          }
          setIsSubmitting(false);
          return;
        }

        const newPet = await petService.createPet({
          name: petName,
          petTypeId: selectedPetTypeId,
          breedId: selectedBreedId,
        });
        petId = newPet.id;
      }

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
        petId: petId,
        petName: petName,
        petType: petType,
        description: description || `Booking for ${selectedService}`,
        totalPrice: provider.hourlyRate,
        status: APPOINTMENT_STATUS.PENDING
      };

      if (rescheduleId) {
        await appointmentService.updateAppointment(Number(rescheduleId), appointmentData);
        if (Platform.OS === 'web') {
          window.alert('Success: Appointment rescheduled successfully!');
          router.push('/appointments-owner');
        } else {
          Alert.alert('Success', 'Appointment rescheduled successfully!', [
            { text: 'OK', onPress: () => router.push('/appointments-owner') }
          ]);
        }
      } else {
        await appointmentService.createAppointment(appointmentData);
        if (Platform.OS === 'web') {
          window.alert('Success: Appointment booked successfully!');
          router.push('/appointments-owner');
        } else {
          Alert.alert('Success', 'Appointment booked successfully!', [
            { text: 'OK', onPress: () => router.push('/appointments-owner') }
          ]);
        }
      }
    } catch (error) {
      console.error('Error handling booking:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to process appointment. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to process appointment. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ChevronLeft color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">Provider Details</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={toggleSaveProvider}
              className="bg-primary/10 p-2 rounded-full"
            >
              <Heart color={isSaved ? '#ef4444' : (isDark ? '#94a3b8' : '#475569')} fill={isSaved ? '#ef4444' : 'transparent'} size={24} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/owner-dashboard')}
              className="bg-primary/10 p-2 rounded-full"
            >
              <HomeIcon color={isDark ? '#fb923c' : '#ea580c'} size={24} />
            </TouchableOpacity>
            <ThemeToggle />
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-destructive/10 p-2 rounded-full"
            >
              <LogOut color={isDark ? '#f87171' : '#dc2626'} size={24} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Gallery */}
        <ScrollView 
          horizontal 
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 0 }}
        >
          {photos.length > 0 ? (
            photos.map((photo) => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={{ width, height: 250 }}
                resizeMode="cover"
              />
            ))
          ) : (
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800' }}
              style={{ width, height: 250 }}
              resizeMode="cover"
            />
          )}
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
                  <Star color="#EAB308" size={18} fill="#EAB308" />
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
          <View className="flex-row flex-wrap gap-2 mb-4">
            {provider.serviceTypes && provider.serviceTypes.length > 0 ? (
              provider.serviceTypes.map(st => (
                <View key={st.id} className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                  {st.name.toLowerCase().includes('grooming') ? (
                    <Scissors color={isDark ? '#fb923c' : '#ea580c'} size={14} />
                  ) : (
                    <HomeIcon color={isDark ? '#fb923c' : '#ea580c'} size={14} />
                  )}
                  <Text className="text-primary text-sm font-medium">{st.name}</Text>
                </View>
              ))
            ) : (
              <View className="bg-primary/10 px-3 py-1.5 rounded-full flex-row items-center gap-1">
                <HomeIcon color={isDark ? '#fb923c' : '#ea580c'} size={14} />
                <Text className="text-primary text-sm font-medium">General Service</Text>
              </View>
            )}
          </View>

          {/* Contact Info */}
          <View className="bg-card border border-border rounded-xl p-4 gap-3 mb-4">
            <View className="flex-row items-center gap-3">
              <MapPin color={isDark ? '#94a3b8' : '#64748b'} size={20} />
              <Text className="text-foreground flex-1">{provider.address}, {provider.city}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Phone color={isDark ? '#94a3b8' : '#64748b'} size={20} />
              <Text className="text-foreground">{provider.user?.email || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Globe color={isDark ? '#94a3b8' : '#64748b'} size={20} />
              <Text className="text-primary">www.{provider.companyName.toLowerCase().replace(/\s/g, '')}.com</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Clock color={isDark ? '#94a3b8' : '#64748b'} size={20} />
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
            <Text className="text-lg font-bold text-foreground mb-3">Select Service</Text>
            {provider.serviceTypes && provider.serviceTypes.length > 0 ? (
              provider.serviceTypes.map(st => (
                <TouchableOpacity
                  key={st.id}
                  onPress={() => setSelectedService(st.name)}
                  className={`bg-card border-2 rounded-xl p-4 mb-3 ${
                    selectedService === st.name ? 'border-primary' : 'border-border'
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base mb-1">
                        {st.name}
                      </Text>
                      <Text className="text-muted-foreground text-sm mb-2">
                        {st.description}
                      </Text>
                      <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-1">
                          <Clock color={isDark ? '#94a3b8' : '#64748b'} size={14} />
                          <Text className="text-muted-foreground text-sm">1 hour</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <DollarSign color={isDark ? '#fb923c' : '#ea580c'} size={14} />
                          <Text className="text-primary font-bold">${provider.hourlyRate}/hr</Text>
                        </View>
                      </View>
                    </View>
                    {selectedService === st.name && (
                      <View className="bg-primary rounded-full p-1">
                        <Check color="#ffffff" size={16} />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                onPress={() => setSelectedService('General Service')}
                className={`bg-card border-2 rounded-xl p-4 ${
                  selectedService === 'General Service' ? 'border-primary' : 'border-border'
                }`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-base mb-1">
                      General Service
                    </Text>
                    <Text className="text-muted-foreground text-sm mb-2">
                      Professional pet care service
                    </Text>
                    <View className="flex-row items-center gap-4">
                      <View className="flex-row items-center gap-1">
                        <Clock color={isDark ? '#94a3b8' : '#64748b'} size={14} />
                        <Text className="text-muted-foreground text-sm">1 hour</Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <DollarSign color={isDark ? '#fb923c' : '#ea580c'} size={14} />
                        <Text className="text-primary font-bold">${provider.hourlyRate}/hr</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Booking Section */}
          {showBooking && (
            <View className="mb-6">
              <Text className="text-lg font-bold text-foreground mb-3">
                {rescheduleId ? 'Reschedule Appointment' : 'Book Appointment'}
              </Text>

              {/* Pet Details */}
              <View className="bg-card border border-border rounded-xl p-4 mb-4">
                <Text className="text-sm font-semibold text-foreground mb-3">Pet Information</Text>
                
                {myPets.length > 0 && (
                  <View className="mb-4">
                    <Text className="text-xs text-muted-foreground mb-2">Select Your Pet</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                      {myPets.map((pet) => (
                        <TouchableOpacity
                          key={pet.id}
                          onPress={() => {
                            setSelectedPetId(pet.id);
                            setPetName(pet.name);
                            setPetType(pet.petType?.name || 'Dog');
                          }}
                          className={`px-4 py-2 rounded-lg border ${
                            selectedPetId === pet.id ? 'bg-primary border-primary' : 'bg-muted border-border'
                          }`}
                        >
                          <Text className={`${selectedPetId === pet.id ? 'text-primary-foreground font-bold' : 'text-foreground'}`}>
                            {pet.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedPetId(null);
                          setPetName('');
                        }}
                        className={`px-4 py-2 rounded-lg border ${
                          selectedPetId === null ? 'bg-primary border-primary' : 'bg-muted border-border'
                        }`}
                      >
                        <Text className={`${selectedPetId === null ? 'text-primary-foreground font-bold' : 'text-foreground'}`}>
                          + New Pet
                        </Text>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                )}

                {selectedPetId === null && (
                  <>
                    <View className="mb-3">
                      <Text className="text-xs text-muted-foreground mb-1">Pet Name</Text>
                      <TextInput
                        value={petName}
                        onChangeText={setPetName}
                        placeholder="Enter pet name"
                        placeholderTextColor="#9CA3AF"
                        className="bg-muted px-4 py-2 rounded-lg text-foreground"
                      />
                    </View>

                    <View className="mb-3">
                      <Text className="text-xs text-muted-foreground mb-1">Pet Type</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {petTypes.map((type) => (
                          <TouchableOpacity
                            key={type.id}
                            onPress={() => {
                              setSelectedPetTypeId(type.id);
                              setPetType(type.name);
                              setSelectedBreedId(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg border ${
                              selectedPetTypeId === type.id ? 'bg-primary border-primary' : 'bg-muted border-border'
                            }`}
                          >
                            <Text className={`text-xs ${selectedPetTypeId === type.id ? 'text-primary-foreground font-bold' : 'text-muted-foreground'}`}>
                              {type.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {breeds.length > 0 && (
                      <View className="mb-3">
                        <Text className="text-xs text-muted-foreground mb-1">Breed (Optional)</Text>
                        <View className="flex-row flex-wrap gap-2">
                          {breeds.map((breed) => (
                            <TouchableOpacity
                              key={breed.id}
                              onPress={() => setSelectedBreedId(breed.id)}
                              className={`px-3 py-1.5 rounded-lg border ${
                                selectedBreedId === breed.id ? 'bg-primary border-primary' : 'bg-muted border-border'
                              }`}
                            >
                              <Text className={`text-xs ${selectedBreedId === breed.id ? 'text-primary-foreground font-bold' : 'text-muted-foreground'}`}>
                                {breed.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </>
                )}

                <View className="mt-3">
                  <Text className="text-xs text-muted-foreground mb-1">Special Notes (Optional)</Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Any special instructions?"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    className="bg-muted px-4 py-2 rounded-lg text-foreground text-sm h-20"
                    textAlignVertical="top"
                  />
                </View>
              </View>
              
              <Text className="text-sm font-semibold text-foreground mb-3">Select Date & Time</Text>
              
              {/* Date Selection */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-foreground mb-2">Select Date</Text>
                <View className="bg-card border border-border rounded-xl overflow-hidden">
                  <Calendar
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                    markedDates={{
                      ...availableDates,
                      [selectedDate]: {
                        ...(availableDates[selectedDate] || {}),
                        selected: true,
                        selectedColor: '#2563eb',
                      },
                    }}
                    theme={{
                      backgroundColor: 'transparent',
                      calendarBackground: 'transparent',
                      textSectionTitleColor: isDark ? '#94a3b8' : '#6b7280',
                      selectedDayBackgroundColor: '#2563eb',
                      selectedDayTextColor: '#ffffff',
                      todayTextColor: '#2563eb',
                      dayTextColor: isDark ? '#f8fafc' : '#374151',
                      textDisabledColor: isDark ? '#334155' : '#d1d5db',
                      dotColor: '#2563eb',
                      selectedDotColor: '#ffffff',
                      arrowColor: '#2563eb',
                      monthTextColor: isDark ? '#f8fafc' : '#111827',
                      indicatorColor: '#2563eb',
                    }}
                  />
                </View>
              </View>

              {/* Time Selection */}
              {selectedDate && (
                <>
                  <Text className="text-sm font-semibold text-foreground mb-2">
                    Available Times for {selectedDate ? format(new Date(selectedDate), 'MMM dd, yyyy') : ''}
                  </Text>
                  {timeSlots.length > 0 ? (
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
                  ) : (
                    <View className="bg-muted p-4 rounded-xl items-center justify-center mb-4">
                      <Clock color={isDark ? '#94a3b8' : '#64748b'} size={24} />
                      <Text className="text-muted-foreground text-center">
                        No time slots available for this date.
                      </Text>
                    </View>
                  )}
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
                <ChevronRight color={isDark ? '#fb923c' : '#ea580c'} size={16} />
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
                {rescheduleId ? 'Confirm Reschedule' : 'Confirm Booking'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
