import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, HelpCircle, MessageSquare, Mail, Phone, ExternalLink, ChevronRight, FileText } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function HelpSupportScreen() {
  const faqs = [
    { q: 'How do I set my availability?', a: 'Go to your Business Profile and tap "Edit" next to Business Hours to manage your time slots.' },
    { q: 'How do I receive payments?', a: 'Clients pay through the app. You can manage your payout settings in the Payments & Invoices section.' },
    { q: 'Can I offer multiple services?', a: 'Yes! You can add and price different services in the "Services & Pricing" section of your profile.' },
    { q: 'What happens if I cancel a booking?', a: 'Cancellations may affect your rating. Please refer to our cancellation policy for more details.' },
  ];

  const handleContactSupport = (type: 'email' | 'phone') => {
    const url = type === 'email' ? 'mailto:support@petcare.com' : 'tel:+15551234567';
    if (Platform.OS === 'web') {
      window.open(url);
    } else {
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView>
        <View className="p-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-foreground">Help & Support</Text>
          <ThemeToggle />
        </View>

        <View className="px-6 mb-8">
          <Text className="text-muted-foreground mb-8">
            Need help? Our support team is here for you 24/7.
          </Text>

          <View className="flex-row gap-4 mb-8">
            <TouchableOpacity 
              onPress={() => handleContactSupport('email')}
              className="flex-1 bg-card border border-border p-4 rounded-2xl items-center"
            >
              <View className="bg-primary/10 p-3 rounded-full mb-2">
                <Mail className="text-primary" size={24} />
              </View>
              <Text className="text-foreground font-semibold">Email Us</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleContactSupport('phone')}
              className="flex-1 bg-card border border-border p-4 rounded-2xl items-center"
            >
              <View className="bg-primary/10 p-3 rounded-full mb-2">
                <Phone className="text-primary" size={24} />
              </View>
              <Text className="text-foreground font-semibold">Call Us</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-lg font-bold text-foreground mb-4">Frequently Asked Questions</Text>
          
          <View className="gap-3 mb-8">
            {faqs.map((faq, index) => (
              <View key={index} className="bg-card border border-border rounded-2xl p-4">
                <Text className="text-foreground font-semibold mb-2">{faq.q}</Text>
                <Text className="text-muted-foreground text-sm">{faq.a}</Text>
              </View>
            ))}
          </View>

          <Text className="text-lg font-bold text-foreground mb-4">Resources</Text>

          <View className="bg-card rounded-2xl border border-border overflow-hidden">
            <TouchableOpacity className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <FileText className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Business Guide</Text>
              </View>
              <ExternalLink className="text-muted-foreground" size={18} />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 border-b border-border flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <HelpCircle className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Community Forum</Text>
              </View>
              <ExternalLink className="text-muted-foreground" size={18} />
            </TouchableOpacity>

            <TouchableOpacity className="p-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <MessageSquare className="text-muted-foreground" size={20} />
                <Text className="text-foreground font-medium">Live Chat</Text>
              </View>
              <ChevronRight className="text-muted-foreground" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
