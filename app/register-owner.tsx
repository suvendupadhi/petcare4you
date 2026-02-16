import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, User, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/petCareService';
import { USER_ROLE } from '@/constants/status';
import CountryCodePicker from '@/components/CountryCodePicker';
import { countries, Country } from '@/constants/countries';

export default function RegisterOwnerScreen() {
  const router = useRouter();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    
    const phoneDigits = contactNumber.replace(/[\s()-]/g, '');
    if (!phoneDigits.trim()) {
      newErrors.contactNumber = 'Phone number is required';
    } else if (!/^\d{1,14}$/.test(phoneDigits)) {
      newErrors.contactNumber = 'Invalid phone number';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
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
      const fullPhoneNumber = `${selectedCountry.dialCode}${contactNumber.replace(/[\s()-]/g, '')}`;
      await authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: fullPhoneNumber,
        roleId: USER_ROLE.OWNER
      });
      
      if (Platform.OS === 'web') {
        window.alert('Success! 🎉: Your account has been created successfully. Please sign in to continue.');
        router.push('/');
      } else {
        Alert.alert(
          'Success! 🎉',
          'Your account has been created successfully. Please sign in to continue.',
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
            <Text className="text-primary font-semibold text-sm">Pet Owner Registration</Text>
          </View>
          <Text className="text-3xl font-bold text-foreground mb-2">
            Create Your Account
          </Text>
          <Text className="text-base text-muted-foreground">
            Join PetCare Connect to book trusted pet care services for your furry friends
          </Text>
        </View>

        {/* Registration Form */}
        <View className="px-6 gap-5">
          {/* Personal Information Section */}
          <View>
            <Text className="text-lg font-bold text-foreground mb-4">Personal Information</Text>
            
            {/* First Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                First Name <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.firstName ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.firstName && <Text className="text-destructive text-xs mt-1 ml-1">{errors.firstName}</Text>}
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Last Name <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.lastName ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.lastName && <Text className="text-destructive text-xs mt-1 ml-1">{errors.lastName}</Text>}
            </View>

            {/* Contact Number */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Contact Number <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row">
                <CountryCodePicker 
                  selectedCountry={selectedCountry} 
                  onSelect={setSelectedCountry} 
                  error={!!errors.contactNumber}
                />
                <View className={`flex-1 flex-row items-center bg-card border ${errors.contactNumber ? 'border-destructive' : 'border-border'} rounded-r-xl px-4 py-3 border-l-0`}>
                  <TextInput
                    value={contactNumber}
                    onChangeText={setContactNumber}
                    placeholder="123 456 7890"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    className="flex-1 text-foreground text-base"
                  />
                </View>
              </View>
              {errors.contactNumber && <Text className="text-destructive text-xs mt-1 ml-1">{errors.contactNumber}</Text>}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Email Address <Text className="text-destructive">*</Text>
              </Text>
              <View className={`flex-row items-center bg-card border ${errors.email ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3`}>
                <Mail className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="flex-1 text-foreground text-base"
                />
              </View>
              {errors.email && <Text className="text-destructive text-xs mt-1 ml-1">{errors.email}</Text>}
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
              Your Benefits
            </Text>
            <View className="gap-3">
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Search and book trusted pet care services near you
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Manage appointments and get reminders
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Read reviews and ratings from other pet owners
                </Text>
              </View>
              <View className="flex-row items-start gap-3">
                <CheckCircle2 className="text-primary mt-0.5" size={20} />
                <Text className="flex-1 text-sm text-foreground">
                  Save your favorite service providers
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
              {loading ? 'Creating Account...' : 'Create Account'}
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
            By creating an account, you agree to our{' '}
            <Text className="text-primary font-semibold">Terms of Service</Text> and{' '}
            <Text className="text-primary font-semibold">Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}