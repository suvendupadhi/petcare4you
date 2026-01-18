import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
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
  X
} from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

// Mock data - replace with API calls
const mockBusinessData = {
  id: '1',
  businessName: 'Happy Paws Grooming',
  ownerName: 'John Smith',
  email: 'john@happypaws.com',
  phone: '+1 (555) 987-6543',
  address: '456 Pet Street, San Francisco, CA 94103',
  description: 'Professional pet grooming services with over 10 years of experience. We specialize in all breeds and provide a stress-free environment for your pets.',
  rating: 4.8,
  reviewCount: 127,
  memberSince: 'March 2023',
  logo: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400',
};

const mockServices = [
  {
    id: '1',
    name: 'Basic Grooming',
    description: 'Bath, brush, nail trim, ear cleaning',
    duration: '60 min',
    price: 45,
  },
  {
    id: '2',
    name: 'Full Grooming Package',
    description: 'Complete grooming with haircut and styling',
    duration: '120 min',
    price: 85,
  },
  {
    id: '3',
    name: 'Nail Trim Only',
    description: 'Quick nail trimming service',
    duration: '15 min',
    price: 15,
  },
];

const mockBusinessHours = [
  { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM' },
  { day: 'Saturday', hours: '10:00 AM - 4:00 PM' },
  { day: 'Sunday', hours: 'Closed' },
];

const mockPhotos = [
  'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400',
  'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=400',
  'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
];

export default function ProfileProviderScreen() {
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [businessData, setBusinessData] = useState(mockBusinessData);
  const [services, setServices] = useState(mockServices);
  const [businessHours, setBusinessHours] = useState(mockBusinessHours);
  const [photos, setPhotos] = useState(mockPhotos);

  // Edit form state
  const [editForm, setEditForm] = useState({
    businessName: mockBusinessData.businessName,
    ownerName: mockBusinessData.ownerName,
    email: mockBusinessData.email,
    phone: mockBusinessData.phone,
    address: mockBusinessData.address,
    description: mockBusinessData.description,
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/provider/profile');
      // const data = await response.json();
      // setBusinessData(data.business);
      // setServices(data.services);
      // setBusinessHours(data.hours);
      // setPhotos(data.photos);
      
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: API call to update profile
      // await fetch('/api/provider/profile', {
      //   method: 'PUT',
      //   body: JSON.stringify(editForm)
      // });
      
      setBusinessData({ ...businessData, ...editForm });
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      businessName: businessData.businessName,
      ownerName: businessData.ownerName,
      email: businessData.email,
      phone: businessData.phone,
      address: businessData.address,
      description: businessData.description,
    });
    setEditMode(false);
  };

  const handleEditService = (serviceId: string) => {
    // TODO: Navigate to edit service screen
    Alert.alert('Edit Service', `Navigate to edit service ${serviceId} screen`);
  };

  const handleAddService = () => {
    // TODO: Navigate to add service screen
    Alert.alert('Add Service', 'Navigate to add service screen');
  };

  const handleDeleteService = (serviceId: string, serviceName: string) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to remove ${serviceName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: API call to delete service
            setServices(services.filter(s => s.id !== serviceId));
          },
        },
      ]
    );
  };

  const handleAddPhoto = () => {
    // TODO: Open image picker
    Alert.alert('Add Photo', 'Open image picker to add business photos');
  };

  const handleDeletePhoto = (photoUrl: string) => {
    Alert.alert(
      'Delete Photo',
      'Remove this photo from your gallery?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: API call to delete photo
            setPhotos(photos.filter(p => p !== photoUrl));
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Clear auth tokens and navigate to login
            router.replace('/');
          },
        },
      ]
    );
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
      <ScrollView contentContainerStyle={{ paddingBottom: 128 }}>
        {/* Header */}
        <View className="p-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Business Profile</Text>
          <ThemeToggle />
        </View>

        {/* Business Info Card */}
        <View className="px-6 mb-6">
          <View className="bg-card rounded-2xl p-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center flex-1">
                <Image
                  source={{ uri: businessData.logo }}
                  className="w-20 h-20 rounded-xl"
                />
                <View className="flex-1 ml-4">
                  {editMode ? (
                    <TextInput
                      value={editForm.businessName}
                      onChangeText={(text) => setEditForm({ ...editForm, businessName: text })}
                      className="text-xl font-bold text-foreground bg-muted rounded-lg px-3 py-2 mb-2"
                      placeholder="Business Name"
                    />
                  ) : (
                    <Text className="text-xl font-bold text-foreground">{businessData.businessName}</Text>
                  )}
                  <View className="flex-row items-center mt-1">
                    <Star className="text-yellow-500 mr-1" size={16} />
                    <Text className="text-foreground font-semibold">{businessData.rating}</Text>
                    <Text className="text-muted-foreground ml-1">({businessData.reviewCount} reviews)</Text>
                  </View>
                  <Text className="text-muted-foreground text-sm mt-1">Member since {businessData.memberSince}</Text>
                </View>
              </View>
              {!editMode && (
                <TouchableOpacity onPress={() => setEditMode(true)}>
                  <Edit className="text-primary" size={20} />
                </TouchableOpacity>
              )}
            </View>

            {editMode ? (
              <View className="gap-3">
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Owner Name</Text>
                  <TextInput
                    value={editForm.ownerName}
                    onChangeText={(text) => setEditForm({ ...editForm, ownerName: text })}
                    className="text-foreground bg-muted rounded-lg px-3 py-2"
                    placeholder="Owner Name"
                  />
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Email</Text>
                  <TextInput
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    className="text-foreground bg-muted rounded-lg px-3 py-2"
                    placeholder="Email"
                    keyboardType="email-address"
                  />
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Phone</Text>
                  <TextInput
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                    className="text-foreground bg-muted rounded-lg px-3 py-2"
                    placeholder="Phone"
                    keyboardType="phone-pad"
                  />
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Address</Text>
                  <TextInput
                    value={editForm.address}
                    onChangeText={(text) => setEditForm({ ...editForm, address: text })}
                    className="text-foreground bg-muted rounded-lg px-3 py-2"
                    placeholder="Address"
                    multiline
                  />
                </View>
                <View>
                  <Text className="text-sm text-muted-foreground mb-1">Description</Text>
                  <TextInput
                    value={editForm.description}
                    onChangeText={(text) => setEditForm({ ...editForm, description: text })}
                    className="text-foreground bg-muted rounded-lg px-3 py-2"
                    placeholder="Business Description"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View className="flex-row gap-3 mt-2">
                  <TouchableOpacity 
                    onPress={handleSaveProfile}
                    className="flex-1 bg-primary rounded-lg py-3 flex-row items-center justify-center"
                  >
                    <Save className="text-primary-foreground mr-2" size={18} />
                    <Text className="text-primary-foreground font-semibold">Save Changes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={handleCancelEdit}
                    className="flex-1 bg-muted rounded-lg py-3 flex-row items-center justify-center"
                  >
                    <X className="text-foreground mr-2" size={18} />
                    <Text className="text-foreground font-semibold">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="gap-3">
                <View className="flex-row items-center">
                  <Building2 className="text-muted-foreground mr-3" size={18} />
                  <Text className="text-foreground flex-1">{businessData.ownerName}</Text>
                </View>
                <View className="flex-row items-center">
                  <Mail className="text-muted-foreground mr-3" size={18} />
                  <Text className="text-foreground flex-1">{businessData.email}</Text>
                </View>
                <View className="flex-row items-center">
                  <Phone className="text-muted-foreground mr-3" size={18} />
                  <Text className="text-foreground flex-1">{businessData.phone}</Text>
                </View>
                <View className="flex-row items-center">
                  <MapPin className="text-muted-foreground mr-3" size={18} />
                  <Text className="text-foreground flex-1">{businessData.address}</Text>
                </View>
                <View className="mt-2 pt-3 border-t border-border">
                  <Text className="text-foreground">{businessData.description}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Services Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <DollarSign className="text-primary mr-2" size={20} />
              <Text className="text-lg font-bold text-foreground">Services & Pricing</Text>
            </View>
            <TouchableOpacity onPress={handleAddService} className="flex-row items-center">
              <Plus className="text-primary mr-1" size={18} />
              <Text className="text-primary font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {services.map((service) => (
              <View key={service.id} className="bg-card rounded-xl p-4 border border-border">
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-foreground">{service.name}</Text>
                    <Text className="text-muted-foreground mt-1">{service.description}</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleEditService(service.id)}>
                      <Edit className="text-primary" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteService(service.id, service.name)}>
                      <Trash2 className="text-destructive" size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                  <View className="flex-row items-center">
                    <Clock className="text-muted-foreground mr-2" size={16} />
                    <Text className="text-sm text-muted-foreground">{service.duration}</Text>
                  </View>
                  <Text className="text-xl font-bold text-primary">${service.price}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Business Hours */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Clock className="text-primary mr-2" size={20} />
              <Text className="text-lg font-bold text-foreground">Business Hours</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/manage-availability')}>
              <Text className="text-primary font-semibold">Edit</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-card rounded-xl p-4 border border-border gap-3">
            {businessHours.map((item, index) => (
              <View key={index} className="flex-row items-center justify-between">
                <Text className="text-foreground font-semibold">{item.day}</Text>
                <Text className="text-muted-foreground">{item.hours}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Photo Gallery */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Camera className="text-primary mr-2" size={20} />
              <Text className="text-lg font-bold text-foreground">Photo Gallery</Text>
            </View>
            <TouchableOpacity onPress={handleAddPhoto} className="flex-row items-center">
              <Plus className="text-primary mr-1" size={18} />
              <Text className="text-primary font-semibold">Add</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3">
            {photos.map((photo, index) => (
              <View key={index} className="basis-[48%] relative">
                <Image
                  source={{ uri: photo }}
                  className="w-full h-40 rounded-xl"
                />
                <TouchableOpacity 
                  onPress={() => handleDeletePhoto(photo)}
                  className="absolute top-2 right-2 bg-destructive rounded-full p-1.5"
                >
                  <Trash2 className="text-white" size={14} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Settings</Text>

          <View className="gap-2">
            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Bell className="text-foreground mr-3" size={20} />
                  <Text className="text-foreground">Notifications</Text>
                </View>
                <ChevronRight className="text-muted-foreground" size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Shield className="text-foreground mr-3" size={20} />
                  <Text className="text-foreground">Privacy & Security</Text>
                </View>
                <ChevronRight className="text-muted-foreground" size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <HelpCircle className="text-foreground mr-3" size={20} />
                  <Text className="text-foreground">Help & Support</Text>
                </View>
                <ChevronRight className="text-muted-foreground" size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-card rounded-xl border border-destructive"
            >
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <LogOut className="text-destructive mr-3" size={20} />
                  <Text className="text-destructive font-semibold">Logout</Text>
                </View>
                <ChevronRight className="text-destructive" size={20} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}