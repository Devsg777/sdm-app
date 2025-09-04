import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import * as Haptics from 'expo-haptics';
import { Copy, MessageCircle, Phone, Star, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';
import { GlassCard } from './GlassCard';
// import * as Clipboard from 'expo-clipboard';

interface LiveTrackingModalProps {
  visible: boolean;
  trip: Ride | null;
  onClose: () => void;
  onCompleteRide: () => void;
}

export function LiveTrackingModal({ visible, trip, onClose, onCompleteRide }: LiveTrackingModalProps) {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [otp] = useState('5678'); // Mock OTP

  if (!trip) return null;

  const handleCall = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // In a real app, this would initiate a phone call
    Alert.alert('Calling Driver', 'Calling Sarah Driver...');
  };

  const handleMessage = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // In a real app, this would open chat/messaging
    Alert.alert('Message Driver', 'Opening chat with driver...');
  };

  const handleCopyOTP = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    // For now, just show an alert. In production, install expo-clipboard
    // await Clipboard.setStringAsync(otp);
    Alert.alert('OTP Copied', `OTP ${otp} copied to clipboard`);
  };

  const handleCompleteRide = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onCompleteRide();
  };

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
            Live Tracking
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colorScheme.text} />
          </TouchableOpacity>
        </View>

        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: '#2196F3' }]}>
          <Text style={styles.statusBannerText}>
            🚗 Your driver is on the way!
          </Text>
          <Text style={styles.statusBannerSubtext}>
            Estimated arrival: 8 mins
          </Text>
        </View>

        {/* Map View (Mock) */}
        <View style={[styles.mapContainer, { backgroundColor: colorScheme.surface }]}>
          <View style={styles.mapPlaceholder}>
            <Text style={[styles.mapText, { color: colorScheme.text }]}>
              🗺️ Live Map Tracking
            </Text>
            <Text style={[styles.mapSubtext, { color: colorScheme.subtext }]}>
              Track your driver's location in real-time
            </Text>
            <View style={styles.mapFeatures}>
              <Text style={[styles.mapFeature, { color: colorScheme.subtext }]}>
                📍 Current Location: Downtown Area
              </Text>
              <Text style={[styles.mapFeature, { color: colorScheme.subtext }]}>
                🕒 Distance: 2.5 km away
              </Text>
              <Text style={[styles.mapFeature, { color: colorScheme.subtext }]}>
                ⏱️ ETA: 8 minutes
              </Text>
            </View>
          </View>
        </View>

        {/* Driver Info */}
        <GlassCard style={styles.driverCard}>
          <View style={styles.driverHeader}>
            <View style={styles.driverInfo}>
              <View style={[styles.driverAvatar, { backgroundColor: '#FFB74D' }]}>
                <Text style={styles.driverInitial}>S</Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={[styles.driverName, { color: colorScheme.text }]}>
                  Sarah Driver
                </Text>
                <View style={styles.driverRating}>
                  <Star size={14} color="#FFD700" fill="#FFD700" />
                  <Text style={[styles.ratingText, { color: colorScheme.subtext }]}>
                    4.9 • 890+ rides
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.driverActions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                onPress={handleCall}
              >
                <Phone size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#2196F3' }]}
                onPress={handleMessage}
              >
                <MessageCircle size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>

        {/* Vehicle Details */}
        <GlassCard style={styles.vehicleCard}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Vehicle Details
          </Text>
          
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleLeft}>
              <Text style={[styles.vehicleName, { color: colorScheme.text }]}>
                Honda CR-V
              </Text>
              <Text style={[styles.vehicleType, { color: colorScheme.subtext }]}>
                Black • SUV
              </Text>
            </View>
            <Text style={[styles.vehicleNumber, { color: colorScheme.text }]}>
              XYZ 789
            </Text>
          </View>
        </GlassCard>

        {/* OTP Section */}
        <GlassCard style={styles.otpCard}>
          <View style={styles.otpHeader}>
            <Text style={[styles.otpTitle, { color: colorScheme.text }]}>
              OTP for Driver
            </Text>
            <TouchableOpacity onPress={handleCopyOTP} style={styles.copyButton}>
              <Copy size={16} color={colorScheme.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.otpContainer, { backgroundColor: '#E8F5E8' }]}>
            <Text style={styles.otpText}>{otp}</Text>
          </View>
          
          <Text style={[styles.otpSubtext, { color: colorScheme.subtext }]}>
            Share this OTP with driver when they arrive
          </Text>
        </GlassCard>

        {/* Complete Ride Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Complete Ride"
            onPress={handleCompleteRide}
            style={styles.completeButton}
          />
        </View>

        {/* Payment Status */}
        <View style={styles.paymentStatus}>
          <Text style={[styles.paymentLabel, { color: colorScheme.subtext }]}>
            Payment Status
          </Text>
          <Text style={[styles.paymentValue, { color: '#FF9800' }]}>
            Partially Paid
          </Text>
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
  statusBanner: {
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    alignItems: 'center',
  },
  statusBannerText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBannerSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  mapContainer: {
    height: 250,
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 20,
    marginBottom: 8,
    fontWeight: '600',
  },
  mapSubtext: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  mapFeatures: {
    alignItems: 'flex-start',
    gap: 8,
  },
  mapFeature: {
    fontSize: 13,
    textAlign: 'left',
  },
  driverCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  driverInitial: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
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
  },
  driverActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleLeft: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  vehicleType: {
    fontSize: 14,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  otpCard: {
    margin: 16,
    marginTop: 8,
    padding: 16,
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  otpTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    padding: 4,
  },
  otpContainer: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  otpText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 4,
  },
  otpSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  buttonContainer: {
    margin: 16,
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  paymentStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  paymentLabel: {
    fontSize: 14,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});