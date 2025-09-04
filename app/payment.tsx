import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, MapPin, Shield, Smartphone } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RAZORPAY_KEY_ID } from '@/constants/config';

// Dynamic import for Razorpay to handle potential loading issues
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch (error) {
  console.warn('Razorpay library not available:', error);
}

type PaymentMethod = 'upi' | 'card' | 'wallet' | 'razorpay';
type PaymentAmount = 'partial' | 'full';

export default function PaymentScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentRide, selectedVehicle } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
  const [selectedPaymentAmount, setSelectedPaymentAmount] = useState<PaymentAmount>('partial');

  // Get service name based on booking type
  const getServiceName = (bookingType: string) => {
    switch (bookingType) {
      case 'city':
        return 'City Ride';
      case 'airport':
        return 'Airport Taxi';
      case 'outstation':
        return 'Outstation';
      case 'hourly':
        return 'Hourly Rental';
      default:
        return 'City Ride';
    }
  };

  // Get formatted date and time
  const getFormattedDateTime = () => {
    if (currentRide?.date && currentRide?.time) {
      const date = new Date(currentRide.date);
      const formattedDate = date.toLocaleDateString('en-GB');
      return `${formattedDate}, ${currentRide.time}`;
    }
    return '21/08/2025, 12:30:00';
  };

  // Get duration or distance info based on service type
  const getDurationOrDistance = () => {
    const bookingType = currentRide?.bookingType || 'city';
    const tripType = currentRide?.tripType || 'one-way';
    
    switch (bookingType) {
      case 'hourly':
        return currentRide?.hours || '4 hours'; // Use stored hours selection
      case 'outstation':
        // For outstation, show duration based on trip type
        return tripType === 'round-trip' ? '2 days (Round Trip)' : '1 day (One Way)';
      case 'airport':
        // For airport, show estimated time based on trip type
        return tripType === 'round-trip' ? '90 min (Round Trip)' : '45 min (One Way)';
      case 'city':
      default:
        return '25 min'; // Estimated city ride time
    }
  };

  // Dynamic trip data based on current ride
  const tripData = {
    service: getServiceName(currentRide?.bookingType || 'city'),
    vehicle: selectedVehicle?.name || currentRide?.vehicle?.name || 'Premium',
    pickup: currentRide?.pickup?.address || currentRide?.pickup?.name || 'Pickup Location',
    dropoff: currentRide?.dropoff?.address || currentRide?.dropoff?.name || 'Drop Location',
    scheduled: getFormattedDateTime(),
    passengers: currentRide?.passengers || 1,
    duration: getDurationOrDistance(),
    totalFare: currentRide?.fare?.total || selectedVehicle?.price || 700,
    bookingType: currentRide?.bookingType || 'city'
  };

  const partialAmount = Math.round(tripData.totalFare * 0.25); // 25%
  const remainingAmount = tripData.totalFare - partialAmount;

  const handleBack = () => {
    router.back();
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPaymentMethod(method);
  };

  const handlePaymentAmountSelect = (amount: PaymentAmount) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPaymentAmount(amount);
  };

  const handlePayNow = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    // Check if Razorpay is available
    if (!RazorpayCheckout) {
      Alert.alert(
        'Payment Error',
        'Razorpay payment system is not available. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if API key is configured
    if (RAZORPAY_KEY_ID === 'YOUR_RAZORPAY_KEY_ID') {
      Alert.alert(
        'Configuration Error',
        'Razorpay API key is not configured. Please set up your API keys.',
        [{ text: 'OK' }]
      );
      return;
    }

    const paymentAmount = selectedPaymentAmount === 'partial' ? partialAmount : tripData.totalFare;

    const options = {
      description: 'Cab Booking Payment',
      image: 'https://your-logo-url.com/logo.png',
      currency: 'INR',
      key: RAZORPAY_KEY_ID,
      amount: paymentAmount * 100, // Amount in paisa
      name: 'SDM Cab Booking',
      prefill: {
        email: 'customer@example.com',
        contact: '9999999999',
        name: 'Customer Name'
      },
      theme: { color: '#22C55E' }
    };

    try {
      console.log('Opening Razorpay with options:', options);
      const data = await RazorpayCheckout.open(options);
      console.log('Payment Success:', data);

      // Handle successful payment
      Alert.alert('Payment Successful', `Payment ID: ${data.razorpay_payment_id}`, [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to success screen or complete booking
            router.push('/complete');
          }
        }
      ]);
    } catch (error: any) {
      console.log('Payment Error:', error);
      const errorMessage = error?.description || error?.message || 'Payment was cancelled or failed';
      Alert.alert('Payment Failed', errorMessage);
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'upi':
        return <Smartphone size={24} color="#22C55E" />;
      case 'card':
        return <CreditCard size={24} color="#22C55E" />;
      case 'wallet':
        return <Smartphone size={24} color="#22C55E" />;
      case 'razorpay':
        return <Shield size={24} color="#22C55E" />;
      default:
        return <CreditCard size={24} color="#22C55E" />;
    }
  };

  const getPaymentMethodDescription = (method: PaymentMethod) => {
    switch (method) {
      case 'upi':
        return 'PhonePe, GooglePay, Paytm';
      case 'card':
        return 'Visa, Mastercard, RuPay';
      case 'wallet':
        return 'Paytm, MobiKwik, Amazon Pay';
      case 'razorpay':
        return 'Your payment information is encrypted and secure. Powered by Razorpay\'s industry standard security.';
      default:
        return '';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colorScheme.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colorScheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colorScheme.text }]}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Trip Summary Card */}
          <View style={[styles.card, { backgroundColor: colorScheme.card }]}>
            <View style={styles.cardHeader}>
              <MapPin size={20} color={colorScheme.text} />
              <Text style={[styles.cardTitle, { color: colorScheme.text }]}>Trip Summary</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Service</Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.service}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Vehicle</Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.vehicle}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Pickup</Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.pickup}</Text>
            </View>
            
            {/* Show dropoff for all services except hourly rental */}
            {tripData.bookingType !== 'hourly' && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Drop-off</Text>
                <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.dropoff}</Text>
              </View>
            )}
            
            {/* Show trip type for services that support it */}
            {(tripData.bookingType === 'airport' || tripData.bookingType === 'outstation') && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Trip Type</Text>
                <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
                  {currentRide?.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}
                </Text>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Scheduled</Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.scheduled}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>Passengers</Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.passengers}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
                {tripData.bookingType === 'hourly' ? 'Duration' : 
                 tripData.bookingType === 'outstation' ? 'Duration' : 'Est. Time'}
              </Text>
              <Text style={[styles.summaryValue, { color: colorScheme.text }]}>{tripData.duration}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { color: colorScheme.text }]}>Total Fare</Text>
              <Text style={[styles.totalValue, { color: '#22C55E' }]}>₹{tripData.totalFare}</Text>
            </View>
          </View>

          {/* Choose Payment Amount */}
          <View style={[styles.card, { backgroundColor: colorScheme.card }]}>
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>Choose Payment Amount</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentAmountOption,
                { backgroundColor: colorScheme.background },
                selectedPaymentAmount === 'partial' && { borderColor: '#22C55E', borderWidth: 2 }
              ]}
              onPress={() => handlePaymentAmountSelect('partial')}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPaymentAmount === 'partial' && { backgroundColor: '#22C55E' }
                ]} />
              </View>
              <View style={styles.paymentAmountInfo}>
                <Text style={[styles.paymentAmountTitle, { color: colorScheme.text }]}>
                  Partial Payment (25%)
                </Text>
                <Text style={[styles.paymentAmountSubtitle, { color: colorScheme.subtext }]}>
                  Pay remaining after ride
                </Text>
              </View>
              <Text style={[styles.paymentAmountValue, { color: '#22C55E' }]}>
                ₹{partialAmount}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.paymentAmountOption,
                { backgroundColor: colorScheme.background },
                selectedPaymentAmount === 'full' && { borderColor: '#22C55E', borderWidth: 2 }
              ]}
              onPress={() => handlePaymentAmountSelect('full')}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPaymentAmount === 'full' && { backgroundColor: '#22C55E' }
                ]} />
              </View>
              <View style={styles.paymentAmountInfo}>
                <Text style={[styles.paymentAmountTitle, { color: colorScheme.text }]}>
                  Full Payment
                </Text>
                <Text style={[styles.paymentAmountSubtitle, { color: colorScheme.subtext }]}>
                  Pay complete fare now
                </Text>
              </View>
              <Text style={[styles.paymentAmountValue, { color: '#22C55E' }]}>
                ₹{tripData.totalFare}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.remainingText, { color: colorScheme.subtext }]}>
              Remaining ₹{remainingAmount} will be collected after ride completion
            </Text>
          </View>

          {/* Select Payment Method */}
          <View style={[styles.card, { backgroundColor: colorScheme.card }]}>
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>Select Payment Method</Text>
            
            {/* UPI */}
            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                selectedPaymentMethod === 'upi' && { borderColor: '#22C55E', borderWidth: 2 }
              ]}
              onPress={() => handlePaymentMethodSelect('upi')}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPaymentMethod === 'upi' && { backgroundColor: '#22C55E' }
                ]} />
              </View>
              <View style={[styles.paymentMethodIcon, { backgroundColor: '#22C55E20' }]}>
                {getPaymentMethodIcon('upi')}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[styles.paymentMethodTitle, { color: colorScheme.text }]}>UPI</Text>
                <Text style={[styles.paymentMethodSubtitle, { color: colorScheme.subtext }]}>
                  {getPaymentMethodDescription('upi')}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Credit/Debit Card */}
            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                selectedPaymentMethod === 'card' && { borderColor: '#22C55E', borderWidth: 2 }
              ]}
              onPress={() => handlePaymentMethodSelect('card')}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPaymentMethod === 'card' && { backgroundColor: '#22C55E' }
                ]} />
              </View>
              <View style={[styles.paymentMethodIcon, { backgroundColor: '#22C55E20' }]}>
                {getPaymentMethodIcon('card')}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[styles.paymentMethodTitle, { color: colorScheme.text }]}>Credit/Debit Card</Text>
                <Text style={[styles.paymentMethodSubtitle, { color: colorScheme.subtext }]}>
                  {getPaymentMethodDescription('card')}
                </Text>
              </View>
            </TouchableOpacity>
            
            {/* Digital Wallet */}
            <TouchableOpacity
              style={[
                styles.paymentMethodOption,
                selectedPaymentMethod === 'wallet' && { borderColor: '#22C55E', borderWidth: 2 }
              ]}
              onPress={() => handlePaymentMethodSelect('wallet')}
            >
              <View style={styles.radioButton}>
                <View style={[
                  styles.radioInner,
                  selectedPaymentMethod === 'wallet' && { backgroundColor: '#22C55E' }
                ]} />
              </View>
              <View style={[styles.paymentMethodIcon, { backgroundColor: '#22C55E20' }]}>
                {getPaymentMethodIcon('wallet')}
              </View>
              <View style={styles.paymentMethodInfo}>
                <Text style={[styles.paymentMethodTitle, { color: colorScheme.text }]}>Digital Wallet</Text>
                <Text style={[styles.paymentMethodSubtitle, { color: colorScheme.subtext }]}>
                  {getPaymentMethodDescription('wallet')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Secure Payment by Razorpay */}
          <View style={[styles.securityCard, { backgroundColor: colorScheme.card }]}>
            <View style={styles.securityHeader}>
              <View style={[styles.securityIcon, { backgroundColor: '#22C55E20' }]}>
                <Shield size={20} color="#22C55E" />
              </View>
              <Text style={[styles.securityTitle, { color: colorScheme.text }]}>
                Secure Payment by Razorpay
              </Text>
            </View>
            <Text style={[styles.securityText, { color: colorScheme.subtext }]}>
              {getPaymentMethodDescription('razorpay')}
            </Text>
          </View>

          {/* Pay Now Button */}
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: '#22C55E' }]}
            onPress={handlePayNow}
          >
            <Text style={styles.payButtonText}>
              Pay ₹{selectedPaymentAmount === 'partial' ? partialAmount : tripData.totalFare} Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentAmountOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  paymentAmountInfo: {
    flex: 1,
  },
  paymentAmountTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentAmountSubtitle: {
    fontSize: 14,
  },
  paymentAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  remainingText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
  },
  securityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  securityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  payButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});