import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { GooglePlacesInput } from '@/components/ui/GooglePlacesInput';
import { LiveMapTracking } from '@/components/ui/LiveMapTracking';
import { SchedulePicker } from '@/components/ui/SchedulePicker';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { Location, TripType } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Luggage, Minus, Plus, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PassengerInfo {
  passengers: number;
  suitcases: number;
}

export default function BookingDetailsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    currentRide, 
    setPickup, 
    setDropoff, 
    setDateTime, 
    setPassengers,
    setTripType
  } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [pickup, setPickupLocal] = useState<Location | null>(null);
  const [dropoff, setDropoffLocal] = useState<Location | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    passengers: 1,
    suitcases: 2,
  });
  const [selectedTripType, setSelectedTripType] = useState<TripType>('one-way');
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  
  const handlePickupSelect = (location: Location) => {
    setPickupLocal(location);
  };
  
  const handleDropoffSelect = (location: Location) => {
    setDropoffLocal(location);
  };
  
  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
  };
  
  const handleTripTypeSelect = (type: TripType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTripType(type);
  };
  
  const updatePassengerInfo = (field: keyof PassengerInfo, value: number) => {
    setPassengerInfo(prev => ({
      ...prev,
      [field]: Math.max(1, value),
    }));
  };
  

  
  const handleContinue = () => {
    // Use defaults if fields are missing
    const finalPickup = pickup || {
      id: '1',
      name: 'Default Pickup',
      address: 'Default pickup location',
      latitude: 37.7749,
      longitude: -122.4194,
    };
    
    const finalDropoff = dropoff || {
      id: '2',
      name: 'Default Destination',
      address: 'Default destination',
      latitude: 37.7849,
      longitude: -122.4094,
    };
    
    const finalDateTime = selectedDateTime || new Date();
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    // Format date and time for storage
    const dateString = finalDateTime.toISOString().split('T')[0];
    const timeString = finalDateTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    setPickup(finalPickup);
    setDropoff(finalDropoff);
    setDateTime(dateString, timeString);
    setPassengers(passengerInfo.passengers);
    setTripType(selectedTripType);

    router.push('/vehicle-selection');
  };
  
  // Make form validation more lenient - allow proceeding with defaults
  const isFormValid = true; // Always allow proceeding, use defaults if needed
  
  const getBookingTypeTitle = () => {
    switch (currentRide?.bookingType) {
      case 'airport':
        return 'Airport Transfer';
      case 'outstation':
        return 'Outstation Trip';
      case 'hourly':
        return 'Hourly Rental';
      case 'city':
      default:
        return 'City Ride';
    }
  };
  
  const getPickupPlaceholder = () => {
    switch (currentRide?.bookingType) {
      case 'airport':
        return 'Enter pickup location or select airport';
      case 'outstation':
        return 'Enter departure city';
      case 'hourly':
        return 'Enter starting location';
      case 'city':
      default:
        return 'Enter pickup location';
    }
  };
  
  const getDropoffPlaceholder = () => {
    switch (currentRide?.bookingType) {
      case 'airport':
        return 'Enter destination or select airport';
      case 'outstation':
        return 'Enter destination city';
      case 'hourly':
        return 'Enter first stop (optional)';
      case 'city':
      default:
        return 'Enter destination';
    }
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
          title: getBookingTypeTitle(),
          headerBackTitle: '',
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GlassCard style={styles.card}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Trip Details
          </Text>
          
          <View style={styles.locationContainer}>
            <GooglePlacesInput
              placeholder={getPickupPlaceholder()}
              value={pickup}
              onSelect={handlePickupSelect}
              label="Pickup Location"
            />

            <GooglePlacesInput
              placeholder={getDropoffPlaceholder()}
              value={dropoff}
              onSelect={handleDropoffSelect}
              label={currentRide?.bookingType === 'hourly' ? 'First Stop (Optional)' : 'Destination'}
            />
          </View>

          {/* Map Preview */}
          {pickup && dropoff && (
            <LiveMapTracking
              pickup={{ latitude: pickup.latitude, longitude: pickup.longitude }}
              dropoff={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
              height={200}
            />
          )}
          
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Trip Type
          </Text>
          
          <View style={styles.tripTypesContainer}>
            <TouchableOpacity
              style={[
                styles.tripTypeButton,
                { 
                  borderColor: selectedTripType === 'one-way' ? colorScheme.primary : colorScheme.border,
                  backgroundColor: selectedTripType === 'one-way' ? 'rgba(0, 255, 0, 0.1)' : 'transparent'
                }
              ]}
              onPress={() => handleTripTypeSelect('one-way')}
            >
              <Text style={[
                styles.tripTypeText, 
                { color: selectedTripType === 'one-way' ? colorScheme.primary : colorScheme.text }
              ]}>
                One-way
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tripTypeButton,
                { 
                  borderColor: selectedTripType === 'round-trip' ? colorScheme.primary : colorScheme.border,
                  backgroundColor: selectedTripType === 'round-trip' ? 'rgba(0, 255, 0, 0.1)' : 'transparent'
                }
              ]}
              onPress={() => handleTripTypeSelect('round-trip')}
            >
              <Text style={[
                styles.tripTypeText, 
                { color: selectedTripType === 'round-trip' ? colorScheme.primary : colorScheme.text }
              ]}>
                Round Trip
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tripTypeButton,
                { 
                  borderColor: selectedTripType === 'shared' ? colorScheme.primary : colorScheme.border,
                  backgroundColor: selectedTripType === 'shared' ? 'rgba(0, 255, 0, 0.1)' : 'transparent'
                }
              ]}
              onPress={() => handleTripTypeSelect('shared')}
            >
              <Text style={[
                styles.tripTypeText, 
                { color: selectedTripType === 'shared' ? colorScheme.primary : colorScheme.text }
              ]}>
                Shared
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Schedule
            </Text>
            <SchedulePicker
              date={selectedDateTime || undefined}
              onDateTimeChange={handleDateTimeSelect}
              placeholder="Select Date & Time"
              minimumDate={new Date()}
            />
          </View>
          
          {/* Passenger Info */}
          <View style={styles.passengerContainer}>
            <TouchableOpacity
              style={[
                styles.passengerInfoButton,
                { borderColor: colorScheme.border },
              ]}
              onPress={() => setShowPassengerModal(true)}
            >
              <Text style={[styles.passengerInfoButtonText, { color: colorScheme.text }]}>
                {passengerInfo.passengers} Passengers
              </Text>
            </TouchableOpacity>
          </View>
          

          
          {currentRide?.bookingType === 'hourly' && (
            <GlassCard style={styles.infoCard}>
              <Text style={[styles.infoTitle, { color: colorScheme.text }]}>
                Hourly Rental Information
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Minimum 4 hours booking
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Multiple stops allowed
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Driver will wait at each location
              </Text>
            </GlassCard>
          )}
          
          {currentRide?.bookingType === 'outstation' && (
            <GlassCard style={styles.infoCard}>
              <Text style={[styles.infoTitle, { color: colorScheme.text }]}>
                Outstation Trip Information
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Long distance travel between cities
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Driver accommodation included for overnight trips
              </Text>
              <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
                • Toll charges applicable
              </Text>
            </GlassCard>
          )}
        </GlassCard>

        <Button
          title="Continue to Select Car"
          onPress={handleContinue}
          disabled={!isFormValid}
          style={styles.continueButton}
        />
      </ScrollView>

      {/* Passenger Modal */}
      <Modal
        visible={showPassengerModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPassengerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.passengerModalContent, { backgroundColor: colorScheme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colorScheme.text }]}>
                Passenger Info
              </Text>
              <TouchableOpacity
                onPress={() => setShowPassengerModal(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colorScheme.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.passengerRow}>
              <View style={styles.passengerIconContainer}>
                <Users size={20} color={colorScheme.text} />
                <Text style={[styles.passengerLabel, { color: colorScheme.text }]}>
                  Passengers
                </Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: colorScheme.border }]}
                  onPress={() => updatePassengerInfo('passengers', passengerInfo.passengers - 1)}
                >
                  <Minus size={16} color={colorScheme.text} />
                </TouchableOpacity>
                <Text style={[styles.counterText, { color: colorScheme.text }]}>
                  {passengerInfo.passengers}
                </Text>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: colorScheme.border }]}
                  onPress={() => updatePassengerInfo('passengers', passengerInfo.passengers + 1)}
                >
                  <Plus size={16} color={colorScheme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.passengerRow}>
              <View style={styles.passengerIconContainer}>
                <Luggage size={20} color={colorScheme.text} />
                <Text style={[styles.passengerLabel, { color: colorScheme.text }]}>
                  Suitcases
                </Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: colorScheme.border }]}
                  onPress={() => updatePassengerInfo('suitcases', passengerInfo.suitcases - 1)}
                >
                  <Minus size={16} color={colorScheme.text} />
                </TouchableOpacity>
                <Text style={[styles.counterText, { color: colorScheme.text }]}>
                  {passengerInfo.suitcases}
                </Text>
                <TouchableOpacity
                  style={[styles.counterButton, { borderColor: colorScheme.border }]}
                  onPress={() => updatePassengerInfo('suitcases', passengerInfo.suitcases + 1)}
                >
                  <Plus size={16} color={colorScheme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.passengerNote, { color: colorScheme.subtext }]}>
              Our vehicles accommodate different group sizes. Sharing this info helps us send the right car for your trip.
            </Text>

            <Button
              title="Submit"
              onPress={() => setShowPassengerModal(false)}
              style={styles.confirmButton}
            />
          </View>
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
    paddingBottom: 40,
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  locationContainer: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  tripTypesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tripTypeButton: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  passengerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  passengerInfoButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerInfoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  continueButton: {
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  passengerModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  passengerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  passengerIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passengerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  passengerNote: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'left',
  },
  confirmButton: {
    marginTop: 8,
  },
});