import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  Mail, 
  Edit,
  PawPrint,
  Heart,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Plus,
  Star,
  Trash2,
  CreditCard,
  Home
} from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authService, userService, User as UserType } from '@/services/petCareService';

// Mock data - replace with API calls
/*
const mockUserData = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street, San Francisco, CA 94102',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  memberSince: 'January 2024',
};
*/

const mockPets = [
  {
    id: '1',
    name: 'Max',
    type: 'Dog',
    breed: 'Golden Retriever',
    age: '3 years',
    weight: '32 kg',
    photo: 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400',
  },
  {
    id: '2',
    name: 'Luna',
    type: 'Cat',
    breed: 'Persian',
    age: '2 years',
    weight: '4 kg',
    photo: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400',
  },
];

const mockSavedProviders = [
  {
    id: '1',
    name: 'Happy Paws Grooming',
    rating: 4.8,
    services: 'Grooming, Bathing',
    photo: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=400',
  },
  {
    id: '2',
    name: 'Pawsitive Care Veterinary',
    rating: 4.9,
    services: 'Veterinary, Emergency',
    photo: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=400',
  },
];

export default function ProfileOwnerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [pets, setPets] = useState(mockPets);
  const [savedProviders, setSavedProviders] = useState(mockSavedProviders);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const user = await userService.getCurrentUser();
      setUserData(user);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    if (Platform.OS === 'web') {
      window.alert('Navigate to edit profile screen');
    } else {
      Alert.alert('Edit Profile', 'Navigate to edit profile screen');
    }
  };

  const handleEditPet = (petId: string) => {
    // TODO: Navigate to edit pet screen
    if (Platform.OS === 'web') {
      window.alert(`Navigate to edit pet ${petId} screen`);
    } else {
      Alert.alert('Edit Pet', `Navigate to edit pet ${petId} screen`);
    }
  };

  const handleAddPet = () => {
    // TODO: Navigate to add pet screen
    if (Platform.OS === 'web') {
      window.alert('Navigate to add pet screen');
    } else {
      Alert.alert('Add Pet', 'Navigate to add pet screen');
    }
  };

  const handleDeletePet = (petId: string, petName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove ${petName} from your profile?`)) {
        setPets(pets.filter(p => p.id !== petId));
      }
    } else {
      Alert.alert(
        'Delete Pet',
        `Are you sure you want to remove ${petName} from your profile?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              // TODO: API call to delete pet
              setPets(pets.filter(p => p.id !== petId));
            },
          },
        ]
      );
    }
  };

  const handleRemoveSavedProvider = (providerId: string, providerName: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${providerName} from saved providers?`)) {
        setSavedProviders(savedProviders.filter(p => p.id !== providerId));
      }
    } else {
      Alert.alert(
        'Remove Provider',
        `Remove ${providerName} from saved providers?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => {
              // TODO: API call to remove saved provider
              setSavedProviders(savedProviders.filter(p => p.id !== providerId));
            },
          },
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
        {/* Header */}
        <View className="p-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">My Profile</Text>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={() => router.push('/owner-dashboard')}
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

        {/* Profile Card */}
        <View className="px-6 mb-6">
          <View className="bg-card rounded-2xl p-6 border border-border">
            <View className="flex-row items-center">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' }}
                className="w-20 h-20 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-foreground">{userData?.firstName} {userData?.lastName}</Text>
                <Text className="text-muted-foreground mt-1">Pet Owner</Text>
              </View>
              <TouchableOpacity onPress={handleEditProfile}>
                <Edit color={isDark ? '#fb923c' : '#ea580c'} size={20} />
              </TouchableOpacity>
            </View>

            <View className="mt-6 gap-3">
              <View className="flex-row items-center">
                <Mail color={isDark ? '#94a3b8' : '#475569'} size={18} />
                <Text className="text-foreground flex-1">{userData?.email}</Text>
              </View>
              {/* Phone and Address not in current User model but can be added later */}
            </View>
          </View>
        </View>

        {/* My Pets Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <PawPrint color={isDark ? '#fb923c' : '#ea580c'} size={20} />
              <Text className="text-lg font-bold text-foreground ml-2">My Pets</Text>
            </View>
            <TouchableOpacity onPress={handleAddPet} className="flex-row items-center">
              <Plus color={isDark ? '#fb923c' : '#ea580c'} size={18} />
              <Text className="text-primary font-semibold ml-1">Add Pet</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {pets.map((pet) => (
              <View key={pet.id} className="bg-card rounded-xl p-4 border border-border">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: pet.photo }}
                    className="w-16 h-16 rounded-full"
                  />
                  <View className="flex-1 ml-4">
                    <Text className="text-lg font-bold text-foreground">{pet.name}</Text>
                    <Text className="text-muted-foreground">{pet.breed}</Text>
                    <View className="flex-row mt-1">
                      <Text className="text-sm text-muted-foreground">{pet.age}</Text>
                      <Text className="text-sm text-muted-foreground mx-2">•</Text>
                      <Text className="text-sm text-muted-foreground">{pet.weight}</Text>
                    </View>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity onPress={() => handleEditPet(pet.id)}>
                      <Edit color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePet(pet.id, pet.name)}>
                      <Trash2 color={isDark ? '#f87171' : '#dc2626'} size={18} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Saved Providers Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center mb-4">
            <Heart color={isDark ? '#fb923c' : '#ea580c'} size={20} />
            <Text className="text-lg font-bold text-foreground ml-2">Saved Providers</Text>
          </View>

          {savedProviders.length === 0 ? (
            <View className="bg-muted rounded-xl p-6 items-center">
              <Heart color={isDark ? '#94a3b8' : '#475569'} size={32} />
              <Text className="text-muted-foreground text-center mt-2">No saved providers yet</Text>
            </View>
          ) : (
            <View className="gap-3">
              {savedProviders.map((provider) => (
                <TouchableOpacity
                  key={provider.id}
                  onPress={() => router.push('/provider-detail')}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <View className="flex-row items-center p-4">
                    <Image
                      source={{ uri: provider.photo }}
                      className="w-16 h-16 rounded-lg"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-base font-bold text-foreground">{provider.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Star color="#EAB308" size={14} fill="#EAB308" />
                        <Text className="text-sm text-foreground font-semibold ml-1">{provider.rating}</Text>
                      </View>
                      <Text className="text-sm text-muted-foreground mt-1">{provider.services}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveSavedProvider(provider.id, provider.name)}>
                      <Heart color="#f87171" size={20} fill="#f87171" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Settings Section */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">Settings</Text>

          <View className="gap-2">
            <TouchableOpacity 
              onPress={() => router.push('/payment-invoice')}
              className="bg-card rounded-xl border border-border"
            >
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <CreditCard color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                  <Text className="text-foreground ml-3">Payments & Invoices</Text>
                </View>
                <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Bell color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                  <Text className="text-foreground ml-3">Notifications</Text>
                </View>
                <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <Shield color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                  <Text className="text-foreground ml-3">Privacy & Security</Text>
                </View>
                <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card rounded-xl border border-border">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <HelpCircle color={isDark ? '#f8fafc' : '#1e293b'} size={20} />
                  <Text className="text-foreground ml-3">Help & Support</Text>
                </View>
                <ChevronRight color={isDark ? '#94a3b8' : '#475569'} size={20} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-card rounded-xl border border-destructive"
            >
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center flex-1">
                  <LogOut color={isDark ? '#f87171' : '#dc2626'} size={20} />
                  <Text className="text-destructive font-semibold ml-3">Logout</Text>
                </View>
                <ChevronRight color={isDark ? '#f87171' : '#dc2626'} size={20} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}