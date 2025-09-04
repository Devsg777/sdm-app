import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { rides } from '@/mocks/rides';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock rider data
const mockRider = {
  id: 'rider1',
  name: 'John Smith',
  phone: '+1234567890',
  profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
};

export default function DriverTripScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [tripStatus, setTripStatus] = useState<'to_pickup' | 'arrived' | 'in_progress' | 'completed'>('to_pickup');
  const [estimatedTime, setEstimatedTime] = useState(8);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Simulate trip status changes
    const statusTimeline = [
      { status: 'to_pickup' as const, delay: 0 },
      { status: 'arrived' as const, delay: 10000 },
      { status: 'in_progress' as const, delay: 15000 },
    ];
    
    let timeoutId: ReturnType<typeof setTimeout>;
    
    statusTimeline.forEach((item, index) => {
      timeoutId = setTimeout(() => {
        setTripStatus(item.status);
        
        if (item.status === 'arrived' || item.status === 'in_progress') {
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
                return 100;
              }
              return prev + 2;
            });
            
            setEstimatedTime(prev => {
              if (prev <= 0) return 0;
              return prev - 0.2;
            });
          }, 1000);
        }
      }, item.delay);
    });
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Linking.openURL(`tel:${mockRider.phone}`);
  };
  
  const handleChat = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    // In a real app, open chat screen
    router.push('/driver-chat');
  };
  
  const handleViewRoute = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const { pickup, dropoff } = rides[0];
    
    const { latitude: pickupLat, longitude: pickupLng } = pickup;
    const { latitude: dropoffLat, longitude: dropoffLng } = dropoff;
    
    const url = Platform.select({
      ios: `maps://app?saddr=${pickupLat},${pickupLng}&daddr=${dropoffLat},${dropoffLng}`,
      android: `google.navigation:q=${dropoffLat},${dropoffLng}`,
      web: `https://www.google.com/maps/dir/?api=1&origin=${pickupLat},${pickupLng}&destination=${dropoffLat},${dropoffLng}`,
    });
    
    Linking.openURL(url as string);
  };
  
  const handleCompleteTrip = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setTripStatus('completed');
    
    // Navigate to trip summary after a delay
    setTimeout(() => {
      router.replace('/driver-summary');
    }, 1500);
  };
  
  const handleArrivedAtPickup = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTripStatus('arrived');
  };
  
  const handleStartTrip = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTripStatus('in_progress');
  };
  
  const handleTripCompleted = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.replace('/driver-summary');
  };
  
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
          title: 'Active Trip',
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
            <Text style={styles.viewRouteText}>Open Navigation</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.tripContainer}>
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
                {tripStatus === 'to_pickup' && 'Heading to pickup location'}
                {tripStatus === 'arrived' && 'You have arrived at pickup location'}
                {tripStatus === 'in_progress' && `${Math.ceil(estimatedTime)} min to destination`}
                {tripStatus === 'completed' && 'Trip completed!'}
              </Text>
            </View>
            
            <View style={styles.locationInfo}>
              <View style={styles.locationItem}>
                <MapPin size={16} color={colorScheme.success} />
                <Text style={[styles.locationText, { color: colorScheme.text }]}>
                  {rides[0].pickup.name}
                </Text>
              </View>
              
              <View style={styles.locationItem}>
                <MapPin size={16} color={colorScheme.error} />
                <Text style={[styles.locationText, { color: colorScheme.text }]}>
                  {rides[0].dropoff.name}
                </Text>
              </View>
            </View>
          </GlassCard>
          
          <GlassCard style={styles.riderCard}>
            <View style={styles.riderHeader}>
              <Text style={[styles.riderTitle, { color: colorScheme.text }]}>
                Rider Information
              </Text>
            </View>
            
            <View style={styles.riderInfo}>
              <Image
                source={{ uri: mockRider.profileImage }}
                style={styles.riderImage}
              />
              
              <View style={styles.riderDetails}>
                <Text style={[styles.riderName, { color: colorScheme.text }]}>
                  {mockRider.name}
                </Text>
                <Text style={[styles.tripInfo, { color: colorScheme.subtext }]}>
                  {rides[0].bookingType === 'airport' ? 'Airport Transfer' : 
                   rides[0].bookingType === 'outstation' ? 'Outstation Trip' :
                   rides[0].bookingType === 'hourly' ? 'Hourly Rental' : 'City Ride'}
                </Text>
                <Text style={[styles.fareInfo, { color: colorScheme.primary }]}>
                  ${rides[0].fare.total.toFixed(2)}
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
          
          {tripStatus === 'arrived' && (
            <Button
              title="Start Trip"
              onPress={handleStartTrip}
              style={styles.actionButton}
            />
          )}
          
          {tripStatus === 'in_progress' && progress >= 95 && (
            <Button
              title="Complete Trip"
              onPress={handleCompleteTrip}
              style={styles.actionButton}
              leftIcon={<CheckCircle size={20} color={theme === 'dark' ? colors.dark.background : colors.light.background} />}
            />
          )}
          
          {tripStatus === 'completed' && (
            <Button
              title="Trip Completed"
              onPress={handleTripCompleted}
              style={styles.actionButton}
            />
          )}
          
          {tripStatus === 'to_pickup' && (
            <Button
              title="Arrived at Pickup"
              onPress={handleArrivedAtPickup}
              style={styles.actionButton}
            />
          )}
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
  tripContainer: {
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
  riderCard: {
    padding: 16,
    marginBottom: 16,
  },
  riderHeader: {
    marginBottom: 16,
  },
  riderTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  fareInfo: {
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
  actionButton: {
    marginTop: 8,
  },
});