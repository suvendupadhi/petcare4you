import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Platform, TextInput, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Plus, Trash2, LogOut, Home } from 'lucide-react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { availabilityService, authService, Availability } from '@/services/petCareService';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';

export default function ManageAvailabilityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  
  // Form state for new slot
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(new Date(new Date().setHours(9, 0, 0, 0)));
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(10, 0, 0, 0)));
  
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Derived marked dates for calendar
  const getMarkedDates = () => {
    const marks: any = {
      [selectedDate]: { 
        selected: true, 
        selectedColor: isDark ? '#fb923c' : '#2563eb',
        textColor: '#ffffff'
      }
    };

    availabilities.forEach(slot => {
      try {
        const dateStr = format(parseISO(slot.date.toString()), 'yyyy-MM-dd');
        if (!marks[dateStr]) {
          marks[dateStr] = {
            marked: true,
            dotColor: slot.isBooked ? '#ef4444' : '#22c55e'
          };
        } else {
          marks[dateStr].marked = true;
          // If already selected, we keep it selected but add the dot
          marks[dateStr].dotColor = slot.isBooked ? '#ef4444' : '#22c55e';
        }
      } catch (e) {
        console.error('Error parsing date for calendar mark:', e);
      }
    });

    return marks;
  };

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
    if (Platform.OS === 'android') {
      setShowStartTimePicker(false);
    } else {
      setShowStartTimePicker(Platform.OS === 'ios');
    }
    
    if (event.type === 'set' && selectedValue) {
      setStartTime(selectedValue);
    }
  };

  const onEndTimeChange = (event: any, selectedValue?: Date) => {
    if (Platform.OS === 'android') {
      setShowEndTimePicker(false);
    } else {
      setShowEndTimePicker(Platform.OS === 'ios');
    }
    
    if (event.type === 'set' && selectedValue) {
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
                <ArrowLeft color={isDark ? '#f8fafc' : '#1e293b'} size={24} />
              </TouchableOpacity>
              <Text className="text-2xl font-bold text-foreground">Manage Availability</Text>
            </View>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity 
                onPress={() => router.push('/provider-dashboard')}
                className="bg-primary/10 p-2 rounded-full"
              >
                <Home color={isDark ? '#fb923c' : '#ea580c'} size={24} />
              </TouchableOpacity>
              <ThemeToggle />
              <TouchableOpacity 
                onPress={handleLogout}
                className="bg-destructive/10 p-2 rounded-full"
              >
                <LogOut color={isDark ? '#f87171' : '#dc2626'} size={24} />
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
                  markedDates={getMarkedDates()}
                  theme={{
                    calendarBackground: isDark ? '#1e293b' : '#ffffff',
                    textSectionTitleColor: isDark ? '#94a3b8' : '#6b7280',
                    selectedDayBackgroundColor: isDark ? '#fb923c' : '#2563eb',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: isDark ? '#fb923c' : '#2563eb',
                    dayTextColor: isDark ? '#f8fafc' : '#374151',
                    textDisabledColor: isDark ? '#475569' : '#d1d5db',
                    monthTextColor: isDark ? '#f8fafc' : '#111827',
                    arrowColor: isDark ? '#fb923c' : '#2563eb',
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
                        <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
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
                        <Clock size={16} color={isDark ? '#94a3b8' : '#64748b'} />
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
                  display={Platform.OS === 'android' ? 'spinner' : 'default'}
                  onChange={onStartTimeChange}
                />
              )}

              {Platform.OS !== 'web' && showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'android' ? 'spinner' : 'default'}
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
                    <Plus color="#ffffff" size={20} />
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
              <CalendarIcon color={isDark ? '#475569' : '#94a3b8'} size={48} />
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
                      <CalendarIcon color={isDark ? '#fb923c' : '#2563eb'} size={16} />
                      <Text className="text-foreground font-semibold">
                        {format(parseISO(slot.date.toString()), 'PPP')}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Clock color={isDark ? '#94a3b8' : '#64748b'} size={16} />
                      <Text className="text-muted-foreground">
                        {format(parseISO(slot.startTime.toString()), 'hh:mm a')} - {format(parseISO(slot.endTime.toString()), 'hh:mm a')}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-3">
                    {slot.isBooked ? (
                      <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        <Text className="text-green-700 dark:text-green-400 text-xs font-bold">Booked</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleDeleteSlot(slot.id!)}
                        className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
                      >
                        <Trash2 color={isDark ? '#f87171' : '#dc2626'} size={18} />
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
