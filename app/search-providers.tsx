import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  Star,
  Navigation,
  Scissors,
  Home as HomeIcon,
  ChevronLeft,
  Clock,
  LogOut,
  Stethoscope,
  Award,
  Dog
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { authService, providerService, serviceTypeService, Provider, ServiceType } from '@/services/petCareService';
import { MultiSelect } from '@/components/MultiSelect';

export default function SearchProvidersScreen() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<number[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loadingServiceTypes, setLoadingServiceTypes] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Provider[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        const types = await serviceTypeService.getServiceTypes();
        setServiceTypes(types);
      } catch (error) {
        console.error('Failed to fetch service types:', error);
      } finally {
        setLoadingServiceTypes(false);
      }
    };

    fetchServiceTypes();
  }, []);

  const toggleServiceType = (id: number | null) => {
    if (id === null) {
      setSelectedServiceTypeIds([]);
      return;
    }

    setSelectedServiceTypeIds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
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

  const handleSearch = async () => {
    if (!city) {
      return;
    }

    setIsSearching(true);
    try {
      const data = await providerService.getProviders(
        selectedServiceTypeIds.length > 0 ? selectedServiceTypeIds : undefined,
        city
      );
      setResults(data);
    } catch (error) {
      console.error('Error searching providers:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const radiusOptions = [5, 10, 15, 25, 50];

  const getServiceIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case 'scissors': return <Scissors className="text-muted-foreground" size={12} />;
      case 'stethoscope': return <Stethoscope className="text-muted-foreground" size={12} />;
      case 'dog': return <Dog className="text-muted-foreground" size={12} />;
      case 'home': return <HomeIcon className="text-muted-foreground" size={12} />;
      case 'award': return <Award className="text-muted-foreground" size={12} />;
      default: return <HomeIcon className="text-muted-foreground" size={12} />;
    }
  };

  const renderProviderCard = ({ item }: { item: Provider }) => (
    <TouchableOpacity
      onPress={() => {
        router.push(`/provider-detail?id=${item.id}`);
      }}
      className="bg-card rounded-2xl p-4 mb-4 border border-border"
    >
      {/* Header */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-foreground font-bold text-lg mb-1">
            {item.companyName}
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center gap-1">
              <Star className="text-yellow-500" size={16} fill="#EAB308" />
              <Text className="text-foreground font-semibold">4.8</Text>
              <Text className="text-muted-foreground text-sm">(124)</Text>
            </View>
            <View className="bg-green-500/10 px-2 py-0.5 rounded">
              <Text className="text-green-600 text-xs font-medium">Licensed</Text>
            </View>
          </View>
        </View>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary font-semibold">${item.hourlyRate}/hr</Text>
        </View>
      </View>

      {/* Services */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {item.serviceTypes?.map((st) => (
          <View key={st.id} className="bg-muted px-3 py-1 rounded-full flex-row items-center gap-1">
            {getServiceIcon(st.iconName || '')}
            <Text className="text-muted-foreground text-xs font-medium">{st.name}</Text>
          </View>
        )) || (
          <View className="bg-muted px-3 py-1 rounded-full flex-row items-center gap-1">
            <HomeIcon className="text-muted-foreground" size={12} />
            <Text className="text-muted-foreground text-xs font-medium">General Service</Text>
          </View>
        )}
      </View>

      {/* Location & Distance */}
      <View className="flex-row items-center justify-between pt-3 border-t border-border">
        <View className="flex-row items-center gap-2 flex-1">
          <MapPin className="text-muted-foreground" size={16} />
          <Text className="text-muted-foreground text-sm flex-1" numberOfLines={1}>
            {item.address}, {item.city}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Navigation className="text-primary" size={14} />
          <Text className="text-primary font-semibold text-sm">2.3 mi</Text>
        </View>
      </View>

      {/* Next Available */}
      <View className="mt-3 flex-row items-center gap-2">
        <Text className="text-muted-foreground text-xs">Next available:</Text>
        <View className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1">
          <Clock className="text-primary" size={12} />
          <Text className="text-primary font-bold text-xs">Today at 2:00 PM</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-border">
        <View className="flex-row items-center gap-3 flex-1">
          <TouchableOpacity onPress={() => router.back()}>
            <ChevronLeft className="text-foreground" size={24} />
          </TouchableOpacity>
          <Text className="text-foreground font-bold text-xl">Find Pet Services</Text>
        </View>
        <View className="flex-row items-center gap-4">
          <ThemeToggle />
          <TouchableOpacity onPress={handleLogout}>
            <LogOut className="text-destructive" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Search Form */}
        <View className="p-6 gap-4">
          {/* City Input */}
          <View>
            <Text className="text-foreground font-semibold mb-2">Location</Text>
            <View className="bg-card border border-border rounded-xl flex-row items-center px-4 py-3">
              <MapPin className="text-muted-foreground mr-3" size={20} />
              <TextInput
                placeholder="Enter city name"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                className="flex-1 text-foreground text-base"
              />
            </View>
          </View>

          {/* Radius Selector */}
          <View>
            <Text className="text-foreground font-semibold mb-2">
              Search Radius: {radius} miles (Demo)
            </Text>
            <View className="flex-row gap-2">
              {radiusOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  onPress={() => setRadius(option)}
                  className={`flex-1 py-3 rounded-xl border ${
                    radius === option
                      ? 'bg-primary border-primary'
                      : 'bg-card border-border'
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      radius === option ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Service Type Filter */}
          <View>
            <Text className="text-foreground font-semibold mb-2">Service Type</Text>
            <MultiSelect
              options={serviceTypes}
              selectedValues={selectedServiceTypeIds}
              onValueChange={setSelectedServiceTypeIds}
              placeholder="All Services"
              label="Select Services"
            />
          </View>

          {/* Search Button */}
          <TouchableOpacity
            onPress={handleSearch}
            disabled={!city || isSearching}
            className={`py-4 rounded-xl flex-row items-center justify-center gap-2 ${
              !city || isSearching ? 'bg-muted' : 'bg-primary'
            }`}
          >
            <Search
              className={!city || isSearching ? 'text-muted-foreground' : 'text-primary-foreground'}
              size={20}
            />
            <Text
              className={`font-bold text-base ${
                !city || isSearching ? 'text-muted-foreground' : 'text-primary-foreground'
              }`}
            >
              {isSearching ? 'Searching...' : 'Search Providers'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Section */}
        {results.length > 0 && (
          <View className="px-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-foreground font-bold text-lg">
                {results.length} Providers Found
              </Text>
              <TouchableOpacity
                onPress={() => setShowFilters(!showFilters)}
                className="flex-row items-center gap-2"
              >
                <SlidersHorizontal className="text-primary" size={20} />
                <Text className="text-primary font-semibold">Filters</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={results}
              renderItem={renderProviderCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && city && (
          <View className="items-center py-12 px-6">
            <View className="bg-muted rounded-full p-6 mb-4">
              <Search className="text-muted-foreground" size={48} />
            </View>
            <Text className="text-foreground font-bold text-xl mb-2">No Results</Text>
            <Text className="text-muted-foreground text-center">
              Try adjusting your search radius or service type
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}