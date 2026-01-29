import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
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
  ChevronLeft
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { providerService, Provider } from '@/services/petCareService';

type ServiceCategory = 'all' | 'grooming' | 'daycare';

/*
interface Provider {
  id: string;
  businessName: string;
  rating: number;
  reviewCount: number;
  distance: number;
  services: string[];
  priceRange: string;
  address: string;
  isLicensed: boolean;
  nextAvailable: string;
}
*/

export default function SearchProvidersScreen() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(10);
  const [serviceType, setServiceType] = useState<ServiceCategory>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Provider[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock search results - Replace with actual API call
  /*
  const mockResults: Provider[] = [
    {
      id: '1',
      businessName: 'Paws & Claws Grooming',
      rating: 4.8,
      reviewCount: 124,
      distance: 2.3,
      services: ['Grooming', 'Nail Trim', 'Bath'],
      priceRange: '$$',
      address: '123 Main St, City',
      isLicensed: true,
      nextAvailable: 'Today at 2:00 PM'
    },
    {
      id: '2',
      businessName: 'Happy Tails Daycare',
      rating: 4.9,
      reviewCount: 89,
      distance: 3.1,
      services: ['Daycare', 'Boarding', 'Training'],
      priceRange: '$$$',
      address: '456 Oak Ave, City',
      isLicensed: true,
      nextAvailable: 'Tomorrow at 9:00 AM'
    },
    {
      id: '3',
      businessName: 'Furry Friends Spa',
      rating: 4.7,
      reviewCount: 156,
      distance: 4.5,
      services: ['Grooming', 'Daycare', 'Spa'],
      priceRange: '$$',
      address: '789 Pine Rd, City',
      isLicensed: true,
      nextAvailable: 'Today at 4:30 PM'
    },
    {
      id: '4',
      businessName: 'Pet Paradise Grooming',
      rating: 4.6,
      reviewCount: 67,
      distance: 5.2,
      services: ['Grooming', 'Bath', 'Teeth Cleaning'],
      priceRange: '$',
      address: '321 Elm St, City',
      isLicensed: true,
      nextAvailable: 'Wed at 10:00 AM'
    }
  ];
  */

  const handleSearch = async () => {
    if (!city) {
      return;
    }

    setIsSearching(true);
    try {
      const data = await providerService.getProviders(
        serviceType === 'all' ? undefined : serviceType,
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
        <View className="bg-muted px-3 py-1 rounded-full flex-row items-center gap-1">
          {item.serviceType.toLowerCase().includes('grooming') ? (
            <Scissors className="text-muted-foreground" size={12} />
          ) : (
            <HomeIcon className="text-muted-foreground" size={12} />
          )}
          <Text className="text-muted-foreground text-xs font-medium">{item.serviceType}</Text>
        </View>
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
      <View className="mt-2 bg-accent/50 px-3 py-2 rounded-lg">
        <Text className="text-accent-foreground text-xs">
          Next available: <Text className="font-semibold">Today at 2:00 PM</Text>
        </Text>
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
        <ThemeToggle />
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
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setServiceType('all')}
                className={`flex-1 py-3 rounded-xl border ${
                  serviceType === 'all'
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    serviceType === 'all' ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  All
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setServiceType('grooming')}
                className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center gap-2 ${
                  serviceType === 'grooming'
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <Scissors
                  className={serviceType === 'grooming' ? 'text-primary-foreground' : 'text-foreground'}
                  size={16}
                />
                <Text
                  className={`font-semibold ${
                    serviceType === 'grooming' ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  Grooming
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setServiceType('daycare')}
                className={`flex-1 py-3 rounded-xl border flex-row items-center justify-center gap-2 ${
                  serviceType === 'daycare'
                    ? 'bg-primary border-primary'
                    : 'bg-card border-border'
                }`}
              >
                <HomeIcon
                  className={serviceType === 'daycare' ? 'text-primary-foreground' : 'text-foreground'}
                  size={16}
                />
                <Text
                  className={`font-semibold ${
                    serviceType === 'daycare' ? 'text-primary-foreground' : 'text-foreground'
                  }`}
                >
                  Daycare
                </Text>
              </TouchableOpacity>
            </View>
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