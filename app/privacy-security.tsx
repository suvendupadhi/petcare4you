import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput, Alert, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Shield, Eye, Smartphone, ChevronRight, LogOut, Home, X, EyeOff, Lightbulb } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authService, userService, User } from '@/services/petCareService';
import { USER_ROLE } from '@/constants/status';

export default function PrivacySecurityScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService.getCurrentUser().then(setUser).catch(console.error);
  }, []);

  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);

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

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      if (Platform.OS === 'web') window.alert('Please fill in all fields');
      else Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      if (Platform.OS === 'web') window.alert('New passwords do not match');
      else Alert.alert('Error', 'New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      if (Platform.OS === 'web') window.alert('Password changed successfully');
      else Alert.alert('Success', 'Password changed successfully');
      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const msg = error.message || 'Failed to change password';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="p-6 flex-row items-center justify-between border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Privacy & Security</Text>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity 
              onPress={() => router.push(user?.roleId === USER_ROLE.PROVIDER ? '/provider-dashboard' : '/owner-dashboard')}
              className="bg-primary/10 p-2 rounded-full"
            >
              <Home className="text-primary" size={24} />
            </TouchableOpacity>
            <ThemeToggle />
            <TouchableOpacity 
              onPress={handleLogout}
              className="bg-destructive/10 p-2 rounded-full"
            >
              <LogOut className="text-destructive" size={24} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-8">
          <Text className="text-muted-foreground mb-6">
            Manage your password, security settings, and data privacy.
          </Text>

          <Text className="text-sm font-bold text-muted-foreground mb-4 uppercase">Login Security</Text>
          
          <View className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
            <TouchableOpacity 
              onPress={() => setIsPasswordModalOpen(true)}
              className="p-4 border-b border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <Lock className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Change Password</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>

            <View className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Smartphone className="text-muted-foreground" size={20} />
                <View>
                  <Text className="text-foreground font-medium">Two-Factor Authentication</Text>
                  <Text className="text-muted-foreground text-xs">Add an extra layer of security</Text>
                </View>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={setTwoFactor}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Eye className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Biometric Login</Text>
              </View>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
              />
            </View>
          </View>

          <Text className="text-sm font-bold text-muted-foreground mb-4 uppercase">Data & Privacy</Text>
          
          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <TouchableOpacity 
              onPress={() => router.push('/manage-tips')}
              className="p-4 border-b border-border flex-row items-center justify-between"
            >
              <View className="flex-row items-center gap-3">
                <Lightbulb className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Manage Pet Care Tips</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Shield className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Privacy Policy</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Shield className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Terms of Service</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Shield className="text-muted-foreground" size={20} />
                <Text className="text-destructive font-medium">Request Data Deletion</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity className="mt-8 bg-destructive/10 p-4 rounded-xl items-center">
            <Text className="text-destructive font-bold">Deactivate Business Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalOpen}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">Change Password</Text>
              <TouchableOpacity onPress={() => setIsPasswordModalOpen(false)}>
                <X className="text-muted-foreground" size={24} />
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Current Password</Text>
                <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                  <TextInput
                    secureTextEntry={!showCurrent}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-foreground text-base"
                  />
                  <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                    {showCurrent ? <EyeOff size={20} className="text-muted-foreground" /> : <Eye size={20} className="text-muted-foreground" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">New Password</Text>
                <View className="flex-row items-center bg-card border border-border rounded-xl px-4 py-3">
                  <TextInput
                    secureTextEntry={!showNew}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-foreground text-base"
                  />
                  <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                    {showNew ? <EyeOff size={20} className="text-muted-foreground" /> : <Eye size={20} className="text-muted-foreground" />}
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text className="text-sm font-semibold text-foreground mb-2">Confirm New Password</Text>
                <TextInput
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9CA3AF"
                  className="bg-card border border-border rounded-xl px-4 py-3 text-foreground text-base"
                />
              </View>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                className={`bg-primary rounded-xl py-4 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
              >
                <Text className="text-primary-foreground font-bold text-base">
                  {loading ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
