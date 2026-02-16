import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Switch, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, Building2, User, Phone, Mail, Lock, Globe, FileText, CheckCircle2, ArrowRight, Award, Scissors, Dog, Home as HomeIcon, Award as TrainingIcon, Stethoscope, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService, providerService, serviceTypeService, ServiceType } from '@/services/petCareService';
import { MultiSelect } from '@/components/MultiSelect';
import { USER_ROLE } from '@/constants/status';

export default function RegisterProviderScreen() {
  const router = useRouter();
  
  // Form state
  const [businessName, setBusinessName] = useState('');
  const [ownerFirstName, setOwnerFirstName] = useState('');
  const [ownerLastName, setOwnerLastName] = useState('');
  const [isLicensed, setIsLicensed] = useState(false);
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<number[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const types = await serviceTypeService.getServiceTypes();
        setServiceTypes(types);
      } catch (error) {
        console.error('Failed to fetch service types:', error);
      } finally {
        setLoadingServiceTypes(false);
      }
    };

    fetchServiceTypes();
  }, []);

  const toggleServiceType = (id: number) => {
    setSelectedServiceTypeIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!ownerFirstName.trim()) newErrors.ownerFirstName = 'Owner first name is required';
    if (!ownerLastName.trim()) newErrors.ownerLastName = 'Owner last name is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!address.trim()) newErrors.address = 'Address is required';
    
    if (!businessPhone.trim()) {
      newErrors.businessPhone = 'Business phone is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(businessPhone.replace(/[\s()-]/g, ''))) {
      newErrors.businessPhone = 'Invalid phone number (e.g. +1234567890)';
    }

    if (!businessEmail.trim()) {
      newErrors.businessEmail = 'Business email is required';
    } else if (!/\S+@\S+\.\S+/.test(businessEmail)) {
      newErrors.businessEmail = 'Email is invalid';
    }

    if (selectedServiceTypeIds.length === 0) {
      newErrors.services = 'Select at least one service type';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Min 8 chars, 1 upper, 1 lower, 1 number, 1 special';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password)) {
      newErrors.password = 'Min 8 chars, 1 upper, 1 lower, 1 number, 1 special';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 1. Register User
      await authService.register({
        email: businessEmail,
        password,
        firstName: ownerFirstName,
        lastName: ownerLastName,
        roleId: USER_ROLE.PROVIDER
      });

      // 2. Login to get token
      await authService.login({
        email: businessEmail,
        password
      });

      // 3. Create Provider Profile
      await providerService.createProvider({
        companyName: businessName,
        description: businessDescription,
        serviceTypeIds: selectedServiceTypeIds,
        hourlyRate: 50, // Default or add to form
        address: address,
        city: city,
        latitude: 0,
        longitude: 0
      });

      if (Platform.OS === 'web') {
        window.alert('Success! 🎉: Your business account has been created successfully. Please sign in to continue.');
        router.push('/');
      } else {
        Alert.alert(
          'Success! 🎉',
          'Your business account has been created successfully. Please sign in to continue.',
          [
            {
              text: 'Sign In',
              onPress: () => router.push('/'),
            },
          ]
        );
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        window.alert(`Error: ${error.message || 'Registration failed'}`);
      } else {
        Alert.alert('Error', error.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-muted rounded-full p-2"
          >
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <ThemeToggle />
        </View>

        {/* Title Section */}
        <View className="px-6 mb-8">
          <View className="bg-primary/10 self-start rounded-full px-4 py-2 mb-4">
            <Text className="text-primary font-semibold text-sm">Service Provider Registration</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Register Your Business
          </Text>
          <Text className="text-base text-muted-foreground">
            Join PetCare Connect and grow your pet care business by reaching more clients
          </Text>
        </View>

        {/* Registration Form */}
        <View className="px-6 gap-5">
          {/* Business Information Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Business Information</Text>
            
            {/* Business Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Business Name <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.businessName ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Building2 className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g., Happy Paws Pet Care"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.businessName && <Text className="text-destructive text-xs mt-1 ml-1">{errors.businessName}</Text>}
            </View>

            {/* Owner First Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Owner First Name <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.ownerFirstName ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={ownerFirstName}
                  onChangeText={setOwnerFirstName}
                  placeholder="Enter owner's first name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.ownerFirstName && <Text className="text-destructive text-xs mt-1 ml-1">{errors.ownerFirstName}</Text>}
            </View>

            {/* Owner Last Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Owner Last Name <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.ownerLastName ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={ownerLastName}
                  onChangeText={setOwnerLastName}
                  placeholder="Enter owner's last name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.ownerLastName && <Text className="text-destructive text-xs mt-1 ml-1">{errors.ownerLastName}</Text>}
            </View>

            {/* Is Licensed Toggle */}
            <View className="mb-4 bg-card border border-border rounded-xl p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-3 flex-1">
                  <Award className="text-primary" size={20} />
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      Licensed Business
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      Are you a licensed pet care provider?
                    </Text>
                  </View>
                </View>
                <Switch
                  value={isLicensed}
                  onValueChange={setIsLicensed}
                  trackColor={{ false: '#D1D5DB', true: '#FED7AA' }}
                  thumbColor={isLicensed ? '#EA580C' : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Business Phone */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Business Phone <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.businessPhone ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Phone className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={businessPhone}
                  onChangeText={setBusinessPhone}
                  placeholder="+1234567890"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.businessPhone && <Text className="text-destructive text-xs mt-1 ml-1">{errors.businessPhone}</Text>}
            </View>

            {/* Business Email */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Business Email <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.businessEmail ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Mail className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={businessEmail}
                  onChangeText={setBusinessEmail}
                  placeholder="business@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.businessEmail && <Text className="text-destructive text-xs mt-1 ml-1">{errors.businessEmail}</Text>}
            </View>

            {/* Website (Optional) */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Website <Text className="text-muted-foreground text-xs">(Optional)</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                <Globe className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://www.yourbusiness.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="url"
                  autoCapitalize="none"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>

            {/* City */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                City <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.city ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <MapPin className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g., New York"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.city && <Text className="text-destructive text-xs mt-1 ml-1">{errors.city}</Text>}
            </View>

            {/* Business Address */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Business Address <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.address ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <MapPin className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  placeholder="e.g., 456 Business Ave, Suite 101"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.address && <Text className="text-destructive text-xs mt-1 ml-1">{errors.address}</Text>}
            </View>
          </View>

          {/* Service Types Section */}
          <View>
            {loadingServiceTypes ? (
              <ActivityIndicator size="small" color="#EA580C" />
            ) : (
              <>
                <MultiSelect
                  label="Services Offered"
                  options={serviceTypes}
                  selectedValues={selectedServiceTypeIds}
                  onValueChange={setSelectedServiceTypeIds}
                  placeholder="Choose services your business provides"
                />
                {errors.services && <Text className="text-destructive text-xs mt-1 ml-1">{errors.services}</Text>}
              </>
            )}
            <Text className="text-xs text-muted-foreground mt-2 px-1">
              Select all services your business provides. You can select multiple.
            </Text>
          </View>

          {/* Business Description */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">
              About Your Business
            </Text>
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Business Description <Text className="text-destructive">*</Text>
              </Text>
              <View className="bg-card border border-border rounded-xl px-4 py-3">
                <TextInput
                  value={businessDescription}
                  onChangeText={setBusinessDescription}
                  placeholder="Tell pet owners about your business, experience, and what makes you special..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-foreground text-base min-h-[100px]"
                />
              </View>
              <Text className="text-xs text-muted-foreground mt-1">
                {businessDescription.length}/500 characters
              </Text>
            </View>
          </View>

          {/* Account Credentials Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Account Credentials</Text>
            
            {/* Password */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Password <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.password ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Lock className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.password ? (
                <Text className="text-destructive text-[10px] mt-1 ml-1">{errors.password}</Text>
              ) : (
                <Text className="text-xs text-muted-foreground mt-1">
                  Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
                </Text>
              )}
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Confirm Password <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.confirmPassword ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Lock className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.confirmPassword && <Text className="text-destructive text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
            </View>
          </View>

          {/* Benefits Section */}
          <View className="bg-muted rounded-2xl p-5">
            <Text className="text-base font-bold text-foreground mb-3">
              Provider Benefits
            </Text>
            <View className="gap-3">
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Reach thousands of pet owners in your area
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Manage appointments and availability easily
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Accept payments and generate invoices
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Build your reputation with reviews and ratings
                </Text>
              </View>
            </View>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            className={`rounded-xl py-4 flex-row items-center justify-center gap-2 mt-2 ${
              loading ? 'bg-muted' : 'bg-primary'
            }`}
          >
            <Text className={`font-bold text-base ${loading ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
              {loading ? 'Creating Account...' : 'Register Business'}
            </Text>
            {!loading && <ArrowRight className="text-primary-foreground" size={20} />}
          </TouchableOpacity>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center gap-2 mt-4">
            <Text className="text-muted-foreground text-sm">
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text className="text-primary font-semibold text-sm">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms & Privacy */}
        <View className="px-6 mt-8">
          <Text className="text-xs text-muted-foreground text-center leading-5">
            By registering your business, you agree to our{' '}
            <Text className="text-primary font-semibold">Terms of Service</Text>,{' '}
            <Text className="text-primary font-semibold">Provider Agreement</Text>, and{' '}
            <Text className="text-primary font-semibold">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}