import colors from '@/constants/colors';
import { HERO_IMAGE_URL } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import * as Haptics from 'expo-haptics';
import { CreditCard, Smartphone, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AIMedia } from './AIMedia';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface PaymentSummaryModalProps {
  visible: boolean;
  trip: Ride | null;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export function PaymentSummaryModal({ visible, trip, onClose, onPaymentComplete }: PaymentSummaryModalProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'card' | 'upi' | 'cash'>('upi');

  if (!trip) return null;

  const getPaymentBreakdown = () => {
    const baseFare = trip.fare.base || 105;
    const distanceCharge = trip.fare.distance ? trip.fare.distance * 1.5 : 52.5;
    const serviceFee = trip.fare.tax || 17.5;
    const total = trip.fare.total || 175;
    const advancePaid = trip.fare.advancePayment || 0;
    const remaining = total - advancePaid;

    return {
      baseFare,
      distanceCharge,
      serviceFee,
      total,
      advancePaid,
      remaining
    };
  };

  const breakdown = getPaymentBreakdown();

  const handlePaymentMethodSelect = (method: 'card' | 'upi' | 'cash') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedPaymentMethod(method);
  };

  const handlePayment = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPaymentComplete();
  };

  const paymentMethods = [
    {
      id: 'upi' as const,
      name: 'UPI Payment',
      subtitle: 'Pay using UPI ID or QR Code',
      icon: <Smartphone size={24} color={colorScheme.primary} />,
    },
    {
      id: 'card' as const,
      name: 'Credit/Debit Card',
      subtitle: 'Pay using your saved cards',
      icon: <CreditCard size={24} color={colorScheme.primary} />,
    },
    {
      id: 'cash' as const,
      name: 'Cash Payment',
      subtitle: 'Pay cash to driver',
      icon: <Text style={{ fontSize: 24 }}>💵</Text>,
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colorScheme.text }]}>
            Payment Summary
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Payment Breakdown */}
          <GlassCard style={styles.card}>
            {/* AI hero media to add visual depth */}
            <AIMedia imageUrl={HERO_IMAGE_URL || undefined} height={140} style={{ marginBottom: 12 }} />
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}> 
              Fare Breakdown
            </Text>
            
            <View style={styles.paymentBreakdown}>
              <View style={styles.paymentItem}>
                <Text style={[styles.paymentLabel, { color: colorScheme.subtext }]}>Base Fare</Text>
                <Text style={[styles.paymentAmount, { color: colorScheme.text }]}>
                  ₹{breakdown.baseFare.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.paymentItem}>
                <Text style={[styles.paymentLabel, { color: colorScheme.subtext }]}>Distance Charge</Text>
                <Text style={[styles.paymentAmount, { color: colorScheme.text }]}>
                  ₹{breakdown.distanceCharge.toFixed(2)}
                </Text>
              </View>
              
              <View style={styles.paymentItem}>
                <Text style={[styles.paymentLabel, { color: colorScheme.subtext }]}>Service Fee</Text>
                <Text style={[styles.paymentAmount, { color: colorScheme.text }]}>
                  ₹{breakdown.serviceFee.toFixed(2)}
                </Text>
              </View>
              
              <View style={[styles.paymentItem, styles.totalRow]}>
                <Text style={[styles.totalLabel, { color: colorScheme.text }]}>Total Amount</Text>
                <Text style={[styles.totalAmount, { color: colorScheme.text }]}>
                  ₹{breakdown.total.toFixed(2)}
                </Text>
              </View>

              {breakdown.advancePaid > 0 && (
                <>
                  <View style={styles.paymentItem}>
                    <Text style={[styles.paymentLabel, { color: colorScheme.subtext }]}>Advance Paid</Text>
                    <Text style={[styles.paymentAmount, { color: '#4CAF50' }]}>
                      -₹{breakdown.advancePaid.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.paymentItem, styles.remainingRow]}>
                    <Text style={[styles.remainingLabel, { color: colorScheme.text }]}>Amount Due</Text>
                    <Text style={[styles.remainingAmount, { color: '#FF9800' }]}>
                      ₹{breakdown.remaining.toFixed(2)}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </GlassCard>

          {/* Payment Methods */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Payment Methods
            </Text>
            
            <View style={styles.paymentMethods}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodItem,
                    {
                      borderColor: selectedPaymentMethod === method.id 
                        ? colorScheme.primary 
                        : colorScheme.border,
                      backgroundColor: selectedPaymentMethod === method.id 
                        ? 'rgba(76, 175, 80, 0.1)' 
                        : 'transparent'
                    }
                  ]}
                  onPress={() => handlePaymentMethodSelect(method.id)}
                >
                  <View style={styles.paymentMethodLeft}>
                    <View style={styles.paymentMethodIcon}>
                      {method.icon}
                    </View>
                    <View style={styles.paymentMethodInfo}>
                      <Text style={[styles.paymentMethodName, { color: colorScheme.text }]}>
                        {method.name}
                      </Text>
                      <Text style={[styles.paymentMethodSubtitle, { color: colorScheme.subtext }]}>
                        {method.subtitle}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={[
                    styles.radioButton,
                    {
                      borderColor: selectedPaymentMethod === method.id 
                        ? colorScheme.primary 
                        : colorScheme.border,
                      backgroundColor: selectedPaymentMethod === method.id 
                        ? colorScheme.primary 
                        : 'transparent'
                    }
                  ]}>
                    {selectedPaymentMethod === method.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </ScrollView>

        {/* Pay Button */}
        <View style={styles.payButtonContainer}>
          <Button
            title={`Pay ₹${breakdown.remaining > 0 ? breakdown.remaining.toFixed(2) : breakdown.total.toFixed(2)}`}
            onPress={handlePayment}
            style={[styles.payButton, { backgroundColor: colorScheme.primary }]}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  card: {
    margin: 16,
    marginTop: 8,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  paymentBreakdown: {
    gap: 12,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  remainingRow: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  remainingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  remainingAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  payButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  payButton: {
    paddingVertical: 16,
  },
});