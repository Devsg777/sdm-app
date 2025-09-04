import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import { useRouter } from 'expo-router';
import { Calendar, Car, CheckCircle, Download, MapPin, Users } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { GlassCard } from './GlassCard';

interface BookingSuccessProps {
  visible: boolean;
  onClose: () => void;
  ride: Ride | null;
  onViewDetails: () => void;
}

export const BookingSuccess: React.FC<BookingSuccessProps> = ({
  visible,
  onClose,
  ride,
  onViewDetails,
}) => {
  const { theme } = useTheme();
  const router = useRouter();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const handleViewDetails = () => {
    onViewDetails();
    onClose();
    router.push('/(rider-tabs)/trips');
  };

  const handleBookRide = () => {
    onClose();
    router.push('/(rider-tabs)/services');
  };

  const handleDownloadReceipt = () => {
    if (!ride) return;
    
    // Generate receipt content
    const receiptContent = `
RIDE RECEIPT
============

Booking ID: ${ride.id || 'N/A'}
Date: ${new Date().toLocaleDateString()}

TRIP DETAILS
------------
From: ${ride.pickup?.name || 'N/A'}
To: ${ride.dropoff?.name || 'N/A'}
Date: ${ride.date || 'N/A'}
Time: ${ride.time || 'N/A'}
Passengers: ${ride.passengers || 1}

VEHICLE DETAILS
---------------
Vehicle: ${ride.vehicle?.name || 'N/A'} (${ride.vehicle?.type || 'N/A'})
Rating: ${ride.vehicle?.rating || 'N/A'} stars

PAYMENT DETAILS
---------------
Base Fare: $${ride.fare?.base?.toFixed(2) || '0.00'}
Distance Fare: $${ride.fare?.distance?.toFixed(2) || '0.00'}
Time Fare: $${ride.fare?.time?.toFixed(2) || '0.00'}
GST & Platform Fees: $${ride.fare?.tax?.toFixed(2) || '0.00'}
Total Amount: $${ride.fare?.total?.toFixed(2) || '0.00'}

Advance Paid: $${ride.fare?.advancePayment?.toFixed(2) || '0.00'}
Remaining Amount: $${ride.fare?.remainingPayment?.toFixed(2) || '0.00'}

IMPORTANT NOTES
---------------
• Driver details will be shared 15 minutes before pickup
• Please be ready 5 minutes before scheduled time
• Remaining amount will be collected after the trip
• Cancellation charges may apply as per policy

Thank you for choosing our service!
    `;
    
    // For web, create a downloadable file
    if (typeof window !== 'undefined') {
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${ride.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } else {
      // For mobile, you could use expo-sharing or similar
      console.log('Receipt content:', receiptContent);
      alert('Receipt generated! (In a real app, this would be saved to device)');
    }
  };

  if (!ride) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <GlassCard style={[styles.modal, { backgroundColor: colorScheme.background }]}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <CheckCircle size={80} color="#00C853" />
          </View>

          <Text style={[styles.title, { color: colorScheme.text }]}>
            Payment Successful!
          </Text>

          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            Your booking has been confirmed. You&apos;ll receive driver details 15 minutes before your scheduled time.
          </Text>

          {/* Trip Summary */}
          <View style={styles.tripSummary}>
            <View style={styles.summaryRow}>
              <MapPin size={16} color={colorScheme.primary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
                  Route
                </Text>
                <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
                  {ride.pickup?.name} → {ride.dropoff?.name}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Calendar size={16} color={colorScheme.primary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
                  Schedule
                </Text>
                <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
                  {ride.date} at {ride.time}
                </Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <Users size={16} color={colorScheme.primary} />
              <View style={styles.summaryContent}>
                <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
                  Passengers
                </Text>
                <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
                  {ride.passengers} passengers
                </Text>
              </View>
            </View>

            {ride.vehicle && (
              <View style={styles.summaryRow}>
                <Car size={16} color={colorScheme.primary} />
                <View style={styles.summaryContent}>
                  <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
                    Vehicle
                  </Text>
                  <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
                    {ride.vehicle.name} ({ride.vehicle.type})
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />

            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colorScheme.text }]}>
                Total Fare
              </Text>
              <Text style={[styles.totalValue, { color: colorScheme.primary }]}>
                ${ride.fare?.total.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.paidLabel, { color: colorScheme.subtext }]}>
                Advance Paid (25%)
              </Text>
              <Text style={[styles.paidValue, { color: '#00C853' }]}>
                ${ride.fare?.advancePayment.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.paidLabel, { color: colorScheme.subtext }]}>
                Remaining Amount
              </Text>
              <Text style={[styles.paidValue, { color: colorScheme.warning }]}>
                ${ride.fare?.remainingPayment.toFixed(2)}
              </Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.paidLabel, { color: colorScheme.subtext }]}>
                GST & Platform Fees
              </Text>
              <Text style={[styles.paidValue, { color: colorScheme.text }]}>
                ${ride.fare?.tax.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Important Notes */}
          <View style={[styles.notesContainer, { backgroundColor: colorScheme.surface }]}>
            <Text style={[styles.notesTitle, { color: colorScheme.text }]}>
              Important Notes:
            </Text>
            <Text style={[styles.notesText, { color: colorScheme.subtext }]}>
              • Driver details will be shared 15 minutes before pickup
            </Text>
            <Text style={[styles.notesText, { color: colorScheme.subtext }]}>
              • Please be ready 5 minutes before scheduled time
            </Text>
            <Text style={[styles.notesText, { color: colorScheme.subtext }]}>
              • Remaining amount will be collected after the trip
            </Text>
            <Text style={[styles.notesText, { color: colorScheme.subtext }]}>
              • Cancellation charges may apply as per policy
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title="View Details"
              onPress={handleViewDetails}
              style={[styles.primaryButton, { borderColor: colorScheme.primary, backgroundColor: 'transparent' }]}
              textStyle={{ color: colorScheme.primary }}
              variant="outlined"
            />

            <Button
              title="Book a Ride"
              onPress={handleBookRide}
              style={[styles.primaryButton, { borderColor: colorScheme.primary, backgroundColor: 'transparent' }]}
              textStyle={{ color: colorScheme.primary }}
              variant="outlined"
            />

            <Button
              title="Download Receipt"
              onPress={handleDownloadReceipt}
              style={[styles.primaryButton, { borderColor: colorScheme.primary, backgroundColor: 'transparent' }]}
              textStyle={{ color: colorScheme.primary }}
              leftIcon={<Download size={20} color={colorScheme.primary} />}
              variant="outlined"
            />
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  successIconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  tripSummary: {
    width: '100%',
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryContent: {
    marginLeft: 12,
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  paidLabel: {
    fontSize: 14,
    flex: 1,
  },
  paidValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    marginBottom: 4,
  },
});