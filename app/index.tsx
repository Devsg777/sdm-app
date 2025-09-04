import { AIMedia } from '@/components/ui/AIMedia';
import colors from '@/constants/colors';
import { HERO_IMAGE_URL, HERO_VIDEO_URL } from '@/constants/config';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { BatteryCharging, Car, Leaf } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';

export default function LandingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, isPhoneVerified, selectedRole,userRole } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  // Check authentication state and redirect accordingly
  useEffect(() => {
    if (user && isPhoneVerified) {
      // User is authenticated and phone verified, redirect to appropriate dashboard
      if (userRole === 'customer') {
        router.replace('(rider-tabs)');
      } else if (userRole === 'driver') {
        router.replace('(driver-tabs)');
      } else {
        // No role selected, go to role selection
        router.replace('(auth)/auth-selection');
      }
    } else {
      // Auto redirect to auth selection after 6 seconds if not authenticated
      const timer = setTimeout(() => {
        router.replace('(auth)/auth-selection');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [router, user, isPhoneVerified, userRole,selectedRole]);

  // Redirect on horizontal swipe
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 20,
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > 20) {
          router.replace('(auth)/auth-selection');
        }
      },
    })
  ).current;

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#0A0A0A' : '#FFFFFF',
        theme === 'dark' ? '#0A0A0A' : '#FFFFFF',
      ]}
      style={styles.container}
      {...panResponder.panHandlers}
    >
      <View style={styles.content}>
        {/* Hero: subtle AI media (video preferred if provided) */}
        <AIMedia
          videoUrl={HERO_VIDEO_URL || undefined}
          imageUrl={HERO_IMAGE_URL || undefined}
          height={220}
          style={{ marginBottom: 24 }}
        />

        {/* EV icon row */}
        <View style={styles.iconRow}>
          <View style={[styles.iconPill, { backgroundColor: theme === 'dark' ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.10)' }]}>
            <Leaf size={18} color={colorScheme.primary} />
            <Text style={[styles.pillText, { color: colorScheme.text }]}>Eco</Text>
          </View>
          <View style={[styles.iconPill, { backgroundColor: theme === 'dark' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.10)' }]}>
            <BatteryCharging size={18} color={colorScheme.primary} />
            <Text style={[styles.pillText, { color: colorScheme.text }]}>EV</Text>
          </View>
          <View style={[styles.iconPill, { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.06)' }]}>
            <Car size={18} color={colorScheme.primary} />
            <Text style={[styles.pillText, { color: colorScheme.text }]}>Ride</Text>
          </View>
        </View>

        {/* Title & subtitle */}
        <Text style={[styles.title, { color: colorScheme.text }]}>SDM Cab Booking</Text>
        <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>Electric mobility. Seamless booking.</Text>

        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, { backgroundColor: colorScheme.primary }]} />
          <View style={[styles.dot, { backgroundColor: colorScheme.primary, opacity: 0.5 }]} />
          <View style={[styles.dot, { backgroundColor: colorScheme.primary, opacity: 0.25 }]} />
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  iconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
});