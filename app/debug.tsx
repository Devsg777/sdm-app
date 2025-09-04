import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { GlassCard } from '@/components/ui/GlassCard';
import { GooglePlacesInput } from '@/components/ui/GooglePlacesInput';
import { LiveMapTracking } from '@/components/ui/LiveMapTracking';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { GOOGLE_PLACES_API_KEY, GOOGLE_MAPS_API_KEY, RAZORPAY_KEY_ID } from '@/constants/config';

// Dynamic import for Razorpay to handle potential loading issues
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (error) {
  console.warn('Razorpay library not available:', error);
}

interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export default function DebugScreen() {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);

  const testRazorpay = () => {
    if (!RazorpayCheckout) {
      Alert.alert('Error', 'Razorpay library not available');
      return;
    }

    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
      Alert.alert('Error', 'Razorpay API key not configured');
      return;
    }

    const options = {
      description: 'Test Payment',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: 100, // 1 INR in paisa
      name: 'SDM Debug Test',
      prefill: {
        email: 'test@example.com',
        contact: '9999999999',
        name: 'Test User'
      },
      theme: { color: '#22C55E' }
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        Alert.alert('Success', `Payment ID: ${data.razorpay_payment_id}`);
      })
      .catch((error: any) => {
        Alert.alert('Error', error.description || 'Payment failed');
      });
  };

  const getApiStatus = (apiKey: string, defaultValue: string) => {
    if (!apiKey) return { status: '❌ Not Set', color: '#EF4444' };
    if (apiKey === defaultValue) return { status: '⚠️ Not Configured', color: '#F59E0B' };
    return { status: '✅ Configured', color: '#10B981' };
  };

  const placesStatus = getApiStatus(GOOGLE_PLACES_API_KEY, 'YOUR_GOOGLE_PLACES_API_KEY');
  const mapsStatus = getApiStatus(GOOGLE_MAPS_API_KEY, 'YOUR_GOOGLE_MAPS_API_KEY');
  const razorpayStatus = getApiStatus(RAZORPAY_KEY_ID, 'YOUR_RAZORPAY_KEY_ID');

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <Stack.Screen
        options={{
          title: 'API Debug',
          headerBackTitle: '',
        }}
      />

      <View style={styles.content}>
        <GlassCard style={styles.card}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            API Configuration Status
          </Text>

          <View style={styles.statusContainer}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colorScheme.text }]}>
                Google Places API:
              </Text>
              <Text style={[styles.statusValue, { color: placesStatus.color }]}>
                {placesStatus.status}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colorScheme.text }]}>
                Google Maps API:
              </Text>
              <Text style={[styles.statusValue, { color: mapsStatus.color }]}>
                {mapsStatus.status}
              </Text>
            </View>

            <View style={styles.statusItem}>
              <Text style={[styles.statusLabel, { color: colorScheme.text }]}>
                Razorpay API:
              </Text>
              <Text style={[styles.statusValue, { color: razorpayStatus.color }]}>
                {razorpayStatus.status}
              </Text>
            </View>
          </View>

          <Text style={[styles.instructions, { color: colorScheme.subtext }]}>
            To configure APIs, create a .env file in the project root with:
          </Text>
          <Text style={[styles.code, { color: colorScheme.text }]}>
            {`EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
EXPO_PUBLIC_RAZORPAY_KEY_ID=your_key_here`}
          </Text>
        </GlassCard>

        <GlassCard style={styles.card}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Test Google Places Autocomplete
          </Text>

          <GooglePlacesInput
            placeholder="Search for a location..."
            value={pickup}
            onSelect={setPickup}
            label="Pickup Location"
          />

          <GooglePlacesInput
            placeholder="Search for destination..."
            value={dropoff}
            onSelect={setDropoff}
            label="Destination"
          />
        </GlassCard>

        {pickup && dropoff && (
          <GlassCard style={styles.card}>
            <Text style={[styles.title, { color: colorScheme.text }]}>
              Test Map Display
            </Text>

            <LiveMapTracking
              pickup={{ latitude: pickup.latitude, longitude: pickup.longitude }}
              dropoff={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
              height={250}
            />
          </GlassCard>
        )}

        <GlassCard style={styles.card}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Test Razorpay Payment
          </Text>

          <TouchableOpacity
            style={[styles.testButton, { backgroundColor: razorpayStatus.color }]}
            onPress={testRazorpay}
          >
            <Text style={styles.testButtonText}>
              Test ₹1 Payment
            </Text>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 20,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    marginBottom: 8,
  },
  code: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  testButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});