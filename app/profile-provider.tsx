import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput, Platform, Modal, useColorScheme, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  MapPin,
  Edit,
  Star,
  Clock,
  DollarSign,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Plus,
  Trash2,
  Camera,
  Save,
  X,
  Home
} from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MultiSelect } from '@/components/MultiSelect';
import { 
  authService, 
  userService, 
  User, 
  Provider, 
  providerService, 
  serviceTypeService, 
  ServiceType,
  providerServicePricingService,
  ProviderService,
  availabilityService,
  Availability,
  providerPhotoService,
  ProviderPhoto
} from '@/services/petCareService';
import { getImageUrl } from '@/services/api';
import { format, parseISO } from 'date-fns';
import CountryCodePicker from '@/components/CountryCodePicker';
import { countries, Country } from '@/constants/countries';

export default function ProfileProviderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [editMode, setEditMode] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<ProviderService[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [photos, setPhotos] = useState<ProviderPhoto[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serviceErrors, setServiceErrors] = useState<Record<string, string>>({});
  const [availabilityErrors, setAvailabilityErrors] = useState<Record<string, string>>({});
  const [photoErrors, setPhotoErrors] = useState<Record<string, string>>({});

  const validateBusiness = () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.companyName.trim()) newErrors.companyName = 'Business name is required';
    if (!editForm.description.trim()) newErrors.description = 'Description is required';
    if (editForm.hourlyRate <= 0) newErrors.hourlyRate = 'Rate must be > 0';
    if (!editForm.city.trim()) newErrors.city = 'City is required';
    if (!editForm.address.trim()) newErrors.address = 'Address is required';
    if (editForm.serviceTypeIds.length === 0) newErrors.serviceTypeIds = 'Select at least one specialty';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateService = () => {
    const newErrors: Record<string, string> = {};
    if (serviceForm.serviceTypeId === 0) newErrors.serviceTypeId = 'Select service type';
    if (serviceForm.price <= 0) newErrors.price = 'Price must be > 0';
    setServiceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAvailability = () => {
    const newErrors: Record<string, string> = {};
    if (!availabilityForm.date.trim()) newErrors.date = 'Date is required';
    if (!availabilityForm.startTime.trim()) newErrors.startTime = 'Start time required';
    if (!availabilityForm.endTime.trim()) newErrors.endTime = 'End time required';
    setAvailabilityErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePhoto = () => {
    const newErrors: Record<string, string> = {};
    if (!photoForm.url.trim()) newErrors.url = 'Photo URL is required';
    setPhotoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Photo state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoForm, setPhotoForm] = useState({
    url: '',
    description: ''
  });

  // Service Edit state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<ProviderService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    serviceTypeId: 0,
    price: 0,
    description: ''
  });

  // Availability Edit state
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityForm, setAvailabilityForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00'
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    companyName: '',
    description: '',
    hourlyRate: 0,
    address: '',
    city: '',
    serviceTypeIds: [] as number[],
    latitude: 0,
    longitude: 0
  });

  useEffect(() => {
    loadProfileData();
    loadServiceTypes();
    loadServices();
    loadAvailability();
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const data = await providerPhotoService.getMyPhotos();
      setPhotos(data);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleSavePhoto = async () => {
    Keyboard.dismiss();
    if (!validatePhoto()) return;
    try {
      await providerPhotoService.addPhoto(photoForm);
      setShowPhotoModal(false);
      setPhotoForm({ url: '', description: '' });
      setPhotoErrors({});
      loadPhotos();
      if (Platform.OS === 'web') {
        window.alert('Success: Photo added to gallery');
      } else {
        Alert.alert('Success', 'Photo added to gallery');
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      Alert.alert('Error', 'Failed to add photo');
    }
  };

  const loadAvailability = async () => {
    try {
      const data = await availabilityService.getMyAvailability();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };

  const handleAddAvailability = async () => {
    Keyboard.dismiss();
    if (!validateAvailability()) return;
    try {
      if (!provider) return;
      
      // Combine date and time for API
      const startDateTime = new Date(`${availabilityForm.date}T${availabilityForm.startTime}:00Z`).toISOString();
      const endDateTime = new Date(`${availabilityForm.date}T${availabilityForm.endTime}:00Z`).toISOString();
      const dateOnly = new Date(`${availabilityForm.date}T00:00:00Z`).toISOString();

      await availabilityService.createAvailability({
        date: dateOnly,
        startTime: startDateTime,
        endTime: endDateTime,
        providerId: provider.id,
        isBooked: false
      });
      setShowAvailabilityModal(false);
      setAvailabilityErrors({});
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      Alert.alert('Error', 'Failed to add availability. Please ensure date (YYYY-MM-DD) and time (HH:mm) formats are correct.');
    }
  };

  const handleDeleteAvailability = async (id: number) => {
    Alert.alert(
      'Delete Availability',
      'Are you sure you want to delete this time slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await availabilityService.deleteAvailability(id);
              loadAvailability();
            } catch (error) {
              console.error('Error deleting availability:', error);
              Alert.alert('Error', 'Failed to delete availability');
            }
          }
        }
      ]
    );
  };

  const loadServices = async () => {
    try {
      const data = await providerServicePricingService.getMyServices();
      setServices(data);
      // Also reload profile data to sync Business Profile service list
      loadProfileData();
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadServiceTypes = async () => {
    try {
      const types = await serviceTypeService.getServiceTypes();
      setServiceTypes(types);
    } catch (error) {
      console.error('Error loading service types:', error);
    }
  };

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUser();
      setUserData(user);
      if (user.provider) {
        const providerData = user.provider;
        // Derive serviceTypes and serviceTypeIds if not directly present
        const derivedServiceTypes = providerData.serviceTypes || 
          providerData.providerServices?.map(ps => ps.serviceType).filter(st => st != null) || [];
        const derivedServiceTypeIds = providerData.serviceTypeIds || 
          providerData.providerServices?.map(ps => ps.serviceTypeId) || [];

        const syncedProvider = {
          ...providerData,
          serviceTypes: derivedServiceTypes,
          serviceTypeIds: derivedServiceTypeIds
        };

        setProvider(syncedProvider);
        setEditForm({
          companyName: providerData.companyName,
          description: providerData.description,
          hourlyRate: providerData.hourlyRate,
          address: providerData.address,
          city: providerData.city,
          serviceTypeIds: derivedServiceTypeIds as number[],
          latitude: providerData.latitude || 0,
          longitude: providerData.longitude || 0
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();
    if (!provider) return;
    if (!validateBusiness()) return;
    try {
      console.log('Saving profile with data:', editForm);
      await providerService.updateProvider(provider.id, editForm);
      console.log('Profile update successful');
      
      // Fetch updated provider to get navigation properties
      const updatedUser = await userService.getCurrentUser();
      if (updatedUser.provider) {
        setProvider(updatedUser.provider);
      }
      
      // Also reload services to sync with Business Profile changes
      const updatedServices = await providerServicePricingService.getMyServices();
      setServices(updatedServices);
      
      setEditMode(false);
      setErrors({});
      if (Platform.OS === 'web') {
        window.alert('Success: Profile updated successfully');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to update profile');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    }
  };

  const handleCancelEdit = () => {
    Keyboard.dismiss();
    if (provider) {
      setEditForm({
        companyName: provider.companyName,
        description: provider.description,
        hourlyRate: provider.hourlyRate,
        address: provider.address,
        city: provider.city,
        serviceTypeIds: provider.serviceTypeIds || [],
        latitude: provider.latitude,
        longitude: provider.longitude
      });
    }
    setErrors({});
    setEditMode(false);
  };

  const sortedServiceTypes = [...serviceTypes].sort((a, b) => {
    // Priority 1: Currently selected in the form
    const aIsCurrent = serviceForm.serviceTypeId === a.id;
    const bIsCurrent = serviceForm.serviceTypeId === b.id;
    if (aIsCurrent && !bIsCurrent) return -1;
    if (!aIsCurrent && bIsCurrent) return 1;

    // Priority 2: Already has a pricing entry in 'services'
    const aInServices = services.some(s => s.serviceTypeId === a.id);
    const bInServices = services.some(s => s.serviceTypeId === b.id);
    if (aInServices && !bInServices) return -1;
    if (!aInServices && bInServices) return 1;

    // Priority 3: Selected in Business Profile
    const aInProfile = (editForm.serviceTypeIds || []).includes(a.id);
    const bInProfile = (editForm.serviceTypeIds || []).includes(b.id);
    if (aInProfile && !bInProfile) return -1;
    if (!aInProfile && bInProfile) return 1;

    // Priority 4: Alphabetical
    return a.name.localeCompare(b.name);
  });

  const sortedServiceTypesForProfile = [...serviceTypes].sort((a, b) => {
    const aSelected = editForm.serviceTypeIds.includes(a.id);
    const bSelected = editForm.serviceTypeIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return a.name.localeCompare(b.name);
  });

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        // Prepare form data
        const formData = new FormData();
        const uri = Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri;
        
        // @ts-ignore
        formData.append('file', {
          uri: uri,
          type: 'image/jpeg',
          name: 'profile-photo.jpg',
        });

        const response = await providerService.updateProviderPhoto(formData);
        
        // Update local state
        if (provider) {
          setProvider({
            ...provider,
            profileImageUrl: response.url
          });
        }
        
        if (Platform.OS === 'web') {
          window.alert('Success: Profile photo updated');
        } else {
          Alert.alert('Success', 'Profile photo updated');
        }
      }
    } catch (error) {
      console.error('Error picking/uploading image:', error);
      Alert.alert('Error', 'Failed to update profile photo');
    }
  };

  const handleEditService = (service: ProviderService) => {
    Keyboard.dismiss();
    setEditingService(service);
    setServiceForm({
      serviceTypeId: service.serviceTypeId,
      price: service.price,
      description: service.description || ''
    });
    setShowServiceModal(true);
  };

  const handleAddService = () => {
    Keyboard.dismiss();
    setEditingService(null);
    setServiceForm({
      serviceTypeId: serviceTypes.length > 0 ? serviceTypes[0].id : 0,
      price: 0,
      description: ''
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async () => {
    Keyboard.dismiss();
    try {
      if (editingService && editingService.id) {
        // Send only the necessary fields to the API, avoiding navigation properties
        const updateData = {
          id: editingService.id,
          providerId: editingService.providerId,
          serviceTypeId: serviceForm.serviceTypeId,
          price: serviceForm.price,
          description: serviceForm.description
        };
        await providerServicePricingService.updateService(editingService.id, updateData as ProviderService);
      } else {
        await providerServicePricingService.createService(serviceForm as ProviderService);
      }
      setShowServiceModal(false);
      loadServices();
      if (Platform.OS === 'web') {
        window.alert('Success: Service saved');
      } else {
        Alert.alert('Success', 'Service saved');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to save service');
      } else {
        Alert.alert('Error', 'Failed to save service');
      }
    }
  };

  const handleDeleteService = (serviceId: number, serviceName: string) => {
    const performDelete = async () => {
      try {
        await providerServicePricingService.deleteService(serviceId);
        loadServices();
      } catch (error) {
        console.error('Error deleting service:', error);
        Alert.alert('Error', 'Failed to delete service');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove ${serviceName}?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Service',
        `Are you sure you want to remove ${serviceName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const handleAddPhoto = () => {
    Keyboard.dismiss();
    setPhotoForm({ url: '', description: '' });
    setShowPhotoModal(true);
  };

  const handleDeletePhoto = (photoId: number) => {
    const performDelete = async () => {
      try {
        await providerPhotoService.deletePhoto(photoId);
        loadPhotos();
      } catch (error) {
        console.error('Error deleting photo:', error);
        Alert.alert('Error', 'Failed to delete photo');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Remove this photo from your gallery?')) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Photo',
        'Remove this photo from your gallery?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 128 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center w-full">
          <View className="w-full max-w-4xl">
            {/* Header */}
            <View className="p-6 flex-row items-center justify-between">
              <TouchableOpacity onPress={() => router.back()}>
                <ArrowLeft color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              </TouchableOpacity>
              <Text className="text-xl font-bold text-foreground">Business Profile</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity 
                  onPress={() => router.push('/provider-dashboard')}
                  className="bg-primary/10 p-2 rounded-full"
                >
                  <Home color={isDark ? '#fb923c' : '#ea580c'} size={24} />
                </TouchableOpacity>
                <ThemeToggle />
                <TouchableOpacity onPress={handleLogout}>
                  <LogOut color={isDark ? '#f87171' : '#dc2626'} size={24} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Main Content Layout */}
            <View className="flex-col md:flex-row gap-6 px-6">
              {/* Left Column - Business Info & Services */}
              <View className="flex-1 gap-6">
                {/* Business Info Card */}
                <View className="bg-card rounded-2xl p-6 border border-border">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center flex-1">
                      <View className="relative">
                        <Image
                          source={{ uri: getImageUrl(provider?.profileImageUrl) || 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400' }}
                          className="w-20 h-20 rounded-xl"
                        />
                        <TouchableOpacity 
                          onPress={handlePickImage}
                          className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-card"
                        >
                          <Camera color="#ffffff" size={14} />
                        </TouchableOpacity>
                      </View>
                      <View className="flex-1 ml-4">
                        {editMode ? (
                          <>
                            <TextInput
                              value={editForm.companyName}
                              onChangeText={(text) => setEditForm({ ...editForm, companyName: text })}
                              className={`text-xl font-bold text-foreground bg-muted rounded-lg px-3 py-2 mb-1 ${errors.companyName ? 'border border-destructive' : ''}`}
                              placeholder="Business Name"
                            />
                            {errors.companyName && <Text className="text-destructive text-xs mb-2 ml-1">{errors.companyName}</Text>}
                          </>
                        ) : (
                          <Text className="text-xl font-bold text-foreground">{provider?.companyName}</Text>
                        )}
                        <View className="flex-row items-center mt-1">
                          <Star color="#EAB308" size={16} fill="#EAB308" />
                          <Text className="text-foreground font-semibold ml-1">4.8</Text>
                          <Text className="text-muted-foreground ml-1">(127 reviews)</Text>
                        </View>
                        <Text className="text-muted-foreground text-sm mt-1">Provider since 2024</Text>
                      </View>
                    </View>
                    {!editMode && (
                      <TouchableOpacity onPress={() => setEditMode(true)}>
                        <Edit color={isDark ? '#fb923c' : '#ea580c'} size={20} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {editMode ? (
                    <View className="gap-3">
                      <View>
                        <Text className="text-sm text-muted-foreground mb-2">Service Types</Text>
                        <MultiSelect
                          options={sortedServiceTypesForProfile}
                          selectedValues={editForm.serviceTypeIds}
                          onValueChange={(ids) => setEditForm(prev => ({ ...prev, serviceTypeIds: ids }))}
                          placeholder="Select services"
                          label="Business Services"
                        />
                        {errors.serviceTypeIds && <Text className="text-destructive text-xs mt-1 ml-1">{errors.serviceTypeIds}</Text>}
                      </View>
                      <View>
                        <Text className="text-sm text-muted-foreground mb-1">Hourly Rate ($)</Text>
                        <TextInput
                          value={editForm.hourlyRate.toString()}
                          onChangeText={(text) => setEditForm({ ...editForm, hourlyRate: parseFloat(text) || 0 })}
                          className={`text-foreground bg-muted rounded-lg px-3 py-2 ${errors.hourlyRate ? 'border border-destructive' : ''}`}
                          placeholder="50"
                          keyboardType="numeric"
                        />
                        {errors.hourlyRate && <Text className="text-destructive text-xs mt-1 ml-1">{errors.hourlyRate}</Text>}
                      </View>
                      {/* City and Address are captured during registration and cannot be edited here */}
                      {/* 
                      <View>
                        <Text className="text-sm text-muted-foreground mb-1">Address</Text>
                        <TextInput
                          value={editForm.address}
                          onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                          className="text-foreground bg-muted rounded-lg px-3 py-2"
                          placeholder="Address"
                        />
                      </View>
                      <View>
                        <Text className="text-sm text-muted-foreground mb-1">City</Text>
                        <TextInput
                          value={editForm.city}
                          onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                          className="text-foreground bg-muted rounded-lg px-3 py-2"
                          placeholder="City"
                        />
                      </View>
                      */}
                      <View>
                        <Text className="text-sm text-muted-foreground mb-1">Description</Text>
                        <TextInput
                          value={editForm.description}
                          onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                          className={`text-foreground bg-muted rounded-lg px-3 py-2 ${errors.description ? 'border border-destructive' : ''}`}
                          placeholder="Business Description"
                          multiline
                          numberOfLines={4}
                        />
                        {errors.description && <Text className="text-destructive text-xs mt-1 ml-1">{errors.description}</Text>}
                      </View>

                      <View className="flex-row gap-3 mt-2">
                        <TouchableOpacity 
                          onPress={handleSaveProfile}
                          className="flex-1 bg-primary rounded-lg py-3 flex-row items-center justify-center"
                        >
                          <Save color="#ffffff" size={18} />
                          <Text className="text-primary-foreground font-semibold ml-2">Save Changes</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={handleCancelEdit}
                          className="flex-1 bg-muted rounded-lg py-3 flex-row items-center justify-center"
                        >
                          <X color={isDark ? '#f8fafc' : '#1e293b'} size={18} />
                          <Text className="text-foreground font-semibold ml-2">Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View className="gap-3">
                      <View className="flex-row items-center flex-wrap gap-2">
                        <Star color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                        {provider?.serviceTypes && provider.serviceTypes.length > 0 ? (
                          provider.serviceTypes.map(st => (
                            <View key={st.id} className="bg-primary/10 px-2 py-0.5 rounded ml-1">
                              <Text className="text-primary text-xs font-medium">{st.name}</Text>
                            </View>
                          ))
                        ) : (
                          <Text className="text-foreground ml-1">No Service Types</Text>
                        )}
                      </View>
                      <View className="flex-row items-center">
                        <DollarSign color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                        <Text className="text-foreground ml-3">${provider?.hourlyRate}/hr</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Building2 color={isDark ? '#94a3b8' : '#475569'} size={18} />
                        <Text className="text-foreground flex-1 ml-3">{userData?.firstName} {userData?.lastName}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <Mail color={isDark ? '#94a3b8' : '#475569'} size={18} />
                        <Text className="text-foreground flex-1 ml-3">{userData?.email}</Text>
                      </View>
                      <View className="flex-row items-center">
                        <MapPin color={isDark ? '#94a3b8' : '#475569'} size={18} />
                        <Text className="text-foreground flex-1 ml-3">{provider?.address}, {provider?.city}</Text>
                      </View>
                      <View className="mt-2 pt-3 border-t border-border">
                        <Text className="text-foreground">{provider?.description}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Services Section */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <DollarSign color={isDark ? '#fb923c' : '#ea580c'} size={20} />
                      <Text className="text-lg font-bold text-foreground ml-2">Services & Pricing</Text>
                    </View>
                    {/* Commented out to suspend add functionality besides availability
                    <TouchableOpacity onPress={handleAddService} className="flex-row items-center">
                      <Plus color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                      <Text className="text-primary font-semibold ml-1">Add</Text>
                    </TouchableOpacity>
                    */}
                  </View>

                  <View className="gap-3">
                    {services.map((service) => (
                      <View key={service.id} className="bg-card rounded-xl p-4 border border-border">
                        <View className="flex-row items-start justify-between">
                          <View className="flex-1">
                            <Text className="text-lg font-bold text-foreground">
                              {service.serviceType?.name || 'Unknown'}
                            </Text>
                            <Text className="text-muted-foreground mt-1">{service.description}</Text>
                          </View>
                          <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => handleEditService(service)}>
                              <Edit color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteService(service.id!, service.serviceType?.name || 'service')}>
                              <Trash2 color={isDark ? '#f87171' : '#dc2626'} size={18} />
                            </TouchableOpacity>
                          </View>
                        </View>
                        <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                          <Text className="text-xl font-bold text-primary">${service.price}</Text>
                        </View>
                      </View>
                    ))}
                    {services.length === 0 && (
                      <View className="bg-card rounded-xl p-6 border border-dashed border-border items-center">
                        <Text className="text-muted-foreground text-center">No individual services listed. Add one to set specific pricing!</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Right Column - Availability & Photo Gallery */}
              <View className="flex-1 gap-6">
                {/* Business Hours */}
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Clock color={isDark ? '#fb923c' : '#ea580c'} size={20} />
                      <Text className="text-lg font-bold text-foreground ml-2">Business Hours / Availability</Text>
                    </View>
                    {/* <TouchableOpacity onPress={() => setShowAvailabilityModal(true)} className="flex-row items-center">
                      <Plus color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                      <Text className="text-primary font-semibold ml-1">Add</Text>
                    </TouchableOpacity> */}
                  </View>

                  <View className="bg-card rounded-xl p-4 border border-border gap-3">
                    {availabilities.length > 0 ? (
                      availabilities.map((item) => (
                        <View key={item.id} className="flex-row items-center justify-between border-b border-border/50 pb-2">
                          <View>
                            <Text className="text-foreground font-semibold">
                              {new Date(item.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                            </Text>
                            <Text className="text-muted-foreground text-xs">
                              {new Date(item.startTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - {new Date(item.endTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                            </Text>
                          </View>
                          <View className="flex-row items-center gap-3">
                            {item.isBooked && (
                              <View className="bg-amber-100 px-2 py-0.5 rounded">
                                <Text className="text-amber-700 text-[10px] font-bold">BOOKED</Text>
                              </View>
                            )}
                            <TouchableOpacity onPress={() => handleDeleteAvailability(item.id!)}>
                              <Trash2 color={isDark ? '#f87171' : '#dc2626'} size={16} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View className="py-4 items-center">
                        <Text className="text-muted-foreground">No availability slots added yet.</Text>
                      </View>
                    )}
                    <TouchableOpacity 
                      onPress={() => router.push('/manage-availability')}
                      className="mt-2 py-2 items-center"
                    >
                      <Text className="text-primary text-sm font-semibold">Advanced Manager</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Photo Gallery - Commented out
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                      <Camera color={isDark ? '#fb923c' : '#ea580c'} size={20} />
                      <Text className="text-lg font-bold text-foreground ml-2">Photo Gallery</Text>
                    </View>
                    <TouchableOpacity onPress={handleAddPhoto} className="flex-row items-center">
                      <Plus color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                      <Text className="text-primary font-semibold ml-1">Add</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row flex-wrap gap-3">
                    {photos.length > 0 ? (
                      photos.map((photo) => (
                        <View key={photo.id} className="basis-[48%] relative">
                          <Image
                            source={{ uri: getImageUrl(photo.url) || '' }}
                            className="w-full h-40 rounded-xl"
                          />
                          <TouchableOpacity 
                            onPress={() => handleDeletePhoto(photo.id)}
                            className="absolute top-2 right-2 bg-destructive/80 rounded-full p-1.5"
                          >
                            <Trash2 color="#ffffff" size={14} />
                          </TouchableOpacity>
                          {photo.description && (
                            <View className="absolute bottom-0 left-0 right-0 bg-black/40 p-2 rounded-b-xl">
                              <Text className="text-white text-[10px]" numberOfLines={1}>{photo.description}</Text>
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      <View className="w-full py-8 items-center border-2 border-dashed border-border rounded-xl">
                        <Camera color={isDark ? '#475569' : '#94a3b8'} size={32} />
                        <Text className="text-muted-foreground mt-2">No photos in gallery yet</Text>
                      </View>
                    )}
                  </View>
                </View>
                */}

                {/* Settings Section */}
                <View className="mb-6">
                  <Text className="text-lg font-bold text-foreground mb-4">Settings</Text>

                  <View className="gap-2">
                    <TouchableOpacity 
                      onPress={() => router.push('/payment-invoice')}
                      className="bg-card rounded-xl border border-border"
                    >
                      <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1">
                          <DollarSign color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                          <Text className="text-foreground ml-3">Payments & Invoices</Text>
                        </View>
                        <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => router.push('/notifications')}
                      className="bg-card rounded-xl border border-border"
                    >
                      <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1">
                          <Bell color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                          <Text className="text-foreground ml-3">Notifications</Text>
                        </View>
                        <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => router.push('/privacy-security')}
                      className="bg-card rounded-xl border border-border"
                    >
                      <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1">
                          <Shield color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                          <Text className="text-foreground ml-3">Privacy & Security</Text>
                        </View>
                        <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => router.push('/help-support')}
                      className="bg-card rounded-xl border border-border"
                    >
                      <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center flex-1">
                          <HelpCircle color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                          <Text className="text-foreground ml-3">Help & Support</Text>
                        </View>
                        <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Service Add/Edit Modal */}
      <Modal
        visible={showServiceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowServiceModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">
                {editingService ? 'Edit Service' : 'Add Service'}
              </Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowServiceModal(false);
              }}>
                <X color={isDark ? '#94a3b8' : '#475569'} size={24} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Service Type</Text>
                <View className={`bg-muted rounded-xl border ${serviceErrors.serviceTypeId ? 'border-destructive' : 'border-border'}`}>
                  {Platform.OS === 'web' ? (
                    <select
                      value={serviceForm.serviceTypeId}
                      onChange={(e) => setServiceForm({ ...serviceForm, serviceTypeId: parseInt(e.target.value) })}
                      style={{
                        padding: 12,
                        backgroundColor: 'transparent',
                        color: 'inherit',
                        border: 'none',
                        width: '100%',
                        fontSize: 16
                      }}
                    >
                      <option value={0}>Select a service</option>
                      {sortedServiceTypes.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                      <View className="flex-row gap-2">
                        {sortedServiceTypes.map(st => (
                          <TouchableOpacity
                            key={st.id}
                            onPress={() => setServiceForm({ ...serviceForm, serviceTypeId: st.id })}
                            className={`px-4 py-2 rounded-full border ${
                              serviceForm.serviceTypeId === st.id 
                                ? 'bg-primary border-primary' 
                                : 'bg-background border-border'
                            } ${serviceErrors.serviceTypeId && serviceForm.serviceTypeId !== st.id ? 'border-destructive' : ''}`}
                          >
                            <Text className={serviceForm.serviceTypeId === st.id ? 'text-primary-foreground' : 'text-foreground'}>
                              {st.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                </View>
                {serviceErrors.serviceTypeId && <Text className="text-destructive text-xs mt-1 ml-1">{serviceErrors.serviceTypeId}</Text>}
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Price ($)</Text>
                <TextInput
                  value={serviceForm.price.toString()}
                  onChangeText={(text) => setServiceForm({ ...serviceForm, price: parseFloat(text) || 0 })}
                  className={`bg-muted text-foreground p-4 rounded-xl border ${serviceErrors.price ? 'border-destructive' : 'border-border'}`}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
                {serviceErrors.price && <Text className="text-destructive text-xs mt-1 ml-1">{serviceErrors.price}</Text>}
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Description</Text>
                <TextInput
                  value={serviceForm.description}
                  onChangeText={(text) => setServiceForm({ ...serviceForm, description: text })}
                  className="bg-muted text-foreground p-4 rounded-xl border border-border h-24"
                  placeholder="Tell us more about this service..."
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity 
                onPress={handleSaveService}
                className="bg-primary p-4 rounded-xl flex-row items-center justify-center mt-2"
              >
                <Save color="#ffffff" size={20} />
                <Text className="text-primary-foreground font-bold text-lg ml-2">Save Service</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
          </View>
        </View>
      </Modal>

      {/* Availability Add Modal */}
      <Modal
        visible={showAvailabilityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAvailabilityModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Add Availability Slot</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowAvailabilityModal(false);
              }}>
                <X color={isDark ? '#94a3b8' : '#475569'} size={24} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Date (YYYY-MM-DD)</Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={availabilityForm.date}
                    onChange={(e) => setAvailabilityForm({ ...availabilityForm, date: e.target.value })}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      backgroundColor: 'rgba(var(--muted), 1)',
                      color: 'rgba(var(--foreground), 1)',
                      border: availabilityErrors.date ? '1px solid #dc2626' : '1px solid rgba(var(--border), 1)',
                      width: '100%',
                      fontSize: 16
                    }}
                  />
                ) : (
                  <TextInput
                    value={availabilityForm.date}
                    onChangeText={(text) => setAvailabilityForm({ ...availabilityForm, date: text })}
                    className={`bg-muted text-foreground p-4 rounded-xl border ${availabilityErrors.date ? 'border-destructive' : 'border-border'}`}
                    placeholder="2024-05-20"
                  />
                )}
                {availabilityErrors.date && <Text className="text-destructive text-xs mt-1 ml-1">{availabilityErrors.date}</Text>}
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-muted-foreground mb-2">Start Time</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={availabilityForm.startTime}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(var(--muted), 1)',
                        color: 'rgba(var(--foreground), 1)',
                        border: availabilityErrors.startTime ? '1px solid #dc2626' : '1px solid rgba(var(--border), 1)',
                        width: '100%',
                        fontSize: 16
                      }}
                    />
                  ) : (
                    <TextInput
                      value={availabilityForm.startTime}
                      onChangeText={(text) => setAvailabilityForm({ ...availabilityForm, startTime: text })}
                      className={`bg-muted text-foreground p-4 rounded-xl border ${availabilityErrors.startTime ? 'border-destructive' : 'border-border'}`}
                      placeholder="09:00"
                    />
                  )}
                  {availabilityErrors.startTime && <Text className="text-destructive text-xs mt-1 ml-1">{availabilityErrors.startTime}</Text>}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-muted-foreground mb-2">End Time</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={availabilityForm.endTime}
                      onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        backgroundColor: 'rgba(var(--muted), 1)',
                        color: 'rgba(var(--foreground), 1)',
                        border: availabilityErrors.endTime ? '1px solid #dc2626' : '1px solid rgba(var(--border), 1)',
                        width: '100%',
                        fontSize: 16
                      }}
                    />
                  ) : (
                    <TextInput
                      value={availabilityForm.endTime}
                      onChangeText={(text) => setAvailabilityForm({ ...availabilityForm, endTime: text })}
                      className={`bg-muted text-foreground p-4 rounded-xl border ${availabilityErrors.endTime ? 'border-destructive' : 'border-border'}`}
                      placeholder="17:00"
                    />
                  )}
                  {availabilityErrors.endTime && <Text className="text-destructive text-xs mt-1 ml-1">{availabilityErrors.endTime}</Text>}
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleAddAvailability}
                className="bg-primary p-4 rounded-xl flex-row items-center justify-center mt-2"
              >
                <Plus color="#ffffff" size={20} />
                <Text className="text-primary-foreground font-bold text-lg ml-2">Add Time Slot</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
          </View>
        </View>
      </Modal>

      {/* Photo Add Modal - Commented out
      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Add Gallery Photo</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setShowPhotoModal(false);
              }}>
                <X color={isDark ? '#94a3b8' : '#475569'} size={24} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Photo URL</Text>
                <TextInput
                  value={photoForm.url}
                  onChangeText={(text) => setPhotoForm({ ...photoForm, url: text })}
                  className="bg-muted text-foreground p-4 rounded-xl border border-border"
                  placeholder="https://example.com/photo.jpg"
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-muted-foreground mb-2">Description (Optional)</Text>
                <TextInput
                  value={photoForm.description}
                  onChangeText={(text) => setPhotoForm({ ...photoForm, description: text })}
                  className="bg-muted text-foreground p-4 rounded-xl border border-border"
                  placeholder="Happy dog playing"
                />
              </View>

              <TouchableOpacity 
                onPress={handleSavePhoto}
                className="bg-primary p-4 rounded-xl flex-row items-center justify-center mt-2"
              >
                <Plus color="#ffffff" size={20} />
                <Text className="text-primary-foreground font-bold text-lg ml-2">Add to Gallery</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: Platform.OS === 'ios' ? 40 : 20 }} />
          </View>
        </View>
      </Modal>
      */}
    </SafeAreaView>
  );
}