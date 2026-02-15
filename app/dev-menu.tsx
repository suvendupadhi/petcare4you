import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Home, 
  Search, 
  User, 
  Calendar, 
  DollarSign, 
  Settings,
  UserPlus,
  Building2,
  ChevronRight,
  Sparkles,
  Lightbulb
} from 'lucide-react-native';

const screenGroups = [
  {
    title: '🔧 Admin / Management',
    screens: [
      { name: 'Manage Tips', route: '/manage-tips', icon: Lightbulb },
      { name: 'Privacy & Security', route: '/privacy-security', icon: Settings },
    ],
  },
  {
    title: '🐾 Pet Owner Screens',
    screens: [
      { name: 'Owner Dashboard', route: '/owner-dashboard', icon: Home },
      { name: 'Search Providers', route: '/search-providers', icon: Search },
      { name: 'Provider Detail', route: '/provider-detail', icon: Building2 },
      { name: 'Appointments (Owner)', route: '/appointments-owner', icon: Calendar },
      { name: 'Appointment Detail', route: '/appointment-detail', icon: Calendar },
      { name: 'Profile (Owner)', route: '/profile-owner', icon: User },
      { name: 'Register Owner', route: '/register-owner', icon: UserPlus },
    ],
  },
  {
    title: '🏢 Service Provider Screens',
    screens: [
      { name: 'Provider Dashboard', route: '/provider-dashboard', icon: Home },
      { name: 'Manage Availability', route: '/manage-availability', icon: Calendar },
      { name: 'Payment & Invoice', route: '/payment-invoice', icon: DollarSign },
      { name: 'Profile (Provider)', route: '/profile-provider', icon: Building2 },
      { name: 'Register Provider', route: '/register-provider', icon: UserPlus },
    ],
  },
  {
    title: '🔐 Authentication',
    screens: [
      { name: 'Login Screen', route: '/', icon: User },
    ],
  },
];

export default function DevMenuScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="p-6 bg-primary">
          <View className="flex-row items-center gap-3">
            <Sparkles className="text-primary-foreground" size={32} />
            <View>
              <Text className="text-3xl font-bold text-primary-foreground">Developer Menu</Text>
              <Text className="text-primary-foreground/80 mt-1">Navigate to any screen</Text>
            </View>
          </View>
        </View>

        {/* Screen Groups */}
        <View className="p-6 gap-6">
          {screenGroups.map((group, groupIndex) => (
            <View key={groupIndex}>
              {/* Group Title */}
              <Text className="text-lg font-bold text-foreground mb-3">{group.title}</Text>

              {/* Screens */}
              <View className="gap-2">
                {group.screens.map((screen, screenIndex) => {
                  const IconComponent = screen.icon;
                  return (
                    <TouchableOpacity
                      key={screenIndex}
                      onPress={() => router.push(screen.route as any)}
                      className="bg-card border border-border rounded-lg active:opacity-70"
                    >
                      <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center gap-3">
                          <View className="bg-primary/10 p-2 rounded-lg">
                            <IconComponent className="text-primary" size={20} />
                          </View>
                          <View>
                            <Text className="text-base font-semibold text-card-foreground">
                              {screen.name}
                            </Text>
                            <Text className="text-sm text-muted-foreground mt-0.5">
                              {screen.route}
                            </Text>
                          </View>
                        </View>
                        <ChevronRight className="text-muted-foreground" size={20} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Footer Info */}
        <View className="px-6 pb-6">
          <View className="bg-accent/50 border border-border rounded-lg p-4">
            <View>
              <Text className="text-sm font-bold text-accent-foreground mb-2">💡 Quick Tips:</Text>
              <Text className="text-sm text-accent-foreground mb-1">• All screens use mock data</Text>
              <Text className="text-sm text-accent-foreground mb-1">• Toggle theme with sun/moon icon</Text>
              <Text className="text-sm text-accent-foreground mb-1">• Use back button to return here</Text>
              <Text className="text-sm text-accent-foreground">• Shake device for dev menu</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}