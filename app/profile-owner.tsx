import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, Platform, useColorScheme, Modal, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
  Home,
  X,
  Camera,
  Save,
  Phone
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authService, userService, User as UserType, petService, Pet, PetType, Breed, savedProviderService, SavedProvider } from '@/services/petCareService';

export default function ProfileOwnerScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserType | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [uploading, setUploading] = useState(false);
  
  // Profile Edit State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    profileImageUrl: ''
  });

  // Pet CRUD State
  const [showPetModal, setShowPetModal] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [petForm, setPetForm] = useState({
    name: '',
    petTypeId: 0,
    breedId: undefined as number | undefined,
    age: 0,
    weight: 0,
    medicalNotes: '',
    profileImageUrl: ''
  });

  const [savedProviders, setSavedProviders] = useState<SavedProvider[]>([]);

  useEffect(() => {
    loadProfileData();
    loadPets();
    loadPetTypes();
    loadSavedProviders();
  }, []);

  const loadSavedProviders = async () => {
    try {
      const data = await savedProviderService.getSavedProviders();
      setSavedProviders(data);
    } catch (error) {
      console.error('Error loading saved providers:', error);
    }
  };

  const pickImage = async (type: 'profile' | 'pet') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];
      
      if (type === 'profile') {
        try {
          setUploading(true);
          const formData = new FormData();
          formData.append('file', {
            uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
            type: 'image/jpeg',
            name: 'profile.jpg',
          } as any);

          const response = await userService.updateProfilePhoto(formData);
          setUserData(prev => prev ? { ...prev, profileImageUrl: response.url } : null);
          if (Platform.OS === 'web') {
            window.alert('Success: Profile photo updated');
          } else {
            Alert.alert('Success', 'Profile photo updated');
          }
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          Alert.alert('Error', 'Failed to upload profile photo');
        } finally {
          setUploading(false);
        }
      } else {
        setPetForm(prev => ({ ...prev, profileImageUrl: selectedImage.uri }));
      }
    }
  };

  const loadPetTypes = async () => {
    try {
      const types = await petService.getPetTypes();
      setPetTypes(types);
    } catch (error) {
      console.error('Error loading pet types:', error);
    }
  };

  useEffect(() => {
    if (petForm.petTypeId > 0) {
      loadBreeds(petForm.petTypeId);
    }
  }, [petForm.petTypeId]);

  const loadBreeds = async (typeId: number) => {
    try {
      const breedData = await petService.getBreeds(typeId);
      setBreeds(breedData);
    } catch (error) {
      console.error('Error loading breeds:', error);
    }
  };

  const loadPets = async () => {
    try {
      const data = await petService.getMyPets();
      setPets(data);
    } catch (error) {
      console.error('Error loading pets:', error);
    }
  };

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
    if (userData) {
      setProfileForm({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber || '',
        address: userData.address || '',
        profileImageUrl: userData.profileImageUrl || ''
      });
      setShowProfileModal(true);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await userService.updateProfile(profileForm);
      setShowProfileModal(false);
      loadProfileData();
      if (Platform.OS === 'web') {
        window.alert('Success: Profile updated');
      } else {
        Alert.alert('Success', 'Profile updated');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleEditPet = (pet: Pet) => {
    setEditingPet(pet);
    setPetForm({
      name: pet.name,
      petTypeId: pet.petTypeId,
      breedId: pet.breedId,
      age: pet.age || 0,
      weight: pet.weight || 0,
      medicalNotes: pet.medicalNotes || '',
      profileImageUrl: pet.profileImageUrl || ''
    });
    setShowPetModal(true);
  };

  const handleAddPet = () => {
    setEditingPet(null);
    setPetForm({
      name: '',
      petTypeId: petTypes.length > 0 ? petTypes[0].id : 0,
      breedId: undefined,
      age: 0,
      weight: 0,
      medicalNotes: '',
      profileImageUrl: ''
    });
    setShowPetModal(true);
  };

  const handleSavePet = async () => {
    try {
      if (!petForm.name.trim()) {
        Alert.alert('Error', 'Please enter a pet name');
        return;
      }
      if (petForm.petTypeId === 0) {
        Alert.alert('Error', 'Please select a pet type');
        return;
      }

      if (editingPet && editingPet.id) {
        await petService.updatePet(editingPet.id, petForm);
      } else {
        await petService.createPet(petForm);
      }
      setShowPetModal(false);
      loadPets();
      if (Platform.OS === 'web') {
        window.alert('Success: Pet information saved');
      } else {
        Alert.alert('Success', 'Pet information saved');
      }
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet information');
    }
  };

  const handleDeletePet = (petId: number, petName: string) => {
    const performDelete = async () => {
      try {
        await petService.deletePet(petId);
        loadPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
        Alert.alert('Error', 'Failed to delete pet');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove ${petName} from your profile?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Delete Pet',
        `Are you sure you want to remove ${petName} from your profile?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  const handleRemoveSavedProvider = (providerId: number, providerName: string) => {
    const performRemove = async () => {
      try {
        await savedProviderService.unsaveProvider(providerId);
        loadSavedProviders();
      } catch (error) {
        console.error('Error removing saved provider:', error);
        Alert.alert('Error', 'Failed to remove saved provider');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Remove ${providerName} from saved providers?`)) {
        performRemove();
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
            onPress: performRemove,
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
                source={{ uri: userData?.profileImageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' }}
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
                <Text className="text-foreground flex-1 ml-2">{userData?.email}</Text>
              </View>
              {userData?.phoneNumber && (
                <View className="flex-row items-center">
                  <Phone color={isDark ? '#94a3b8' : '#475569'} size={18} />
                  <Text className="text-foreground flex-1 ml-2">{userData.phoneNumber}</Text>
                </View>
              )}
              {userData?.address && (
                <View className="flex-row items-center">
                  <Home color={isDark ? '#94a3b8' : '#475569'} size={18} />
                  <Text className="text-foreground flex-1 ml-2">{userData.address}</Text>
                </View>
              )}
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
            {pets.length === 0 ? (
              <View className="bg-muted rounded-xl p-6 items-center">
                <PawPrint color={isDark ? '#94a3b8' : '#475569'} size={32} />
                <Text className="text-muted-foreground text-center mt-2">No pets added yet</Text>
              </View>
            ) : (
              pets.map((pet) => (
                <View key={pet.id} className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center">
                    <Image
                      source={{ uri: pet.profileImageUrl || 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400' }}
                      className="w-16 h-16 rounded-full"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-lg font-bold text-foreground">{pet.name}</Text>
                      <Text className="text-muted-foreground">
                        {petTypes.find(t => t.id === pet.petTypeId)?.name}
                        {pet.breedId && breeds.find(b => b.id === pet.breedId) ? ` • ${breeds.find(b => b.id === pet.breedId)?.name}` : ''}
                      </Text>
                      <View className="flex-row mt-1">
                        <Text className="text-sm text-muted-foreground">{pet.age} years</Text>
                        <Text className="text-sm text-muted-foreground mx-2">•</Text>
                        <Text className="text-sm text-muted-foreground">{pet.weight} kg</Text>
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => handleEditPet(pet)}>
                        <Edit color={isDark ? '#fb923c' : '#ea580c'} size={18} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => pet.id && handleDeletePet(pet.id, pet.name)}>
                        <Trash2 color={isDark ? '#f87171' : '#dc2626'} size={18} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))
            )}
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
              {savedProviders.map((saved: SavedProvider) => (
                <TouchableOpacity
                  key={saved.id}
                  onPress={() => router.push({ pathname: '/provider-detail', params: { id: saved.providerId } })}
                  className="bg-card rounded-xl border border-border overflow-hidden"
                >
                  <View className="flex-row items-center p-4">
                    <Image
                      source={{ uri: saved.provider?.user?.profileImageUrl || 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400' }}
                      className="w-16 h-16 rounded-lg"
                    />
                    <View className="flex-1 ml-4">
                      <Text className="text-base font-bold text-foreground">{saved.provider?.companyName || saved.provider?.user?.firstName + ' ' + saved.provider?.user?.lastName}</Text>
                      <View className="flex-row items-center mt-1">
                        <Star color="#EAB308" size={14} fill="#EAB308" />
                        <Text className="text-sm text-foreground font-semibold ml-1">4.8</Text>
                      </View>
                      <Text className="text-sm text-muted-foreground mt-1" numberOfLines={1}>
                        {saved.provider?.providerServices?.map(ps => ps.serviceType?.name).join(', ') || 'Various Services'}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveSavedProvider(saved.providerId, saved.provider?.companyName || 'Provider')}>
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

      {/* Profile Edit Modal */}
      <Modal
        visible={showProfileModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowProfileModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowProfileModal(false)}>
                <X color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <TouchableOpacity 
                  className="relative"
                  onPress={() => pickImage('profile')}
                  disabled={uploading}
                >
                  <Image
                    source={{ uri: userData?.profileImageUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' }}
                    className="w-24 h-24 rounded-full"
                  />
                  <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                    {uploading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Camera color="white" size={16} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-foreground font-semibold mb-2">First Name</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="First Name"
                    placeholderTextColor="#94a3b8"
                    value={profileForm.firstName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, firstName: text })}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Last Name</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Last Name"
                    placeholderTextColor="#94a3b8"
                    value={profileForm.lastName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, lastName: text })}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Phone Number</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Phone Number"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={profileForm.phoneNumber}
                    onChangeText={(text) => setProfileForm({ ...profileForm, phoneNumber: text })}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Address</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Address"
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={3}
                    value={profileForm.address}
                    onChangeText={(text) => setProfileForm({ ...profileForm, address: text })}
                  />
                </View>
                
                <View>
                  <Text className="text-foreground font-semibold mb-2">Profile Image URL</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Image URL"
                    placeholderTextColor="#94a3b8"
                    value={profileForm.profileImageUrl}
                    onChangeText={(text) => setProfileForm({ ...profileForm, profileImageUrl: text })}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-primary p-4 rounded-xl items-center mt-8 flex-row justify-center"
              >
                <Save color="white" size={20} className="mr-2" />
                <Text className="text-white font-bold text-lg">Save Profile</Text>
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Pet Edit/Add Modal */}
      <Modal
        visible={showPetModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPetModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 h-[85%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">
                {editingPet ? 'Edit Pet' : 'Add New Pet'}
              </Text>
              <TouchableOpacity onPress={() => setShowPetModal(false)}>
                <X color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="items-center mb-6">
                <TouchableOpacity 
                  className="relative"
                  onPress={() => pickImage('pet')}
                >
                  <Image
                    source={{ uri: petForm.profileImageUrl || 'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?w=400' }}
                    className="w-24 h-24 rounded-full"
                  />
                  <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                    <Camera color="white" size={16} />
                  </View>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                <View>
                  <Text className="text-foreground font-semibold mb-2">Pet Name</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Name"
                    placeholderTextColor="#94a3b8"
                    value={petForm.name}
                    onChangeText={(text) => setPetForm({ ...petForm, name: text })}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Pet Type</Text>
                  <View className="bg-card rounded-xl border border-border overflow-hidden">
                    <Picker
                      selectedValue={petForm.petTypeId}
                      onValueChange={(itemValue) => setPetForm({ ...petForm, petTypeId: itemValue, breedId: undefined })}
                      style={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                      dropdownIconColor={isDark ? '#f8fafc' : '#1e293b'}
                    >
                      {petTypes.map((type) => (
                        <Picker.Item key={type.id} label={type.name} value={type.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Breed</Text>
                  <View className="bg-card rounded-xl border border-border overflow-hidden">
                    <Picker
                      selectedValue={petForm.breedId}
                      onValueChange={(itemValue) => setPetForm({ ...petForm, breedId: itemValue })}
                      style={{ color: isDark ? '#f8fafc' : '#1e293b' }}
                      dropdownIconColor={isDark ? '#f8fafc' : '#1e293b'}
                    >
                      <Picker.Item label="Select Breed" value={undefined} />
                      {breeds.map((breed) => (
                        <Picker.Item key={breed.id} label={breed.name} value={breed.id} />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold mb-2">Age (Years)</Text>
                    <TextInput
                      className="bg-card p-4 rounded-xl border border-border text-foreground"
                      placeholder="Age"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      value={petForm.age.toString()}
                      onChangeText={(text) => setPetForm({ ...petForm, age: parseInt(text) || 0 })}
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-semibold mb-2">Weight (kg)</Text>
                    <TextInput
                      className="bg-card p-4 rounded-xl border border-border text-foreground"
                      placeholder="Weight"
                      placeholderTextColor="#94a3b8"
                      keyboardType="numeric"
                      value={petForm.weight.toString()}
                      onChangeText={(text) => setPetForm({ ...petForm, weight: parseFloat(text) || 0 })}
                    />
                  </View>
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Medical Notes</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Medical history, allergies, etc."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={4}
                    value={petForm.medicalNotes}
                    onChangeText={(text) => setPetForm({ ...petForm, medicalNotes: text })}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Profile Image URL</Text>
                  <TextInput
                    className="bg-card p-4 rounded-xl border border-border text-foreground"
                    placeholder="Image URL"
                    placeholderTextColor="#94a3b8"
                    value={petForm.profileImageUrl}
                    onChangeText={(text) => setPetForm({ ...petForm, profileImageUrl: text })}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSavePet}
                className="bg-primary p-4 rounded-xl items-center mt-8 flex-row justify-center"
              >
                <Save color="white" size={20} className="mr-2" />
                <Text className="text-white font-bold text-lg">
                  {editingPet ? 'Update Pet' : 'Add Pet'}
                </Text>
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}