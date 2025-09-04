import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Car, MapPin, Shield, User } from 'lucide-react-native';
import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default function AuthSelectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setSelectedRole } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const goToLoginForRole = (role: 'customer' | 'driver') => {
    setSelectedRole(role);
    router.push('(auth)/login');
  };

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Brand header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoContainer}>
            <Car size={28} color="#FFFFFF" />
          </View>
          <View style={styles.brandTextContainer}>
            <Text style={styles.brandTitleRow}>
              <Text style={[styles.brandTitleStrong, { color: colorScheme.text }]}>SDM </Text>
              <Text style={styles.brandTitleAccent}>Cab Booking</Text>
            </Text>
            <Text style={[styles.brandSubtitle, { color: colorScheme.subtext }]}>Your reliable ride partner for comfortable and safe journeys</Text>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            title="Rider"
            onPress={() => goToLoginForRole('customer')}
            style={[styles.buttonBase, styles.primaryButton, { backgroundColor: '#22C55E' }]}
            textStyle={{ color: '#FFFFFF', fontWeight: '700' }}
            leftIcon={<User size={18} color="#FFFFFF" />}
          />
          
          <Button
            title="Driver"
            onPress={() => goToLoginForRole('driver')}
            style={[styles.buttonBase, styles.secondaryButton, { borderColor: '#22C55E' }]}
            textStyle={{ color: '#22C55E', fontWeight: '700' }}
            variant="outlined"
            leftIcon={<Car size={18} color="#22C55E" />}
          />
        </View>

        {/* Service icons */}
        <View style={styles.servicesContainer}>
          <View style={[styles.serviceIcon, { 
            backgroundColor: theme === 'dark' ? colorScheme.card : 'rgba(0, 0, 0, 0.05)' 
          }]}>
            <Car size={20} color={colorScheme.success} />
          </View>
          <View style={[styles.serviceIcon, { 
            backgroundColor: theme === 'dark' ? colorScheme.card : 'rgba(0, 0, 0, 0.05)' 
          }]}>
            <MapPin size={20} color={colorScheme.success} />
          </View>
          <View style={[styles.serviceIcon, { 
            backgroundColor: theme === 'dark' ? colorScheme.card : 'rgba(0, 0, 0, 0.05)' 
          }]}>
            <Shield size={20} color={colorScheme.success} />
          </View>
        </View>

        <View style={styles.serviceLabels}>
          <Text style={[styles.serviceLabel, { color: colorScheme.subtext }]}>Car Booking</Text>
          <Text style={[styles.serviceLabel, { color: colorScheme.subtext }]}>Live Tracking</Text>
          <Text style={[styles.serviceLabel, { color: colorScheme.subtext }]}>Safe Rides</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
   paddingTop: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  brandTextContainer: {
    alignItems: 'center',
  },
  brandTitleRow: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  brandTitleStrong: {
    fontWeight: '900',
  },
  brandTitleAccent: {
    color: '#22C55E',
    fontWeight: '900',
  },
  brandSubtitle: {
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 40,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    marginTop: 20,
  },
  buttonBase: {
    width: 280,
    height: 48,
    paddingHorizontal: 0,
    minWidth: 280,
    maxWidth: 280,
    borderRadius: 15,
  },
  primaryButton: {
    backgroundColor: '#00D084',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  servicesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 40,
  },
  serviceIcon: {
    width: 60,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  serviceLabels: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginHorizontal: 10,
    width: 90,
  },
});