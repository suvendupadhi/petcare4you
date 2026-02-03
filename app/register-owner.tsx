import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ArrowLeft, User, Phone, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService } from '@/services/petCareService';
import { USER_ROLE } from '@/constants/status';

export default function RegisterOwnerScreen() {
  const router = useRouter();
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Form validation
  const validateForm = () => {
    if (!firstName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Please enter your first name');
      } else {
        Alert.alert('Validation Error', 'Please enter your first name');
      }
      return false;
    }
    if (!lastName.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Please enter your last name');
      } else {
        Alert.alert('Validation Error', 'Please enter your last name');
      }
      return false;
    }
    if (!contactNumber.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Please enter your contact number');
      } else {
        Alert.alert('Validation Error', 'Please enter your contact number');
      }
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Please enter a valid email address');
      } else {
        Alert.alert('Validation Error', 'Please enter a valid email address');
      }
      return false;
    }
    if (!password || password.length < 6) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Password must be at least 6 characters');
      } else {
        Alert.alert('Validation Error', 'Password must be at least 6 characters');
      }
      return false;
    }
    if (password !== confirmPassword) {
      if (Platform.OS === 'web') {
        window.alert('Validation Error: Passwords do not match');
      } else {
        Alert.alert('Validation Error', 'Passwords do not match');
      }
      return false;
    }
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      await authService.register({
        email,
        password,
        firstName,
        lastName,
        phoneNumber: contactNumber,
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
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
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
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Last Name <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                <User className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter your last name"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>

            {/* Contact Number */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">
                Contact Number <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                <Phone className="text-muted-foreground mr-3" size={20} />
                <TextInput
                  value={contactNumber}
                  onChangeText={setContactNumber}
                  placeholder="(555) 123-4567"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  className="flex-1 text-foreground text-base"
                />
              </View>
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Email Address <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
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
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
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
              <Text className="text-xs text-muted-foreground mt-1">
                Minimum 6 characters
              </Text>
            </View>

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">
                Confirm Password <Text className="text-destructive">*</Text>
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
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