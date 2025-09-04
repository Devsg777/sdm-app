import colors from '@/constants/colors';
import { GOOGLE_PLACES_API_KEY } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { MapPin, X } from 'lucide-react-native';
import React, { useRef } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface GooglePlacesInputProps {
  placeholder: string;
  value: Location | null;
  onSelect: (location: Location) => void;
  label: string;
}

export const GooglePlacesInput: React.FC<GooglePlacesInputProps> = ({
  placeholder,
  value,
  onSelect,
  label,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const ref = useRef<any>(null);
  // Simple session token to avoid UUID v1 path in library on web
  const sessionTokenRef = useRef<string>(`${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const isApiKeyConfigured = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'AIzaSyA7sn0fs6f0vRDm3RIkRKn_R-haAgH4M0A';

  const handlePlaceSelect = (data: any, details: any) => {
    if (details && details.geometry && details.geometry.location) {
      const location: Location = {
        id: data.place_id || data.id || Math.random().toString(),
        name: data.structured_formatting?.main_text || data.description || data.name,
        address: data.description || details.formatted_address,
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
      };
      onSelect(location);
    } else {
      console.warn('Invalid place data received:', { data, details });
    }
  };

  const clearSelection = () => {
    ref.current?.setAddressText('');
    onSelect(null as any);
  };

  const handleUseCurrentLocation = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
            try {
              const res = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
              );
              const json = await res.json();
              if (json?.results?.[0]?.formatted_address) {
                address = json.results[0].formatted_address;
              }
            } catch (e) {
              console.warn('Reverse geocoding failed:', e);
            }

            onSelect({
              id: 'current',
              name: 'Current Location',
              address,
              latitude,
              longitude,
            });
            ref.current?.setAddressText('Current Location');
          },
          (err) => {
            console.warn('Geolocation error:', err);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
      } else {
        try {
          const Location = await import('expo-location');
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            console.warn('Location permission not granted');
            return;
          }
          const { coords } = await Location.getCurrentPositionAsync({});
          const { latitude, longitude } = coords;
          let address = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          try {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
            );
            const json = await res.json();
            if (json?.results?.[0]?.formatted_address) {
              address = json.results[0].formatted_address;
            }
          } catch (e) {
            console.warn('Reverse geocoding failed:', e);
          }

          onSelect({
            id: 'current',
            name: 'Current Location',
            address,
            latitude,
            longitude,
          });
          ref.current?.setAddressText('Current Location');
        } catch (e) {
          console.warn('expo-location not available:', e);
        }
      }
    } catch (e) {
      console.warn('Error getting current location:', e);
    }
  };

  if (!isApiKeyConfigured) {
    return (
      <View style={styles.outerContainer}>
        <Text style={[styles.label, { color: colorScheme.text }]}>
          {label}
        </Text>
        <View style={[styles.fallbackInput, { backgroundColor: colorScheme.card }]}>
          <Text style={[styles.fallbackText, { color: colorScheme.subtext }]}>
            ⚠️ Google Places API key not configured
          </Text>
        </View>
        <Text style={[styles.debugText, { color: colorScheme.subtext }]}>
          Please set EXPO_PUBLIC_GOOGLE_PLACES_API_KEY in your .env file
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <Text style={[styles.label, { color: colorScheme.text }]}>
        {label}
      </Text>
      
      <View style={{ zIndex: 1000, position: 'relative' }}>
        <TouchableOpacity onPress={handleUseCurrentLocation} style={{
          alignSelf: 'flex-start',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: colorScheme.card,
          borderWidth: 1,
          borderColor: colorScheme.border,
          marginBottom: 8,
        }}>
          <Text style={{ color: colorScheme.text, fontSize: 14 }}>Use Current Location</Text>
        </TouchableOpacity>
        <GooglePlacesAutocomplete
          ref={ref}
          placeholder={value ? value.name : placeholder}
          onPress={handlePlaceSelect}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: 'en',
            sessiontoken: sessionTokenRef.current,
          }}
          textInputProps={{
            placeholderTextColor: colorScheme.subtext,
            onFocus: clearSelection,
          }}
          styles={{
            container: {
              // No flex: 1 here
              flex: 0,
            },
            textInputContainer: {
              flexDirection: 'row',
              alignItems: 'center',
              height: 50,
              borderWidth: 1,
              borderRadius: 16,
              paddingHorizontal: 12,
              backgroundColor: colorScheme.card,
              borderColor: colorScheme.border,
              marginVertical: 4,
            },
            textInput: {
              backgroundColor: 'transparent',
              color: colorScheme.text,
              fontSize: 16,
              padding: 0,
              marginLeft: 12,
              marginRight: 0,
            },
            listView: {
              backgroundColor: colorScheme.card,
              borderRadius: 12,
              elevation: 10,
              position: 'absolute',
              top: Platform.OS === 'ios' ? 52 : 50,
              left: 0,
              right: 0,
            },
            row: {
              backgroundColor: colorScheme.card,
              padding: 13,
              height: 'auto',
              minHeight: 44,
            },
            separator: {
              height: 0.5,
              backgroundColor: colorScheme.border,
            },
            description: {
              color: colorScheme.text,
            },
            predefinedPlacesDescription: {
              color: colorScheme.subtext,
            },
          }}
          renderLeftButton={() => (
            <View style={styles.iconContainer}>
              <MapPin size={20} color={colorScheme.subtext} />
            </View>
          )}
          renderRightButton={() => (
            value ? (
              <TouchableOpacity onPress={clearSelection} style={styles.clearButton}>
                <X size={16} color={colorScheme.subtext} />
              </TouchableOpacity>
            ) : null
          )}
          enablePoweredByContainer={false}
          fetchDetails={true}
          debounce={300}
          minLength={2}
          predefinedPlacesAlwaysVisible={false}
          onFail={(error) => {
            console.warn('GooglePlacesAutocomplete onFail:', error);
          }}
          onNotFound={() => {
            console.warn('GooglePlacesAutocomplete: No results found');
          }}
          keepResultsAfterBlur={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 16,
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  fallbackInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});