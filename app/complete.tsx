import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Check, DollarSign, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function CompleteScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentRide, completeRide } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleRating = (value: number) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRating(value);
  };
  
  const handleComplete = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      completeRide(rating, review);
      router.replace('(rider-tabs)');
      setIsSubmitting(false);
    }, 1500);
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
          title: 'Ride Complete',
          headerBackTitle: '',
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <View style={[styles.checkCircle, { backgroundColor: colorScheme.success }]}>
            <Check size={40} color="#FFFFFF" />
          </View>
          
          <Text style={[styles.successTitle, { color: colorScheme.text }]}>
            Ride Completed!
          </Text>
          
          <Text style={[styles.successText, { color: colorScheme.subtext }]}>
            Thank you for riding with Shop My Trips
          </Text>
        </View>
        
        <GlassCard style={styles.fareCard}>
          <Text style={[styles.fareTitle, { color: colorScheme.text }]}>
            Payment Summary
          </Text>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Total Fare
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ₹{currentRide.fare?.total.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Advance Paid
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ₹{currentRide.fare?.advancePayment.toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
          
          <View style={styles.fareRow}>
            <Text style={[styles.remainingLabel, { color: colorScheme.text }]}>
              Remaining Payment
            </Text>
            <Text style={[styles.remainingValue, { color: colorScheme.text }]}>
              ₹{currentRide.fare?.remainingPayment.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.paymentMethodContainer}>
            <DollarSign size={16} color={colorScheme.primary} />
            <Text style={[styles.paymentMethodText, { color: colorScheme.text }]}>
              Paid via {currentRide.paymentMethod || 'Cash'}
            </Text>
          </View>
        </GlassCard>
        
        <GlassCard style={styles.ratingCard}>
          <Text style={[styles.ratingTitle, { color: colorScheme.text }]}>
            Rate your experience
          </Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => handleRating(value)}
                style={styles.starButton}
              >
                <Star 
                  size={32} 
                  color={colorScheme.warning} 
                  fill={value <= rating ? colorScheme.warning : 'transparent'} 
                />
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.reviewInput,
              { borderColor: colorScheme.border }
            ]}
            onPress={() => {
              // In a real app, show a text input or modal
              const userReview = prompt('Write your review');
              if (userReview) setReview(userReview);
            }}
          >
            <Text style={[
              styles.reviewText, 
              { 
                color: review ? colorScheme.text : colorScheme.subtext 
              }
            ]}>
              {review || 'Tap to write a review (optional)'}
            </Text>
          </TouchableOpacity>
        </GlassCard>
        
        <Button
          title="Done"
          onPress={handleComplete}
          loading={isSubmitting}
          style={styles.doneButton}
        />
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
  remainingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  remainingValue: {
    fontSize: 16,
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
  ratingCard: {
    padding: 16,
    marginBottom: 24,
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minHeight: 80,
  },
  reviewText: {
    fontSize: 14,
  },
  doneButton: {
    
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