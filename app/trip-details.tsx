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
    Calendar,
    Car,
    ChevronLeft,
    Clock,
    Luggage,
    MessageCircle,
    Phone,
    Star,
    User,
    Users
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TripDetailsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { rides, pastRides } = useRides();
  const params = useLocalSearchParams();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [trip, setTrip] = useState<Ride | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Find the specific trip
    const tripId = params.id as string;
    if (tripId) {
      const allTrips = [...rides, ...pastRides];
      const foundTrip = allTrips.find(ride => ride.id === tripId);
      setTrip(foundTrip || null);
    }

    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [params.id, rides, pastRides]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return '#4CAF50';
      case 'in progress':
        return '#2196F3';
      case 'completed':
        return '#9E9E9E';
      case 'cancelled':
        return '#F44336';
      default:
        return colorScheme.primary;
    }
  };

  const getTimeUntilTrip = () => {
    if (!trip || !trip.date || !trip.time) return null;
    
    const tripDateTime = new Date(`${trip.date} ${trip.time}`);
    const timeDiff = tripDateTime.getTime() - currentTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff <= 15 && minutesDiff > 0) {
      return `${minutesDiff} minutes until pickup`;
    } else if (minutesDiff <= 0) {
      return 'Trip time has arrived';
    }
    return null;
  };

  const handleCall = (number: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Linking.openURL(`tel:${number}`);
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // TODO: Implement chat functionality
    Alert.alert('Chat', 'Chat feature will be available soon');
  };

  const handleTrackRide = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push(`/live-tracking?id=${trip?.id}`);
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

  const timeUntilTrip = getTimeUntilTrip();
  const isInProgress = timeUntilTrip && timeUntilTrip.includes('minutes until') || timeUntilTrip === 'Trip time has arrived';

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Trip Details', headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Status Card */}
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(trip.status || 'active') }]} />
            <Text style={[styles.statusText, { color: colorScheme.text }]}>
              {trip.status?.toUpperCase() || 'ACTIVE'}
            </Text>
          </View>
          
          {timeUntilTrip && (
            <Text style={[styles.timeUntilText, { color: colorScheme.primary }]}>
              {timeUntilTrip}
            </Text>
          )}
        </GlassCard>

        {/* Route Information */}
        <GlassCard style={styles.routeCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Route Details
          </Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colorScheme.subtext }]}>
                  Pickup
                </Text>
                <Text style={[styles.routeAddress, { color: colorScheme.text }]}>
                  {trip.pickup?.name}
                </Text>
                <Text style={[styles.routeSubAddress, { color: colorScheme.subtext }]}>
                  {trip.pickup?.address}
                </Text>
              </View>
            </View>
            
            <View style={[styles.routeLine, { backgroundColor: colorScheme.border }]} />
            
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#F44336' }]} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeLabel, { color: colorScheme.subtext }]}>
                  {trip.bookingType === 'airport' ? 'Airport' : 'Dropoff'}
                </Text>
                <Text style={[styles.routeAddress, { color: colorScheme.text }]}>
                  {trip.dropoff?.name}
                </Text>
                <Text style={[styles.routeSubAddress, { color: colorScheme.subtext }]}>
                  {trip.dropoff?.address}
                </Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Schedule Information */}
        <GlassCard style={styles.scheduleCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Schedule
          </Text>
          
          <View style={styles.scheduleRow}>
            <Calendar size={20} color={colorScheme.primary} />
            <Text style={[styles.scheduleText, { color: colorScheme.text }]}>
              {trip.date}
            </Text>
          </View>
          
          <View style={styles.scheduleRow}>
            <Clock size={20} color={colorScheme.primary} />
            <Text style={[styles.scheduleText, { color: colorScheme.text }]}>
              {trip.time}
            </Text>
          </View>
        </GlassCard>

        {/* Passenger Information */}
        <GlassCard style={styles.passengerCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Passenger Details
          </Text>
          
          <View style={styles.passengerRow}>
            <Users size={20} color={colorScheme.primary} />
            <Text style={[styles.passengerText, { color: colorScheme.text }]}>
              {trip.passengers} passengers
            </Text>
          </View>
          
          <View style={styles.passengerRow}>
            <Luggage size={20} color={colorScheme.primary} />
            <Text style={[styles.passengerText, { color: colorScheme.text }]}>
              2 suitcases
            </Text>
          </View>
        </GlassCard>

        {/* Vehicle Details */}
        {trip.vehicle && (
          <GlassCard style={styles.vehicleCard}>
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
              Vehicle Details
            </Text>
            
            <View style={styles.vehicleInfo}>
              <Car size={24} color={colorScheme.primary} />
              <View style={styles.vehicleDetails}>
                <Text style={[styles.vehicleName, { color: colorScheme.text }]}>
                  {trip.vehicle.name}
                </Text>
                <Text style={[styles.vehicleType, { color: colorScheme.subtext }]}>
                  {trip.vehicle.type} • {trip.vehicle.seatingCapacity} seats
                </Text>
                <Text style={[styles.vehicleFeatures, { color: colorScheme.subtext }]}>
                  {trip.vehicle.features?.join(' • ')}
                </Text>
              </View>
            </View>
          </GlassCard>
        )}

        {/* Driver Details */}
        <GlassCard style={styles.driverCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Driver Details
          </Text>
          
          <View style={styles.driverInfo}>
            <View style={styles.driverAvatar}>
              <User size={32} color={colorScheme.text} />
            </View>
            <View style={styles.driverDetails}>
              <Text style={[styles.driverName, { color: colorScheme.text }]}>
                Rajesh Kumar
              </Text>
              <View style={styles.driverRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={[styles.ratingText, { color: colorScheme.text }]}>
                  4.8
                </Text>
              </View>
              <Text style={[styles.driverExperience, { color: colorScheme.subtext }]}>
                5 years experience
              </Text>
            </View>
          </View>
          
          <View style={styles.driverActions}>
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colorScheme.border }]}
              onPress={() => handleCall('+91 98765 43210')}
            >
              <Phone size={20} color={colorScheme.primary} />
              <Text style={[styles.actionText, { color: colorScheme.text }]}>
                Call
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colorScheme.border }]}
              onPress={handleMessage}
            >
              <MessageCircle size={20} color={colorScheme.primary} />
              <Text style={[styles.actionText, { color: colorScheme.text }]}>
                Chat
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Action Button */}
        {isInProgress && (
          <Button
            title="Track Live Location"
            onPress={handleTrackRide}
            style={styles.trackButton}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
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
  statusCard: {
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeUntilText: {
    fontSize: 16,
    fontWeight: '500',
  },
  routeCard: {
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  routeContainer: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
    marginBottom: 20,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  routeSubAddress: {
    fontSize: 14,
    lineHeight: 18,
  },
  routeLine: {
    width: 1,
    height: 20,
    marginLeft: 6,
    marginRight: 16,
    marginBottom: 8,
  },
  scheduleCard: {
    padding: 20,
    marginBottom: 16,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleText: {
    fontSize: 16,
    marginLeft: 12,
  },
  passengerCard: {
    padding: 20,
    marginBottom: 16,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerText: {
    fontSize: 16,
    marginLeft: 12,
  },
  vehicleCard: {
    padding: 20,
    marginBottom: 16,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleDetails: {
    marginLeft: 16,
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehicleType: {
    fontSize: 14,
    marginBottom: 4,
  },
  vehicleFeatures: {
    fontSize: 12,
  },
  driverCard: {
    padding: 20,
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  driverExperience: {
    fontSize: 14,
  },
  driverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trackButton: {
    marginTop: 8,
  },
});