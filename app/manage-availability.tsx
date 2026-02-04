import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Plus, Trash2, LogOut, Home } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { availabilityService, authService, Availability } from '@/services/petCareService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';

export default function ManageAvailabilityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  
  // Form state for new slot
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(10, 0, 0, 0)));
  
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to load availability');
      } else {
        Alert.alert('Error', 'Failed to load availability');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    setSaving(true);
    try {
      const [year, month, day] = selectedDate.split('-').map(Number);
      
      const startDateTime = new Date(year, month - 1, day, startTime.getHours(), startTime.getMinutes()).toISOString();
      const endDateTime = new Date(year, month - 1, day, endTime.getHours(), endTime.getMinutes()).toISOString();
      const dateOnly = new Date(year, month - 1, day).toISOString();

      await availabilityService.createAvailability({
        date: dateOnly,
        startTime: startDateTime,
        endTime: endDateTime,
        isBooked: false
      });
      
      if (Platform.OS === 'web') {
        window.alert('Success: Availability slot added');
      } else {
        Alert.alert('Success', 'Availability slot added');
      }
      loadAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      if (Platform.OS === 'web') {
        window.alert('Error: Failed to add availability');
      } else {
        Alert.alert('Error', 'Failed to add availability');
      }
    } finally {
      setSaving(false);
    }
  };

  const onStartTimeChange = (event: any, selectedValue?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedValue) {
      setStartTime(selectedValue);
    }
  };

  const onEndTimeChange = (event: any, selectedValue?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedValue) {
      setEndTime(selectedValue);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    const deleteAction = async () => {
      try {
        await availabilityService.deleteAvailability(id);
        setAvailabilities(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        if (Platform.OS === 'web') {
          window.alert('Error: Failed to delete availability');
        } else {
          Alert.alert('Error', 'Failed to delete availability');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this availability slot?')) {
        await deleteAction();
      }
    } else {
      Alert.alert(
        'Delete Slot',
        'Are you sure you want to delete this availability slot?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: deleteAction
          }
        ]
      );
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
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 border-b border-border mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TouchableOpacity
                onPress={() => router.back()}
              >
                <ArrowLeft className="text-foreground" size={24} />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-foreground">Manage Availability</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity 
                onPress={() => router.push('/provider-dashboard')}
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
        </View>

        {/* Add New Slot Form */}
        <View className="px-6 mb-8">
          <View className="bg-card border border-border rounded-2xl p-4">
            <Text className="text-lg font-semibold text-foreground mb-4">Add New Slot</Text>
            
            <View className="gap-4">
              <View className="border border-border rounded-xl overflow-hidden mb-2">
                <Calendar
                  onDayPress={(day: any) => setSelectedDate(day.dateString)}
                  markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: '#2563eb' }
                  }}
                  theme={{
                    calendarBackground: 'transparent',
                    textSectionTitleColor: '#6b7280',
                    selectedDayBackgroundColor: '#2563eb',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#2563eb',
                    dayTextColor: '#374151',
                    textDisabledColor: '#d1d5db',
                    monthTextColor: '#111827',
                    arrowColor: '#2563eb',
                  }}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-muted-foreground text-sm mb-1">Start Time</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={format(startTime, 'HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newTime = new Date(startTime);
                        newTime.setHours(hours, minutes);
                        setStartTime(newTime);
                      }}
                      style={{
                        backgroundColor: '#f3f4f6',
                        padding: 12,
                        borderRadius: 12,
                        border: 'none',
                        color: '#111827',
                        fontSize: 16,
                        fontWeight: '500',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setShowStartTimePicker(true)}
                    >
                      <View className="bg-muted px-4 py-3 rounded-xl flex-row items-center justify-between">
                        <Text className="text-foreground font-medium">
                          {format(startTime, 'hh:mm a')}
                        </Text>
                        <Clock size={16} className="text-muted-foreground" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-muted-foreground text-sm mb-1">End Time</Text>
                  {Platform.OS === 'web' ? (
                    <input
                      type="time"
                      value={format(endTime, 'HH:mm')}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(':').map(Number);
                        const newTime = new Date(endTime);
                        newTime.setHours(hours, minutes);
                        setEndTime(newTime);
                      }}
                      style={{
                        backgroundColor: '#f3f4f6',
                        padding: 12,
                        borderRadius: 12,
                        border: 'none',
                        color: '#111827',
                        fontSize: 16,
                        fontWeight: '500',
                        width: '100%',
                        outline: 'none'
                      }}
                    />
                  ) : (
                    <TouchableOpacity 
                      onPress={() => setShowEndTimePicker(true)}
                    >
                      <View className="bg-muted px-4 py-3 rounded-xl flex-row items-center justify-between">
                        <Text className="text-foreground font-medium">
                          {format(endTime, 'hh:mm a')}
                        </Text>
                        <Clock size={16} className="text-muted-foreground" />
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {Platform.OS !== 'web' && showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onStartTimeChange}
                />
              )}

              {Platform.OS !== 'web' && showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={false}
                  display="default"
                  onChange={onEndTimeChange}
                />
              )}

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
              <CalendarIcon className="text-muted-foreground mb-2" size={48} />
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
                      <CalendarIcon className="text-primary" size={16} />
                      <Text className="text-foreground font-semibold">
                        {format(parseISO(slot.date.toString()), 'PPP')}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Clock className="text-muted-foreground" size={16} />
                      <Text className="text-muted-foreground">
                        {format(parseISO(slot.startTime.toString()), 'hh:mm a')} - {format(parseISO(slot.endTime.toString()), 'hh:mm a')}
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
