import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Location } from '@/types';
import { MapPin, Search } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GlassCard } from './GlassCard';

interface LocationInputProps {
  placeholder: string;
  value: Location | null;
  onSelect: (location: Location) => void;
  label: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onSelect,
  label,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [searchText, setSearchText] = useState(value?.name || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Mock location suggestions
  const suggestions: Location[] = [
    {
      id: '1',
      name: 'Airport Terminal 1',
      address: 'International Airport, Terminal 1',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    {
      id: '2',
      name: 'Downtown Plaza',
      address: '123 Main Street, Downtown',
      latitude: 37.7849,
      longitude: -122.4094,
    },
    {
      id: '3',
      name: 'Shopping Mall',
      address: '456 Commerce Ave, City Center',
      latitude: 37.7649,
      longitude: -122.4294,
    },
  ];
  
  const handleTextChange = (text: string) => {
    setSearchText(text);
    setShowSuggestions(text.length > 0);
    
    // Auto-select first suggestion if text matches exactly
    const exactMatch = suggestions.find(s => s.name.toLowerCase() === text.toLowerCase());
    if (exactMatch && !value) {
      onSelect(exactMatch);
    }
  };
  
  const handleLocationSelect = (location: Location) => {
    setSearchText(location.name);
    setShowSuggestions(false);
    onSelect(location);
  };
  
  const renderSuggestion = ({ item }: { item: Location }) => (
    <TouchableOpacity
      key={item.id}
      style={styles.suggestionItem}
      onPress={() => handleLocationSelect(item)}
    >
      <MapPin size={16} color={colorScheme.primary} />
      <View style={styles.suggestionContent}>
        <Text style={[styles.suggestionName, { color: colorScheme.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.suggestionAddress, { color: colorScheme.subtext }]}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colorScheme.text }]}>
        {label}
      </Text>
      
      <View style={[styles.inputContainer, { borderColor: colorScheme.border }]}>
        <Search size={20} color={colorScheme.subtext} />
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder={placeholder}
          placeholderTextColor={colorScheme.subtext}
          value={searchText}
          onChangeText={handleTextChange}
          onFocus={() => setShowSuggestions(searchText.length > 0)}
        />
      </View>
      
      {showSuggestions && (
        <GlassCard style={styles.suggestionsContainer}>
          <ScrollView style={styles.suggestionsList} nestedScrollEnabled={true}>
            {suggestions.map((item) => renderSuggestion({ item }))}
          </ScrollView>
        </GlassCard>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 4,
    maxHeight: 200,
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  suggestionAddress: {
    fontSize: 14,
  },
});