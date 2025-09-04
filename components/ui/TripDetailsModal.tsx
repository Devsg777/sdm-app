import colors from '@/constants/colors';
import { HERO_IMAGE_URL } from '@/constants/config';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import { CreditCard, Star, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AIMedia } from './AIMedia';
import { GlassCard } from './GlassCard';

interface TripDetailsModalProps {
  visible: boolean;
  trip: Ride | null;
  onClose: () => void;
}

export function TripDetailsModal({ visible, trip, onClose }: TripDetailsModalProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  if (!trip) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // If it's already in 12-hour format, return as is
      if (timeString.includes('AM') || timeString.includes('PM')) {
        return timeString;
      }
      
      // Convert 24-hour format to 12-hour format
      const [hours, minutes] = timeString.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'pm' : 'am';
      return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
    } catch {
      return timeString;
    }
  };

  const getDriverInitial = () => {
    if (trip.driverId) {
      return trip.driverId.charAt(0).toUpperCase();
    }
    return 'J'; // Default
  };

  const getDriverName = () => {
    return 'John Driver'; // Mock driver name
  };

  const getDriverRating = () => {
    return 4.8; // Mock driver rating
  };

  const getVehicleName = () => {
    return trip.vehicle?.name || 'Toyota Camry';
  };

  const getVehicleNumber = () => {
    return trip.vehicle?.id || 'ABC 123';
  };

  const getPaymentBreakdown = () => {
    const baseFare = trip.fare.base || 105;
    const distanceCharge = trip.fare.distance ? trip.fare.distance * 1.5 : 52.5;
    const serviceFee = trip.fare.tax || 17.5;
    const total = trip.fare.total || 175;

    return {
      baseFare,
      distanceCharge,
      serviceFee,
      total
    };
  };

  const breakdown = getPaymentBreakdown();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colorScheme.background }]}>
          <Text style={[styles.headerTitle, { color: colorScheme.text }]}>
            Trip Details
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Status and Date */}
          <View style={styles.statusSection}>
            <View style={[styles.statusBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.statusText}>Completed</Text>
            </View>
            <Text style={[styles.dateText, { color: colorScheme.subtext }]}>
              {formatDate(trip.date)} {formatTime(trip.time)}
            </Text>
          </View>

          {/* Trip Route */}
          <GlassCard style={styles.card}>
            {/* AI banner to add visual context */}
            <AIMedia imageUrl={HERO_IMAGE_URL || undefined} height={140} style={{ marginBottom: 12 }} />
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Trip Route
            </Text>
            
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeLabel, { color: colorScheme.subtext }]}>Pickup</Text>
                  <Text style={[styles.routeAddress, { color: colorScheme.text }]}>
                    {trip.pickup.address}
                  </Text>
                </View>
              </View>

              <View style={styles.routeItem}>
                <View style={[styles.routeDot, { backgroundColor: '#F44336' }]} />
                <View style={styles.routeInfo}>
                  <Text style={[styles.routeLabel, { color: colorScheme.subtext }]}>Drop-off</Text>
                  <Text style={[styles.routeAddress, { color: colorScheme.text }]}>
                    {trip.dropoff.address}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Vehicle & Driver */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Vehicle & Driver
            </Text>
            
            <View style={styles.vehicleSection}>
              <View style={styles.vehicleInfo}>
                <View style={[styles.vehicleIcon, { backgroundColor: colorScheme.primary }]}>
                  <Text style={styles.vehicleIconText}>🚗</Text>
                </View>
                <View style={styles.vehicleDetails}>
                  <Text style={[styles.vehicleName, { color: colorScheme.text }]}>
                    {getVehicleName()}
                  </Text>
                  <Text style={[styles.vehicleNumber, { color: colorScheme.subtext }]}>
                    {getVehicleNumber()}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.driverSection}>
              <View style={styles.driverInfo}>
                <View style={[styles.driverAvatar, { backgroundColor: colorScheme.primary }]}>
                  <Text style={styles.driverInitial}>{getDriverInitial()}</Text>
                </View>
                <View style={styles.driverDetails}>
                  <Text style={[styles.driverName, { color: colorScheme.text }]}>
                    {getDriverName()}
                  </Text>
                  <View style={styles.driverRating}>
                    <Star size={14} color="#FFD700" fill="#FFD700" />
                    <Text style={[styles.ratingText, { color: colorScheme.subtext }]}>
                      {getDriverRating()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Payment Details */}
          <GlassCard style={styles.card}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Payment Details
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
              
              <View style={[styles.paymentItem, styles.totalPayment]}>
                <Text style={[styles.totalLabel, { color: colorScheme.text }]}>Total Amount</Text>
                <Text style={[styles.totalAmount, { color: '#4CAF50' }]}>
                  ₹{breakdown.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <View style={styles.paymentMethod}>
              <CreditCard size={20} color={colorScheme.primary} />
              <Text style={[styles.paymentMethodText, { color: colorScheme.text }]}>
                Paid via {trip.paymentMethod?.toUpperCase() || 'UPI'}
              </Text>
            </View>
          </GlassCard>

          {/* Your Rating */}
          {trip.rating && (
            <GlassCard style={[styles.card, styles.ratingCard]}>
              <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                Your Rating
              </Text>
              
              <View style={styles.ratingSection}>
                <View style={styles.starRating}>
                  <Star size={32} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingNumber, { color: colorScheme.text }]}>
                    {trip.rating}
                  </Text>
                </View>
                <Text style={[styles.ratingThankYou, { color: colorScheme.subtext }]}>
                  Thank you for your feedback!
                </Text>
              </View>
            </GlassCard>
          )}
        </ScrollView>
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  statusSection: {
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
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
  routeContainer: {
    gap: 16,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  routeAddress: {
    fontSize: 16,
    lineHeight: 20,
  },
  vehicleSection: {
    marginBottom: 20,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleIconText: {
    fontSize: 20,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleNumber: {
    fontSize: 14,
  },
  driverSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentBreakdown: {
    marginBottom: 20,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalPayment: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingTop: 12,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingCard: {
    marginBottom: 40,
  },
  ratingSection: {
    alignItems: 'center',
  },
  starRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  ratingThankYou: {
    fontSize: 14,
    textAlign: 'center',
  },
});