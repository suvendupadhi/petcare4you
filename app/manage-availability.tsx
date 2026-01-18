import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar, Plus, Trash2, Save } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';

type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface TimeSlot {
  start: string;
  end: string;
}

interface BusinessHours {
  [key: string]: {
    enabled: boolean;
    slots: TimeSlot[];
  };
}

interface BlockedDate {
  id: string;
  date: string;
  reason: string;
}

const daysOfWeek: { key: DayOfWeek; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export default function ManageAvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Business hours state
  const [businessHours, setBusinessHours] = useState<BusinessHours>({
    monday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    tuesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    wednesday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    thursday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    friday: { enabled: true, slots: [{ start: '09:00', end: '17:00' }] },
    saturday: { enabled: true, slots: [{ start: '10:00', end: '15:00' }] },
    sunday: { enabled: false, slots: [{ start: '10:00', end: '15:00' }] },
  });

  // Slot settings
  const [slotDuration, setSlotDuration] = useState(30); // minutes
  const [slotsPerTimeBlock, setSlotsPerTimeBlock] = useState(2); // capacity

  // Blocked dates
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([
    { id: '1', date: '2024-12-25', reason: 'Christmas Holiday' },
    { id: '2', date: '2024-12-31', reason: 'New Year\'s Eve' },
  ]);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/provider/availability', {
      //   headers: { 'Authorization': `Bearer ${token}` }
      // });
      // const data = await response.json();
      // setBusinessHours(data.businessHours);
      // setSlotDuration(data.slotDuration);
      // setSlotsPerTimeBlock(data.slotsPerTimeBlock);
      // setBlockedDates(data.blockedDates);
      
      setTimeout(() => setLoading(false), 800);
    } catch (error) {
      console.error('Error loading availability:', error);
      setLoading(false);
    }
  };

  const toggleDay = (day: DayOfWeek) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled }
    }));
  };

  const addTimeSlot = (day: DayOfWeek) => {
    const lastSlot = businessHours[day].slots[businessHours[day].slots.length - 1];
    const newStart = lastSlot ? lastSlot.end : '09:00';
    
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: newStart, end: '17:00' }]
      }
    }));
  };

  const removeTimeSlot = (day: DayOfWeek, index: number) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== index)
      }
    }));
  };

  const updateTimeSlot = (day: DayOfWeek, index: number, field: 'start' | 'end', value: string) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) => 
          i === index ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  const removeBlockedDate = (id: string) => {
    Alert.alert(
      'Remove Blocked Date',
      'Are you sure you want to remove this blocked date?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setBlockedDates(prev => prev.filter(d => d.id !== id));
          }
        }
      ]
    );
  };

  const saveAvailability = async () => {
    setSaving(true);
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/provider/availability', {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     businessHours,
      //     slotDuration,
      //     slotsPerTimeBlock,
      //     blockedDates
      //   })
      // });
      
      setTimeout(() => {
        setSaving(false);
        Alert.alert('Success', 'Availability settings saved successfully!');
      }, 1000);
    } catch (error) {
      console.error('Error saving availability:', error);
      setSaving(false);
      Alert.alert('Error', 'Failed to save availability settings');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted-foreground">Loading...</Text>
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
            Set your business hours, time slots, and blocked dates
          </Text>
        </View>

        {/* Slot Settings */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-4">
            <Clock className="text-primary mr-2" size={20} />
            <Text className="text-lg font-semibold text-foreground">Booking Settings</Text>
          </View>

          <View className="bg-card rounded-2xl p-4 gap-4">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-medium">Time Slot Duration</Text>
                <Text className="text-muted-foreground text-sm">How long each appointment lasts</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {[15, 30, 45, 60].map(duration => (
                  <TouchableOpacity
                    key={duration}
                    onPress={() => setSlotDuration(duration)}
                    className={`px-3 py-2 rounded-lg ${
                      slotDuration === duration ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <Text className={slotDuration === duration ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'}>
                      {duration}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="h-px bg-border" />

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-foreground font-medium">Bookings Per Slot</Text>
                <Text className="text-muted-foreground text-sm">Max appointments at the same time</Text>
              </View>
              <View className="flex-row items-center gap-2">
                {[1, 2, 3, 4].map(capacity => (
                  <TouchableOpacity
                    key={capacity}
                    onPress={() => setSlotsPerTimeBlock(capacity)}
                    className={`px-3 py-2 rounded-lg ${
                      slotsPerTimeBlock === capacity ? 'bg-primary' : 'bg-muted'
                    }`}
                  >
                    <Text className={slotsPerTimeBlock === capacity ? 'text-primary-foreground font-semibold' : 'text-muted-foreground'}>
                      {capacity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Business Hours */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center mb-4">
            <Calendar className="text-primary mr-2" size={20} />
            <Text className="text-lg font-semibold text-foreground">Business Hours</Text>
          </View>

          <View className="gap-3">
            {daysOfWeek.map(({ key, label }) => (
              <View key={key} className="bg-card rounded-2xl p-4">
                {/* Day Header */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-foreground font-semibold text-base">{label}</Text>
                  <Switch
                    value={businessHours[key].enabled}
                    onValueChange={() => toggleDay(key)}
                    trackColor={{ false: '#d1d5db', true: '#86efac' }}
                    thumbColor={businessHours[key].enabled ? '#16a34a' : '#f4f4f5'}
                  />
                </View>

                {/* Time Slots */}
                {businessHours[key].enabled && (
                  <View className="gap-2">
                    {businessHours[key].slots.map((slot, index) => (
                      <View key={index} className="flex-row items-center gap-2">
                        <View className="flex-1 flex-row items-center gap-2">
                          <View className="flex-1 bg-muted rounded-lg px-3 py-2">
                            <Text className="text-foreground text-center">{slot.start}</Text>
                          </View>
                          <Text className="text-muted-foreground">to</Text>
                          <View className="flex-1 bg-muted rounded-lg px-3 py-2">
                            <Text className="text-foreground text-center">{slot.end}</Text>
                          </View>
                        </View>
                        {businessHours[key].slots.length > 1 && (
                          <TouchableOpacity
                            onPress={() => removeTimeSlot(key, index)}
                            className="p-2"
                          >
                            <Trash2 className="text-destructive" size={18} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}

                    {/* Add Time Slot Button */}
                    <TouchableOpacity
                      onPress={() => addTimeSlot(key)}
                      className="flex-row items-center justify-center py-2 mt-1"
                    >
                      <Plus className="text-primary mr-1" size={16} />
                      <Text className="text-primary font-medium text-sm">Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!businessHours[key].enabled && (
                  <Text className="text-muted-foreground text-sm text-center">Closed</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Blocked Dates */}
        <View className="px-6 mb-8">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Calendar className="text-primary mr-2" size={20} />
              <Text className="text-lg font-semibold text-foreground">Blocked Dates</Text>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Add Blocked Date', 'Date picker would open here')}
              className="bg-primary px-4 py-2 rounded-lg"
            >
              <Text className="text-primary-foreground font-semibold">Add Date</Text>
            </TouchableOpacity>
          </View>

          {blockedDates.length === 0 ? (
            <View className="bg-card rounded-2xl p-6 items-center">
              <Calendar className="text-muted-foreground mb-2" size={32} />
              <Text className="text-muted-foreground text-center">
                No blocked dates. Add dates when you're unavailable.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {blockedDates.map(blocked => (
                <View key={blocked.id} className="bg-card rounded-2xl p-4">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">
                        {new Date(blocked.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      <Text className="text-muted-foreground text-sm mt-1">{blocked.reason}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeBlockedDate(blocked.id)}
                      className="p-2"
                    >
                      <Trash2 className="text-destructive" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Fixed Save Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border p-6">
        <TouchableOpacity
          onPress={saveAvailability}
          disabled={saving}
          className={`flex-row items-center justify-center py-4 rounded-xl ${
            saving ? 'bg-muted' : 'bg-primary'
          }`}
        >
          <Save className={saving ? 'text-muted-foreground mr-2' : 'text-primary-foreground mr-2'} size={20} />
          <Text className={`font-bold text-lg ${saving ? 'text-muted-foreground' : 'text-primary-foreground'}`}>
            {saving ? 'Saving...' : 'Save Availability'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}