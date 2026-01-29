import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar, Plus, Trash2, Save } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { availabilityService, Availability } from '@/services/petCareService';

export default function ManageAvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  
  // Form state for new slot
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityService.getMyAvailability();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error loading availability:', error);
      Alert.alert('Error', 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!newDate || !newStartTime || !newEndTime) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setSaving(true);
    try {
      // Backend expects DateTime for Date, StartTime, EndTime
      // We combine date and time
      const startDateTime = `${newDate}T${newStartTime}:00`;
      const endDateTime = `${newDate}T${newEndTime}:00`;

      await availabilityService.createAvailability({
        date: newDate,
        startTime: startDateTime,
        endTime: endDateTime,
        isBooked: false
      });
      
      Alert.alert('Success', 'Availability slot added');
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      Alert.alert('Error', 'Failed to add availability');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = (id: number) => {
    Alert.alert(
      'Delete Slot',
      'Are you sure you want to delete this availability slot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await availabilityService.deleteAvailability(id);
              setAvailabilities(prev => prev.filter(a => a.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete availability');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading availability...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="text-foreground" size={24} />
            </TouchableOpacity>
            <ThemeToggle />
          </View>
          <Text className="text-3xl font-bold text-foreground">Manage Availability</Text>
          <Text className="text-muted-foreground mt-2">
            Create time slots for clients to book your services
          </Text>
        </View>

        {/* Add New Slot Form */}
        <View className="px-6 mb-8">
          <View className="bg-card border border-border rounded-2xl p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">Add New Slot</Text>
            
            <View className="gap-4">
              <View>
                <Text className="text-muted-foreground text-sm mb-1">Date (YYYY-MM-DD)</Text>
                <TextInput
                  value={newDate}
                  onChangeText={setNewDate}
                  className="bg-muted text-foreground px-4 py-3 rounded-xl"
                  placeholder="2024-03-25"
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-muted-foreground text-sm mb-1">Start Time (HH:mm)</Text>
                  <TextInput
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                    className="bg-muted text-foreground px-4 py-3 rounded-xl"
                    placeholder="09:00"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-muted-foreground text-sm mb-1">End Time (HH:mm)</Text>
                  <TextInput
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                    className="bg-muted text-foreground px-4 py-3 rounded-xl"
                    placeholder="10:00"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddSlot}
                disabled={saving}
                className={`bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2 mt-2 ${saving ? 'opacity-70' : ''}`}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Plus className="text-primary-foreground" size={20} />
                    <Text className="text-primary-foreground font-bold">Add Availability Slot</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Existing Slots */}
        <View className="px-6">
          <Text className="text-lg font-semibold text-foreground mb-4">Your Time Slots</Text>
          
          {availabilities.length === 0 ? (
            <View className="bg-card border border-border rounded-2xl p-8 items-center">
              <Calendar className="text-muted-foreground mb-2" size={48} />
              <Text className="text-foreground font-semibold">No slots created yet</Text>
              <Text className="text-muted-foreground text-sm text-center mt-1">
                Add your first availability slot above to start receiving bookings.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {availabilities.map((slot) => (
                <View key={slot.id} className="bg-card border border-border rounded-2xl p-4 flex-row items-center justify-between">
                  <View>
                    <View className="flex-row items-center gap-2 mb-1">
                      <Calendar className="text-primary" size={16} />
                      <Text className="text-foreground font-semibold">
                        {new Date(slot.date).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Clock className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground">
                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-3">
                    {slot.isBooked ? (
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-700 text-xs font-bold">Booked</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDeleteSlot(slot.id!)}
                        className="p-2 bg-red-100 rounded-full"
                      >
                        <Trash2 className="text-red-600" size={18} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
