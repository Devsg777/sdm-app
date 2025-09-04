import { EarningsCard } from '@/components/driver/EarningsCard';
import { RequestCard } from '@/components/driver/RequestCard';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { rides } from '@/mocks/rides';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, MapPin } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DriverDashboardScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [isOnline, setIsOnline] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  
  useEffect(() => {
    if (isOnline) {
      // Simulate incoming ride request after a delay
      const timeout = setTimeout(() => {
        setShowRequest(true);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setShowRequest(false);
    }
  }, [isOnline]);
  
  const toggleOnlineStatus = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsOnline(!isOnline);
  };
  
  const handleAcceptRide = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.push('/driver-otp');
  };
  
  const handleDeclineRide = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowRequest(false);
  };
  
  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colorScheme.text }]}>
              Good Morning
            </Text>
            <Text style={[styles.name, { color: colorScheme.text }]}>
              Alex Johnson
            </Text>
          </View>
          
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color={colorScheme.primary} />
          </TouchableOpacity>
        </View>
        
        <GlassCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={[styles.statusTitle, { color: colorScheme.text }]}>
              Driver Status
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ 
                false: colorScheme.border, 
                true: colorScheme.success 
              }}
              thumbColor={colorScheme.background}
            />
          </View>
          
          <Text style={[
            styles.statusText, 
            { 
              color: isOnline ? colorScheme.success : colorScheme.error 
            }
          ]}>
            {isOnline ? 'You are online and accepting rides' : 'You are offline'}
          </Text>
          
          {isOnline && (
            <View style={styles.locationContainer}>
              <MapPin size={16} color={colorScheme.primary} />
              <Text style={[styles.locationText, { color: colorScheme.text }]}>
                Current Location: Downtown
              </Text>
            </View>
          )}
        </GlassCard>
        
        <EarningsCard
          totalEarnings={1250.75}
          todayEarnings={85.50}
          weeklyEarnings={425.25}
          totalTrips={48}
          onlineHours={120}
        />
        
        {showRequest && (
          <View style={styles.requestContainer}>
            <Text style={[styles.requestTitle, { color: colorScheme.text }]}>
              New Ride Request
            </Text>
            
            <RequestCard
              ride={rides[0]}
              onAccept={handleAcceptRide}
              onDecline={handleDeclineRide}
            />
          </View>
        )}
        
        {!showRequest && isOnline && (
          <GlassCard style={styles.waitingCard}>
            <Text style={[styles.waitingTitle, { color: colorScheme.text }]}>
              Waiting for ride requests...
            </Text>
            <Text style={[styles.waitingText, { color: colorScheme.subtext }]}>
              You&apos;ll be notified when a new request comes in
            </Text>
          </GlassCard>
        )}
        
        {!isOnline && (
          <GlassCard style={styles.offlineCard}>
            <Text style={[styles.offlineTitle, { color: colorScheme.text }]}>
              You&apos;re offline
            </Text>
            <Text style={[styles.offlineText, { color: colorScheme.subtext }]}>
              Go online to start receiving ride requests
            </Text>
          </GlassCard>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
  },
  requestContainer: {
    marginBottom: 24,
  },
  requestTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  waitingCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waitingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  offlineCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  offlineText: {
    fontSize: 14,
    textAlign: 'center',
  },
});