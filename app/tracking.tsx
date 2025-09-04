import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { MapPin, MessageCircle, Navigation, Phone, Star } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock driver data
const mockDriver = {
  id: 'driver1',
  name: 'Alex Johnson',
  phone: '+1234567890',
  rating: 4.8,
  profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
  vehicleDetails: {
    model: 'Toyota Camry',
    color: 'White',
    plateNumber: 'ABC 123',
  },
};

export default function TrackingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentRide } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [rideStatus, setRideStatus] = useState<'searching' | 'driver_assigned' | 'arriving' | 'arrived' | 'in_progress'>('searching');
  const [estimatedTime, setEstimatedTime] = useState(10);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate ride status changes
    const statusTimeline = [
      { status: 'searching', delay: 3000 },
      { status: 'driver_assigned', delay: 5000 },
      { status: 'arriving', delay: 8000 },
      { status: 'arrived', delay: 10000 },
      { status: 'in_progress', delay: 15000 },
    ];
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    statusTimeline.forEach((item, index) => {
      timeoutId = setTimeout(() => {
        setRideStatus(item.status as any);
        
        if (item.status === 'driver_assigned') {
          if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
        
        if (item.status === 'in_progress') {
          // Start progress animation
          const interval = setInterval(() => {
            setProgress(prev => {
              if (prev >= 100) {
                clearInterval(interval);
                router.replace('/complete');
                return 100;
              }
              return prev + 5;
            });
            
            setEstimatedTime(prev => {
              if (prev <= 0) return 0;
              return prev - 0.5;
            });
          }, 1000);
        }
      }, item.delay);
    });
    
    return () => clearTimeout(timeoutId);
  }, [router]);
  
  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`tel:${mockDriver.phone}`);
  };
  
  const handleChat = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // In a real app, open chat screen
    alert('Chat functionality would open here');
  };
  
  const handleViewRoute = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (!currentRide?.pickup || !currentRide?.dropoff) return;
    
    const { latitude: pickupLat, longitude: pickupLng } = currentRide.pickup;
    const { latitude: dropoffLat, longitude: dropoffLng } = currentRide.dropoff;
    
    const url = Platform.select({
      ios: `maps://app?saddr=${pickupLat},${pickupLng}&daddr=${dropoffLat},${dropoffLng}`,
      android: `google.navigation:q=${dropoffLat},${dropoffLng}`,
      web: `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropoffLat},${dropoffLng}`,
    });
    
    Linking.openURL(url as string);
  };
  
  if (!currentRide) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        <Text style={[styles.errorText, { color: colorScheme.text }]}>
          No active ride found
        </Text>
        <Button
          title="Go to Home"
          onPress={() => router.replace('/')}
          style={styles.errorButton}
        />
      </View>
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
      <Stack.Screen 
        options={{
          title: 'Track Ride',
          headerBackTitle: '',
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.mapPlaceholder}>
          <TouchableOpacity 
            style={styles.viewRouteButton}
            onPress={handleViewRoute}
          >
            <Navigation size={20} color="#FFFFFF" />
            <Text style={styles.viewRouteText}>View Route</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statusContainer}>
          <GlassCard style={styles.statusCard}>
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: colorScheme.border,
                  }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colorScheme.primary,
                      width: `${progress}%`,
                    }
                  ]}
                />
              </View>
              
              <Text style={[styles.statusText, { color: colorScheme.text }]}>
                {rideStatus === 'searching' && 'Finding your driver...'}
                {rideStatus === 'driver_assigned' && 'Driver assigned!'}
                {rideStatus === 'arriving' && 'Driver is on the way'}
                {rideStatus === 'arrived' && 'Driver has arrived'}
                {rideStatus === 'in_progress' && `${Math.ceil(estimatedTime)} min to destination`}
              </Text>
            </View>
            
            <View style={styles.locationInfo}>
              <View style={styles.locationItem}>
                <MapPin size={16} color={colorScheme.success} />
                <Text style={[styles.locationText, { color: colorScheme.text }]}>
                  {currentRide.pickup?.name}
                </Text>
              </View>
              
              <View style={styles.locationItem}>
                <MapPin size={16} color={colorScheme.error} />
                <Text style={[styles.locationText, { color: colorScheme.text }]}>
                  {currentRide.dropoff?.name}
                </Text>
              </View>
            </View>
          </GlassCard>
          
          {rideStatus !== 'searching' && (
            <GlassCard style={styles.driverCard}>
              <View style={styles.driverHeader}>
                <Text style={[styles.driverTitle, { color: colorScheme.text }]}>
                  Your Driver
                </Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color={colorScheme.warning} fill={colorScheme.warning} />
                  <Text style={[styles.ratingText, { color: colorScheme.text }]}>
                    {mockDriver.rating}
                  </Text>
                </View>
              </View>
              
              <View style={styles.driverInfo}>
                <Image
                  source={{ uri: mockDriver.profileImage }}
                  style={styles.driverImage}
                />
                
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: colorScheme.text }]}>
                    {mockDriver.name}
                  </Text>
                  <Text style={[styles.vehicleInfo, { color: colorScheme.subtext }]}>
                    {mockDriver.vehicleDetails.color} {mockDriver.vehicleDetails.model}
                  </Text>
                  <Text style={[styles.plateNumber, { color: colorScheme.primary }]}>
                    {mockDriver.vehicleDetails.plateNumber}
                  </Text>
                </View>
                
                <View style={styles.contactButtons}>
                  <TouchableOpacity 
                    style={[styles.contactButton, { backgroundColor: colorScheme.success }]}
                    onPress={handleCall}
                  >
                    <Phone size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.contactButton, { backgroundColor: colorScheme.primary }]}
                    onPress={handleChat}
                  >
                    <MessageCircle size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          )}
          
          <Button
            title="Cancel Ride"
            onPress={() => router.replace('/')}
            variant="outlined"
            style={styles.cancelButton}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  mapPlaceholder: {
    height: '50%',
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewRouteText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  statusContainer: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    padding: 16,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  locationInfo: {
    
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
  },
  driverCard: {
    padding: 16,
    marginBottom: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  plateNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButton: {
    
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    width: 200,
    alignSelf: 'center',
  },
});