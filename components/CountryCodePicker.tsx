import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, TextInput, SafeAreaView } from 'react-native';
import { ChevronDown, Search, X } from 'lucide-react-native';
import { countries, Country } from '../constants/countries';

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  error?: boolean;
}

export default function CountryCodePicker({ selectedCountry, onSelect, error }: CountryCodePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.dialCode.includes(searchTerm)
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className={`flex-row items-center bg-card border ${error ? 'border-destructive' : 'border-border'} rounded-l-xl px-3 py-3 h-[56px] border-r-0`}
        style={{ minWidth: 80 }}
      >
        <Text className="text-xl mr-1">{selectedCountry.flag}</Text>
        <Text className="text-foreground font-semibold text-base">{selectedCountry.dialCode}</Text>
        <ChevronDown size={16} className="text-muted-foreground ml-1" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-background">
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4 border-b border-border">
              <Text className="text-xl font-bold text-foreground">Select Country</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} className="text-foreground" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="p-4">
              <View className="flex-row items-center bg-muted rounded-xl px-3 py-2">
                <Search size={20} className="text-muted-foreground mr-2" />
                <TextInput
                  placeholder="Search country or dial code"
                  placeholderTextColor="#9CA3AF"
                  className="flex-1 text-foreground h-10"
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  autoFocus
                />
              </View>
            </View>

            {/* List */}
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => `${item.code}-${item.dialCode}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center justify-between px-6 py-4 border-b border-border/50"
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearchTerm('');
                  }}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-4">{item.flag}</Text>
                    <View>
                      <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted-foreground">{item.code}</Text>
                    </View>
                  </View>
                  <Text className="text-base font-bold text-primary">{item.dialCode}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="py-10 items-center">
                  <Text className="text-muted-foreground">No countries found</Text>
                </View>
              }
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}
