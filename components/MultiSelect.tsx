import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from 'react-native';
import { Check, ChevronDown, Search, X } from 'lucide-react-native';

interface Option {
  id: number;
  name: string;
}

interface MultiSelectProps {
  options: Option[];
  selectedValues: number[];
  onValueChange: (ids: number[]) => void;
  placeholder?: string;
  label?: string;
}

export function MultiSelect({ 
  options = [], 
  selectedValues = [], 
  onValueChange, 
  placeholder = 'Select options', 
  label 
}: MultiSelectProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOptions = options.filter(opt => selectedValues?.includes(opt.id));
  
  const filteredOptions = options.filter(opt => 
    opt.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (id: number) => {
    const newValues = selectedValues.includes(id)
      ? selectedValues.filter(v => v !== id)
      : [...selectedValues, id];
    onValueChange(newValues);
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="text-sm font-semibold text-foreground mb-2">{label}</Text>
      )}
      
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="flex-row items-center justify-between bg-card border border-border rounded-xl px-4 py-3 min-h-[50px]"
      >
        <View className="flex-1 flex-row flex-wrap gap-1">
          {selectedOptions.length > 0 ? (
            selectedOptions.map(opt => (
              <View key={opt.id} className="bg-primary/10 px-2 py-1 rounded-md flex-row items-center gap-1">
                <Text className="text-primary text-xs font-medium">{opt.name}</Text>
                <TouchableOpacity onPress={() => handleToggle(opt.id)}>
                  <X size={12} className="text-primary" />
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text className="text-muted-foreground">{placeholder}</Text>
          )}
        </View>
        <ChevronDown size={20} className="text-muted-foreground ml-2" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className={`bg-background rounded-t-3xl ${Platform.OS === 'web' ? 'max-w-xl mx-auto w-full' : 'w-full'} max-h-[80%] p-6`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-xl font-bold text-foreground">Select {label || 'Options'}</Text>
              <TouchableOpacity onPress={() => setIsVisible(false)} className="p-2 bg-muted rounded-full">
                <X size={20} className="text-foreground" />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center bg-muted rounded-xl px-4 py-2 mb-4">
              <Search size={20} className="text-muted-foreground mr-2" />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                className="flex-1 text-foreground text-base h-10"
                autoFocus={Platform.OS === 'web'}
              />
            </View>

            <ScrollView className="mb-6">
              <View className="gap-2">
                {filteredOptions.map(opt => {
                  const isSelected = selectedValues.includes(opt.id);
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      onPress={() => handleToggle(opt.id)}
                      className={`flex-row items-center justify-between p-4 rounded-xl border ${
                        isSelected ? 'bg-primary/5 border-primary' : 'bg-card border-border'
                      }`}
                    >
                      <Text className={`text-base ${isSelected ? 'text-primary font-semibold' : 'text-foreground'}`}>
                        {opt.name}
                      </Text>
                      <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        isSelected ? 'bg-primary border-primary' : 'border-border'
                      }`}>
                        {isSelected && <Check size={16} className="text-primary-foreground" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {filteredOptions.length === 0 && (
                  <Text className="text-center text-muted-foreground py-10">No options found</Text>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsVisible(false)}
              className="bg-primary py-4 rounded-xl items-center"
            >
              <Text className="text-primary-foreground font-bold text-lg">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
