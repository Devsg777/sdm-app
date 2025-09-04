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
    CheckCircle,
    ChevronLeft,
    Clock,
    CreditCard,
    MapPin,
    Smartphone,
    Star
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type PaymentMethod = 'card' | 'upi';
type UPIApp = 'gpay' | 'phonepe' | 'paytm' | 'other';

export default function PaymentSummaryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { rides, pastRides } = useRides();
  const params = useLocalSearchParams();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [trip, setTrip] = useState<Ride | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('upi');
  const [selectedUPI, setSelectedUPI] = useState<UPIApp>('gpay');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  React.useEffect(() => {
    // Find the specific trip
    const tripId = params.id as string;
    if (tripId) {
      const allTrips = [...rides, ...pastRides];
      const foundTrip = allTrips.find(ride => ride.id === tripId);
      setTrip(foundTrip || null);
    }
  }, [params.id, rides, pastRides]);

  const processPayment = () => {
    setPaymentProcessing(true);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Simulate payment processing
    setTimeout(() => {
      setPaymentProcessing(false);
      setPaymentCompleted(true);
      setShowThankYou(true);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 3000);
  };

  const handleThankYouClose = () => {
    setShowThankYou(false);
    setShowRating(true);
  };

  const handleRatingSubmit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setShowRating(false);
    router.push('/(rider-tabs)/trips');
  };

  const getUPIIcon = (app: UPIApp) => {
    // In a real app, you'd use actual app icons
    return <Smartphone size={24} color={colorScheme.text} />;
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

  const remainingAmount = trip.fare?.remainingPayment || 0;

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <Stack.Screen options={{ title: 'Payment Summary', headerShown: false }} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Trip Summary */}
        <GlassCard style={styles.tripSummaryCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Trip Completed Successfully!
          </Text>
          
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.routeText, { color: colorScheme.text }]}>
                {trip.pickup?.name}
              </Text>
            </View>
            <View style={[styles.routeLine, { backgroundColor: colorScheme.border }]} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.routeText, { color: colorScheme.text }]}>
                {trip.dropoff?.name}
              </Text>
            </View>
          </View>

          <View style={styles.tripMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={colorScheme.subtext} />
              <Text style={[styles.metaText, { color: colorScheme.subtext }]}>
                Duration: 45 min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <MapPin size={16} color={colorScheme.subtext} />
              <Text style={[styles.metaText, { color: colorScheme.subtext }]}>
                Distance: 12.5 km
              </Text>
            </View>
          </View>
        </GlassCard>

        {/* Fare Breakdown */}
        <GlassCard style={styles.fareCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Fare Details
          </Text>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Base Fare
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ₹{((trip.fare?.total || 0) * 0.7).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Distance Charges
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ₹{((trip.fare?.total || 0) * 0.2).toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colorScheme.text }]}>
              Time Charges
            </Text>
            <Text style={[styles.fareValue, { color: colorScheme.text }]}>
              ₹{((trip.fare?.total || 0) * 0.1).toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
          
          <View style={styles.fareRow}>
            <Text style={[styles.totalLabel, { color: colorScheme.text }]}>
              Total Fare
            </Text>
            <Text style={[styles.totalValue, { color: colorScheme.text }]}>
              ₹{trip.fare?.total.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.paidLabel, { color: '#4CAF50' }]}>
              Advance Paid
            </Text>
            <Text style={[styles.paidValue, { color: '#4CAF50' }]}>
              -₹{trip.fare?.advancePayment.toFixed(2)}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
          
          <View style={styles.fareRow}>
            <Text style={[styles.remainingLabel, { color: colorScheme.primary }]}>
              Amount to Pay
            </Text>
            <Text style={[styles.remainingValue, { color: colorScheme.primary }]}>
              ₹{remainingAmount.toFixed(2)}
            </Text>
          </View>
        </GlassCard>

        {!paymentCompleted && (
          <>
            {/* Payment Method Selection */}
            <GlassCard style={styles.paymentCard}>
              <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
                Choose Payment Method
              </Text>
              
              {/* UPI Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  { 
                    borderColor: selectedPayment === 'upi' ? colorScheme.primary : colorScheme.border,
                    backgroundColor: selectedPayment === 'upi' ? `${colorScheme.primary}20` : 'transparent'
                  }
                ]}
                onPress={() => setSelectedPayment('upi')}
              >
                <Smartphone size={24} color={colorScheme.text} />
                <Text style={[styles.paymentText, { color: colorScheme.text }]}>
                  UPI Payment
                </Text>
                {selectedPayment === 'upi' && (
                  <CheckCircle size={20} color={colorScheme.primary} />
                )}
              </TouchableOpacity>
              
              {/* Card Option */}
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  { 
                    borderColor: selectedPayment === 'card' ? colorScheme.primary : colorScheme.border,
                    backgroundColor: selectedPayment === 'card' ? `${colorScheme.primary}20` : 'transparent'
                  }
                ]}
                onPress={() => setSelectedPayment('card')}
              >
                <CreditCard size={24} color={colorScheme.text} />
                <Text style={[styles.paymentText, { color: colorScheme.text }]}>
                  Card Payment
                </Text>
                {selectedPayment === 'card' && (
                  <CheckCircle size={20} color={colorScheme.primary} />
                )}
              </TouchableOpacity>

              {/* UPI Apps Selection */}
              {selectedPayment === 'upi' && (
                <View style={styles.upiApps}>
                  <Text style={[styles.upiTitle, { color: colorScheme.text }]}>
                    Select UPI App
                  </Text>
                  <View style={styles.upiGrid}>
                    {(['gpay', 'phonepe', 'paytm', 'other'] as UPIApp[]).map((app) => (
                      <TouchableOpacity
                        key={app}
                        style={[
                          styles.upiApp,
                          { 
                            borderColor: selectedUPI === app ? colorScheme.primary : colorScheme.border,
                            backgroundColor: selectedUPI === app ? `${colorScheme.primary}20` : colorScheme.surface
                          }
                        ]}
                        onPress={() => setSelectedUPI(app)}
                      >
                        {getUPIIcon(app)}
                        <Text style={[styles.upiAppText, { color: colorScheme.text }]}>
                          {app === 'gpay' ? 'GPay' : 
                           app === 'phonepe' ? 'PhonePe' : 
                           app === 'paytm' ? 'Paytm' : 'Other'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </GlassCard>

            <Button
              title={paymentProcessing ? 'Processing Payment...' : `Pay ₹${remainingAmount.toFixed(2)}`}
              onPress={processPayment}
              disabled={paymentProcessing}
              style={styles.payButton}
            />
          </>
        )}
      </ScrollView>

      {/* Thank You Modal */}
      <Modal
        visible={showThankYou}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.thankYouModal, { backgroundColor: colorScheme.background }]}>
            <CheckCircle size={80} color="#4CAF50" />
            <Text style={[styles.thankYouTitle, { color: colorScheme.text }]}>
              Thank You!
            </Text>
            <Text style={[styles.thankYouText, { color: colorScheme.subtext }]}>
              Your payment has been processed successfully. We hope you had a great trip!
            </Text>
            <Button
              title="Continue"
              onPress={handleThankYouClose}
              style={styles.thankYouButton}
            />
          </GlassCard>
        </View>
      </Modal>

      {/* Rating Modal */}
      <Modal
        visible={showRating}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.ratingModal, { backgroundColor: colorScheme.background }]}>
            <Text style={[styles.ratingTitle, { color: colorScheme.text }]}>
              Rate Your Trip
            </Text>
            <Text style={[styles.ratingSubtitle, { color: colorScheme.subtext }]}>
              How was your experience with Rajesh Kumar?
            </Text>
            
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={40}
                    color={star <= rating ? '#FFD700' : colorScheme.border}
                    fill={star <= rating ? '#FFD700' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            
            <Button
              title="Submit Rating"
              onPress={handleRatingSubmit}
              disabled={rating === 0}
              style={styles.submitRatingButton}
            />
          </GlassCard>
        </View>
      </Modal>
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
  tripSummaryCard: {
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
    marginBottom: 16,
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
  },
  routeLine: {
    width: 1,
    height: 20,
    marginLeft: 4,
    marginBottom: 8,
  },
  tripMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 6,
  },
  fareCard: {
    padding: 20,
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paidLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  paidValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  remainingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  paymentCard: {
    padding: 20,
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
    flex: 1,
  },
  upiApps: {
    marginTop: 16,
  },
  upiTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  upiApp: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  upiAppText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  payButton: {
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  thankYouModal: {
    width: '100%',
    maxWidth: 300,
    padding: 24,
    alignItems: 'center',
  },
  thankYouTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  thankYouText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  thankYouButton: {
    width: '100%',
  },
  ratingModal: {
    width: '100%',
    maxWidth: 320,
    padding: 24,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  starButton: {
    padding: 4,
  },
  submitRatingButton: {
    width: '100%',
  },
});