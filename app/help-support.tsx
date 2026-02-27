import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, Platform, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, MessageSquare, Mail, Phone, ChevronRight, LogOut, Home, X, Send } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { authService, userService, User, feedbackService } from '@/services/petCareService';
import { USER_ROLE } from '@/constants/status';

export default function HelpSupportScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    subject: '',
    message: ''
  });

  useEffect(() => {
    userService.getCurrentUser().then(setUser).catch(console.error);
  }, []);

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.subject.trim() || !feedbackForm.message.trim()) {
      Alert.alert('Error', 'Please fill in both subject and message');
      return;
    }

    try {
      setSubmitting(true);
      await feedbackService.submitFeedback(feedbackForm);
      setShowFeedbackModal(false);
      setFeedbackForm({ subject: '', message: '' });
      Alert.alert('Success', 'Thank you for your feedback!');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSupport = (type: 'email' | 'phone') => {
    const url = type === 'email' ? 'mailto:support@petcare4you.com' : 'tel:+15551234567';
    if (Platform.OS === 'web') {
      window.open(url);
    } else {
      Linking.openURL(url);
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="p-6 flex-row items-center justify-between border-b border-border">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-foreground">Help & Support</Text>
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

          <TouchableOpacity 
            onPress={() => setShowFeedbackModal(true)}
            className="bg-card border border-border p-4 rounded-2xl flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-primary/10 p-2 rounded-full">
                <MessageSquare className="text-primary" size={20} />
              </View>
              <Text className="text-lg font-bold text-foreground">Have issue? Send Feedback.</Text>
            </View>
            <ChevronRight className="text-muted-foreground" size={20} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={showFeedbackModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFeedbackModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-[32px] p-6 pb-12 h-[80%]">
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Send Feedback</Text>
              <TouchableOpacity 
                onPress={() => setShowFeedbackModal(false)}
                className="bg-card p-2 rounded-full"
              >
                <X className="text-foreground" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-6">
                <View>
                  <Text className="text-foreground font-semibold mb-2">Subject</Text>
                  <TextInput
                    className="bg-card border border-border rounded-xl p-4 text-foreground"
                    placeholder="Briefly describe the issue"
                    placeholderTextColor="#9ca3af"
                    value={feedbackForm.subject}
                    onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, subject: text }))}
                  />
                </View>

                <View>
                  <Text className="text-foreground font-semibold mb-2">Message</Text>
                  <TextInput
                    className="bg-card border border-border rounded-xl p-4 text-foreground min-h-[150px]"
                    placeholder="Tell us more about what's going on..."
                    placeholderTextColor="#9ca3af"
                    multiline
                    textAlignVertical="top"
                    value={feedbackForm.message}
                    onChangeText={(text) => setFeedbackForm(prev => ({ ...prev, message: text }))}
                  />
                </View>

                <TouchableOpacity 
                  onPress={handleFeedbackSubmit}
                  disabled={submitting}
                  className={`bg-primary p-4 rounded-xl flex-row items-center justify-center gap-2 ${submitting ? 'opacity-70' : ''}`}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Send color="white" size={20} />
                      <Text className="text-white font-bold text-lg">Submit Feedback</Text>
                    </>
                  )}
                </TouchableOpacity>

                <Text className="text-muted-foreground text-center text-sm px-4">
                  Your feedback helps us improve PetCare4You. We may contact you if we need more information.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
