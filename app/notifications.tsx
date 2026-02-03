import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Bell, MessageSquare, Calendar, Star } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState({
    pushEnabled: true,
    emailEnabled: true,
    newBookings: true,
    messages: true,
    reminders: true,
    reviews: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="p-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Notifications</Text>
          <ThemeToggle />
        </View>

        <View className="px-6 mb-8">
          <Text className="text-muted-foreground mb-6">
            Choose how you want to be notified about your business activity.
          </Text>

          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary/10 p-2 rounded-full">
                  <Bell className="text-primary" size={20} />
                </View>
                <Text className="text-foreground font-semibold">Push Notifications</Text>
              </View>
              <Switch
                value={notifications.pushEnabled}
                onValueChange={() => toggleNotification('pushEnabled')}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="bg-primary/10 p-2 rounded-full">
                  <Bell className="text-primary" size={20} />
                </View>
                <Text className="text-foreground font-semibold">Email Notifications</Text>
              </View>
              <Switch
                value={notifications.emailEnabled}
                onValueChange={() => toggleNotification('emailEnabled')}
              />
            </View>
          </View>

          <Text className="text-sm font-bold text-muted-foreground mt-8 mb-4 uppercase">Business Alerts</Text>

          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <View className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Calendar className="text-muted-foreground" size={20} />
                <View>
                  <Text className="text-foreground font-medium">New Bookings</Text>
                  <Text className="text-muted-foreground text-xs">When a client books a service</Text>
                </View>
              </View>
              <Switch
                value={notifications.newBookings}
                onValueChange={() => toggleNotification('newBookings')}
              />
            </View>

            <View className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <MessageSquare className="text-muted-foreground" size={20} />
                <View>
                  <Text className="text-foreground font-medium">Messages</Text>
                  <Text className="text-muted-foreground text-xs">Direct messages from clients</Text>
                </View>
              </View>
              <Switch
                value={notifications.messages}
                onValueChange={() => toggleNotification('messages')}
              />
            </View>

            <View className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Calendar className="text-muted-foreground" size={20} />
                <View>
                  <Text className="text-foreground font-medium">Reminders</Text>
                  <Text className="text-muted-foreground text-xs">Upcoming appointment reminders</Text>
                </View>
              </View>
              <Switch
                value={notifications.reminders}
                onValueChange={() => toggleNotification('reminders')}
              />
            </View>

            <View className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Star className="text-muted-foreground" size={20} />
                <View>
                  <Text className="text-foreground font-medium">Reviews</Text>
                  <Text className="text-muted-foreground text-xs">When you receive a new review</Text>
                </View>
              </View>
              <Switch
                value={notifications.reviews}
                onValueChange={() => toggleNotification('reviews')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
