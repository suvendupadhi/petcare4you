import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin,
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
  Trash2
} from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

// Mock data - replace with API calls
const mockUserData = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main Street, San Francisco, CA 94102',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  memberSince: 'January 2024',
};

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
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(mockUserData);
  const [pets, setPets] = useState(mockPets);
  const [savedProviders, setSavedProviders] = useState(mockSavedProviders);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/owner/profile');
      // const data = await response.json();
      // setUserData(data.user);
      // setPets(data.pets);
      // setSavedProviders(data.savedProviders);
      
      setTimeout(() => setLoading(false), 1000);
    } catch (error) {
      console.error('Error loading profile:', error);
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    // TODO: Navigate to edit profile screen
    Alert.alert('Edit Profile', 'Navigate to edit profile screen');
  };

  const handleEditPet = (petId: string) => {
    // TODO: Navigate to edit pet screen
    Alert.alert('Edit Pet', `Navigate to edit pet ${petId} screen`);
  };

  const handleAddPet = () => {
    // TODO: Navigate to add pet screen
    Alert.alert('Add Pet', 'Navigate to add pet screen');
  };

  const handleDeletePet = (petId: string, petName: string) => {
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
  };

  const handleRemoveSavedProvider = (providerId: string, providerName: string) => {
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
          <Text className="text-xl font-bold text-foreground">My Profile</Text>
          <ThemeToggle />
        </View>

        {/* Profile Card */}
        <View className="px-6 mb-6">
          <View className="bg-card rounded-2xl p-6 border border-border">
            <View className="flex-row items-center">
              <Image
                source={{ uri: userData.avatar }}
                className="w-20 h-20 rounded-full"
              />
              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-foreground">{userData.name}</Text>
                <Text className="text-muted-foreground mt-1">Member since {userData.memberSince}</Text>
              </View>
              <TouchableOpacity onPress={handleEditProfile}>
                <Edit className="text-primary" size={20} />
              </TouchableOpacity>
            </View>

            <View className="mt-6 gap-3">
              <View className="flex-row items-center">
                <Mail className="text-muted-foreground mr-3" size={18} />
                <Text className="text-foreground flex-1">{userData.email}</Text>
              </View>
              <View className="flex-row items-center">
                <Phone className="text-muted-foreground mr-3" size={18} />
                <Text className="text-foreground flex-1">{userData.phone}</Text>
              </View>
              <View className="flex-row items-center">
                <MapPin className="text-muted-foreground mr-3" size={18} />
                <Text className="text-foreground flex-1">{userData.address}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* My Pets Section */}
        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <PawPrint className="text-primary mr-2" size={20} />
              <Text className="text-lg font-bold text-foreground">My Pets</Text>
            </View>
            <TouchableOpacity onPress={handleAddPet} className="flex-row items-center">
              <Plus className="text-primary mr-1" size={18} />
              <Text className="text-primary font-semibold">Add Pet</Text>
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
                      <Edit className="text-primary" size={18} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePet(pet.id, pet.name)}>
                      <Trash2 className="text-destructive" size={18} />
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
            <Heart className="text-primary mr-2" size={20} />
            <Text className="text-lg font-bold text-foreground">Saved Providers</Text>
          </View>

          {savedProviders.length === 0 ? (
            <View className="bg-muted rounded-xl p-6 items-center">
              <Heart className="text-muted-foreground mb-2" size={32} />
              <Text className="text-muted-foreground text-center">No saved providers yet</Text>
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
                        <Star className="text-yellow-500 mr-1" size={14} />
                        <Text className="text-sm text-foreground font-semibold">{provider.rating}</Text>
                      </View>
                      <Text className="text-sm text-muted-foreground mt-1">{provider.services}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveSavedProvider(provider.id, provider.name)}>
                      <Heart className="text-destructive" size={20} fill="currentColor" />
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