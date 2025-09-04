import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
    Car,
    ChevronLeft,
    Clock,
    MessageCircle,
    Navigation,
    Phone,
    Star,
    User
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type TripStatus = 'driver_assigned' | 'driver_arriving' | 'driver_arrived' | 'trip_started' | 'trip_completed';

// const { width, height } = Dimensions.get('window');

export default function LiveTrackingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { rides, pastRides } = useRides();
  const params = useLocalSearchParams();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [trip, setTrip] = useState<Ride | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('driver_assigned');
  const [estimatedArrival] = useState('8 min');
  const [showOTP, setShowOTP] = useState(false);
  const [otp] = useState('4521');

  useEffect(() => {
    // Find the specific trip
    const tripId = params.id as string;
    if (tripId) {
      const allTrips = [...rides, ...pastRides];
      const foundTrip = allTrips.find(ride => ride.id === tripId);
      setTrip(foundTrip || null);
    }

    // Simulate trip status progression
    const statusProgression: TripStatus[] = [
      'driver_assigned',
      'driver_arriving', 
      'driver_arrived',
      'trip_started',
      'trip_completed'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < statusProgression.length - 1) {
        currentIndex++;
        setTripStatus(statusProgression[currentIndex]);
        
        // Show OTP when driver arrives
        if (statusProgression[currentIndex] === 'driver_arrived') {
          setShowOTP(true);
        }
        
        // Complete trip after started for 30 seconds
        if (statusProgression[currentIndex] === 'trip_started') {
          setTimeout(() => {
            setTripStatus('trip_completed');
          }, 30000);
        }
      }
    }, 15000); // Change status every 15 seconds for demo

    return () => clearInterval(interval);
  }, [params.id, rides, pastRides]);

  const getStatusMessage = () => {
    switch (tripStatus) {
      case 'driver_assigned':
        return 'Driver assigned to your trip';
      case 'driver_arriving':
        return `Driver is arriving in ${estimatedArrival}`;
      case 'driver_arrived':
        return 'Driver has arrived at pickup location';
      case 'trip_started':
        return 'Trip in progress';
      case 'trip_completed':
        return 'Trip completed successfully';
      default:
        return 'Preparing your trip';
    }
  };

  const getStatusColor = () => {
    switch (tripStatus) {
      case 'driver_assigned':
        return '#FF9800';
      case 'driver_arriving':
        return '#2196F3';
      case 'driver_arrived':
        return '#4CAF50';
      case 'trip_started':
        return '#9C27B0';
      case 'trip_completed':
        return '#4CAF50';
      default:
        return colorScheme.primary;
    }
  };

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL('tel:+919876543210');
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Alert.alert('Chat', 'Opening chat with driver...');
  };

  const handleTripComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/payment-summary?id=${trip?.id}`);
  };

  if (!trip) {
    return (
      <LinearGradient
        colors={[
          theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
          theme === 'dark' ? '#121212' : '#ffffff',
        ]}
        style={styles.container}
      >
        <Text style={[styles.errorText, { color: colorScheme.text }]}>
          Trip not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { 
            backgroundColor: colorScheme.card,
            borderColor: colorScheme.border,
            borderWidth: 1,
            borderRadius: 12, 
            padding: 12,
            alignItems: 'center', 
            justifyContent: 'center',
            width: 48,
            height: 48
          }]}
        >
          <ChevronLeft size={24} color={colorScheme.text} />
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Live Tracking', headerShown: false }} />
      
      {/* Map Area Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colorScheme.surface }]}>
        <View style={styles.mapPlaceholder}>
          <Navigation size={40} color={colorScheme.primary} />
          <Text style={[styles.mapText, { color: colorScheme.text }]}>
            Live Map View
          </Text>
          <Text style={[styles.mapSubText, { color: colorScheme.subtext }]}>
            Driver location updating...
          </Text>
        </View>
        
        {/* Status Overlay */}
        <View style={styles.statusOverlay}>
          <GlassCard style={styles.statusCard}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: colorScheme.text }]}>
              {getStatusMessage()}
            </Text>
          </GlassCard>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colorScheme.background }]}>
        {/* Trip Info */}
        <GlassCard style={styles.tripCard}>
          <View style={styles.tripHeader}>
            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={[styles.routeText, { color: colorScheme.text }]} numberOfLines={1}>
                  {trip.pickup?.name}
                </Text>
              </View>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#F44336' }]} />
                <Text style={[styles.routeText, { color: colorScheme.text }]} numberOfLines={1}>
                  {trip.dropoff?.name}
                </Text>
              </View>
            </View>
            
            {tripStatus === 'driver_arriving' && (
              <View style={styles.etaContainer}>
                <Clock size={16} color={colorScheme.primary} />
                <Text style={[styles.etaText, { color: colorScheme.primary }]}>
                  ETA: {estimatedArrival}
                </Text>
              </View>
            )}
          </View>
        </GlassCard>

        {/* Driver Info */}
        <GlassCard style={styles.driverCard}>
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <User size={24} color={colorScheme.text} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={[styles.driverName, { color: colorScheme.text }]}>
                Rajesh Kumar
              </Text>
              <View style={styles.driverMeta}>
                <View style={styles.rating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingText, { color: colorScheme.text }]}>
                    4.8
                  </Text>
                </View>
                <View style={styles.vehicleInfo}>
                  <Car size={14} color={colorScheme.subtext} />
                  <Text style={[styles.vehicleText, { color: colorScheme.subtext }]}>
                    {trip.vehicle?.name}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colorScheme.primary }]}
                onPress={handleCall}
              >
                <Phone size={18} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colorScheme.surface }]}
                onPress={handleMessage}
              >
                <MessageCircle size={18} color={colorScheme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* OTP Display */}
        {showOTP && tripStatus === 'driver_arrived' && (
          <GlassCard style={[styles.otpCard, { backgroundColor: 'rgba(76, 175, 80, 0.1)' }]}>
            <Text style={[styles.otpTitle, { color: colorScheme.text }]}>
              Share OTP with Driver
            </Text>
            <Text style={[styles.otpCode, { color: '#4CAF50' }]}>
              {otp}
            </Text>
            <Text style={[styles.otpSubtext, { color: colorScheme.subtext }]}>
              Don&apos;t share this OTP until the driver arrives
            </Text>
          </GlassCard>
        )}

        {/* Trip Complete Button */}
        {tripStatus === 'trip_completed' && (
          <Button
            title="Complete Trip & Pay"
            onPress={handleTripComplete}
            style={styles.completeButton}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  mapSubText: {
    fontSize: 14,
    marginTop: 4,
  },
  statusOverlay: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  tripCard: {
    padding: 16,
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeInfo: {
    flex: 1,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  driverCard: {
    padding: 16,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 12,
    marginLeft: 4,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  otpCode: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  otpSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  completeButton: {
    marginTop: 8,
  },
});