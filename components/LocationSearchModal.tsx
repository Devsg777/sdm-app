import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Location } from '@/types';
import { ArrowLeft, Briefcase, Home, MapPin, Star } from 'lucide-react-native';
import React from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { GooglePlacesInput } from './ui/GooglePlacesInput';

interface LocationSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (location: Location) => void;
  savedLocations: Location[];
  popularLocations: Location[];
  title: string;
}

export default function LocationSearchModal({
  visible,
  onClose,
  onSelectLocation,
  savedLocations,
  popularLocations,
  title,
}: LocationSearchModalProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  // Handle location selection (Places)
  const handleSelectLocation = (location: Location) => {
    onSelectLocation(location);
  };
  
  // Render saved location item
  const renderSavedLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: colorScheme.card }]}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#22C55E20' }]}>
        {item.name.toLowerCase().includes('home') ? (
          <Home size={20} color="#22C55E" />
        ) : item.name.toLowerCase().includes('work') || item.name.toLowerCase().includes('office') ? (
          <Briefcase size={20} color="#22C55E" />
        ) : (
          <MapPin size={20} color="#22C55E" />
        )}
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colorScheme.text }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: colorScheme.subtext }]} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render popular location item
  const renderPopularLocationItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: colorScheme.card }]}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#22C55E20' }]}>
        <Star size={20} color="#22C55E" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colorScheme.text }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: colorScheme.subtext }]} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  // Render search result item
  const renderSearchResultItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={[styles.locationItem, { backgroundColor: colorScheme.card }]}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: '#22C55E20' }]}>
        <MapPin size={20} color="#22C55E" />
      </View>
      <View style={styles.locationInfo}>
        <Text style={[styles.locationName, { color: colorScheme.text }]}>{item.name}</Text>
        <Text style={[styles.locationAddress, { color: colorScheme.subtext }]} numberOfLines={1}>
          {item.address}
        </Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <ArrowLeft size={24} color={colorScheme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colorScheme.text }]}>{title}</Text>
            <View style={styles.placeholder} />
          </View>
          
          {/* Google Places Autocomplete */}
          <View style={{ paddingHorizontal: 20, zIndex: 10000 }}>
            <GooglePlacesInput
              placeholder="Search for a location"
              value={null}
              label={title}
              onSelect={(loc) => handleSelectLocation({
                id: loc.id,
                name: loc.name,
                address: loc.address,
                latitude: loc.latitude,
                longitude: loc.longitude,
              })}
            />
          </View>

          {/* Saved and Popular Locations */}
          <FlatList
            data={[]}
            keyExtractor={(item) => item.id}
            renderItem={renderSavedLocationItem}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {/* Saved Locations Section */}
                {savedLocations.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>Saved Locations</Text>
                    {savedLocations.map((location) => (
                      <View key={location.id}>{renderSavedLocationItem({ item: location })}</View>
                    ))}
                  </>
                )}
                {/* Popular Locations Section */}
                {popularLocations.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>Popular Locations</Text>
                    {popularLocations.map((location) => (
                      <View key={location.id}>{renderPopularLocationItem({ item: location })}</View>
                    ))}
                  </>
                )}
              </>
            }
            ListEmptyComponent={
              savedLocations.length === 0 && popularLocations.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colorScheme.subtext }]}>No saved or popular locations</Text>
                </View>
              ) : null
            }
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});