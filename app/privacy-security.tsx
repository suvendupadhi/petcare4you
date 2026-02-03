import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Shield, Eye, Smartphone, ChevronRight } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PrivacySecurityScreen() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [biometric, setBiometric] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="p-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Privacy & Security</Text>
          <ThemeToggle />
        </View>

        <View className="px-6 mb-8">
          <Text className="text-muted-foreground mb-6">
            Manage your password, security settings, and data privacy.
          </Text>

          <Text className="text-sm font-bold text-muted-foreground mb-4 uppercase">Login Security</Text>
          
          <View className="bg-card rounded-2xl border border-border overflow-hidden mb-8">
            <TouchableOpacity className="p-4 border-b border-border flex-row items-center justify-between">
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
    </SafeAreaView>
  );
}
