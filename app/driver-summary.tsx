import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { rides } from '@/mocks/rides';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { CheckCircle, ChevronLeft, Clock, DollarSign, MapPin } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverSummaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      router.replace('(driver-tabs)');
      setIsSubmitting(false);
    }, 1500);
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
          title: 'Trip Summary',
          headerBackTitle: '',
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={[styles.checkCircle, { backgroundColor: colorScheme.success }]}>
            <CheckCircle size={40} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.successTitle, { color: colorScheme.text }]}>
            Trip Completed!
          </Text>
          
          <Text style={[styles.successText, { color: colorScheme.subtext }]}>
            You have successfully completed the trip
          </Text>
        </View>
        
        <GlassCard style={styles.tripCard}>
          <Text style={[styles.tripTitle, { color: colorScheme.text }]}>
            Trip Details
          </Text>
          
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
          
          <View style={styles.tripDetailsRow}>
            <View style={styles.tripDetailItem}>
              <Clock size={16} color={colorScheme.primary} />
              <Text style={[styles.tripDetailText, { color: colorScheme.text }]}>
                {rides[0].duration} min
              </Text>
            </View>
            
            <View style={styles.tripDetailItem}>
              <MapPin size={16} color={colorScheme.primary} />
              <Text style={[styles.tripDetailText, { color: colorScheme.text }]}>
                {rides[0].distance} km
              </Text>
            </View>
          </View>
        </GlassCard>
        
        <GlassCard 
          style={styles.fareCard}
          tint="accent"
        >
          <Text style={[styles.fareTitle, { color: colorScheme.text }]}>
            Payment Summary
          </Text>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Trip Fare
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ${rides[0].fare.base.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Platform Fee
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ${(rides[0].fare.base * 0.2).toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
          
          <View style={styles.fareRow}>
            <Text style={[styles.totalLabel, { color: colorScheme.text }]}>
              Your Earnings
            </Text>
            <Text style={[styles.totalValue, { color: colorScheme.text }]}>
              ${(rides[0].fare.base * 0.8).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.paymentMethodContainer}>
            <DollarSign size={16} color={colorScheme.primary} />
            <Text style={[styles.paymentMethodText, { color: colorScheme.text }]}>
              Payment received via {rides[0].paymentMethod || 'Cash'}
            </Text>
          </View>
        </GlassCard>
        
        <TouchableOpacity
          onPress={handleComplete}
          style={[styles.doneButton, { 
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
          disabled={isSubmitting}
        >
          <ChevronLeft size={24} color={colorScheme.text} />
        </TouchableOpacity>
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
    padding: 20,
  },
  successContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
  },
  tripCard: {
    padding: 16,
    marginBottom: 24,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
  },
  tripDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripDetailText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  fareCard: {
    padding: 16,
    marginBottom: 24,
  },
  fareTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fareLabel: {
    fontSize: 14,
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
  },
  doneButton: {
    
  },
});