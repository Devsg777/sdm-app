import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { LocationInput } from '@/components/ui/LocationInput';
import { SchedulePicker } from '@/components/ui/SchedulePicker';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { Location } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Minus, Plus, Users, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type OutstationType = 'oneway' | 'roundtrip';

interface PassengerInfo {
  passengers: number;
  suitcases: number;
}

interface RoundTripInfo {
  enabled: boolean;
  returnDate: Date | null;
  returnTime: Date | null;
}

export default function OutstationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setPickup, setDropoff, setDateTime, setPassengers, setBookingType } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  // Main state
  const [outstationType, setOutstationType] = useState<OutstationType>('oneway');
  const [pickup, setPickupLocal] = useState<Location | null>(null);
  const [dropoff, setDropoffLocal] = useState<Location | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Passenger info modal state
  const [passengerModalVisible, setPassengerModalVisible] = useState(false);
  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    passengers: 1,
    suitcases: 2
  });
  
  // Round trip state
  const [roundTrip, setRoundTrip] = useState<RoundTripInfo>({
    enabled: false,
    returnDate: null,
    returnTime: null
  });

  const handleOutstationTypeSelect = (type: OutstationType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setOutstationType(type);
    
    if (type === 'oneway') {
      setRoundTrip({
        enabled: false,
        returnDate: null,
        returnTime: null
      });
    } else {
      setRoundTrip(prev => ({
        ...prev,
        enabled: true
      }));
    }
  };

  const handlePickupSelect = (location: Location) => {
    setPickupLocal(location);
  };

  const handleDropoffSelect = (location: Location) => {
    setDropoffLocal(location);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleReturnDateSelect = (date: Date) => {
    setRoundTrip(prev => ({
      ...prev,
      returnDate: date,
      returnTime: date
    }));
  };

  const handlePassengerInfoChange = (field: keyof PassengerInfo, increment: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setPassengerInfo(prev => {
      const currentValue = prev[field];
      const newValue = increment 
        ? Math.min(currentValue + 1, field === 'passengers' ? 8 : 10)
        : Math.max(currentValue - 1, field === 'passengers' ? 1 : 0);
      
      return { ...prev, [field]: newValue };
    });
  };

  // Make form validation more lenient - allow proceeding with defaults
  const isFormValid = true; // Always allow proceeding, use defaults if needed
  
  const handleSelectCars = () => {
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
    
    const finalDateTime = selectedDate || new Date();
    
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
    
    setBookingType('outstation');
    setPickup(finalPickup);
    setDropoff(finalDropoff);
    setDateTime(dateString, timeString);
    setPassengers(passengerInfo.passengers);
    
    router.push('/cars');
  };

  const PassengerInfoModal = () => (
    <Modal
      visible={passengerModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setPassengerModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent, 
          { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle, 
              { color: theme === 'dark' ? '#ffffff' : '#000000' }
            ]}>
              Passenger Info
            </Text>
            <TouchableOpacity
              onPress={() => setPassengerModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color={theme === 'dark' ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.passengerInfoRow}>
            <View style={styles.passengerInfoItem}>
              <Users size={20} color={theme === 'dark' ? '#ffffff' : '#000000'} />
              <Text style={[
                styles.passengerInfoLabel, 
                { color: theme === 'dark' ? '#ffffff' : '#000000' }
              ]}>
                Passengers
              </Text>
            </View>
            <View style={styles.passengerInfoControls}>
              <TouchableOpacity
                style={[
                  styles.passengerButton, 
                  { borderColor: theme === 'dark' ? '#333333' : '#cccccc' }
                ]}
                onPress={() => handlePassengerInfoChange('passengers', false)}
              >
                <Minus size={16} color={theme === 'dark' ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
              <Text style={[
                styles.passengerCount, 
                { color: theme === 'dark' ? '#ffffff' : '#000000' }
              ]}>
                {passengerInfo.passengers}
              </Text>
              <TouchableOpacity
                style={[
                  styles.passengerButton, 
                  { borderColor: theme === 'dark' ? '#333333' : '#cccccc' }
                ]}
                onPress={() => handlePassengerInfoChange('passengers', true)}
              >
                <Plus size={16} color={theme === 'dark' ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.passengerInfoRow}>
            <View style={styles.passengerInfoItem}>
              <Text style={[
                styles.passengerInfoIcon, 
                { color: theme === 'dark' ? '#ffffff' : '#000000' }
              ]}>🧳</Text>
              <Text style={[
                styles.passengerInfoLabel, 
                { color: theme === 'dark' ? '#ffffff' : '#000000' }
              ]}>
                Suitcases
              </Text>
            </View>
            <View style={styles.passengerInfoControls}>
              <TouchableOpacity
                style={[
                  styles.passengerButton, 
                  { borderColor: theme === 'dark' ? '#333333' : '#cccccc' }
                ]}
                onPress={() => handlePassengerInfoChange('suitcases', false)}
              >
                <Minus size={16} color={theme === 'dark' ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
              <Text style={[
                styles.passengerCount, 
                { color: theme === 'dark' ? '#ffffff' : '#000000' }
              ]}>
                {passengerInfo.suitcases}
              </Text>
              <TouchableOpacity
                style={[
                  styles.passengerButton, 
                  { borderColor: theme === 'dark' ? '#333333' : '#cccccc' }
                ]}
                onPress={() => handlePassengerInfoChange('suitcases', true)}
              >
                <Plus size={16} color={theme === 'dark' ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={[
            styles.passengerInfoNote, 
            { color: theme === 'dark' ? '#cccccc' : '#666666' }
          ]}>
            Our EVs seat 4 passengers. Fits around 4 large suitcases. Sharing this helps us send the right car.
          </Text>
          
          <Button
            title="Submit"
            onPress={() => setPassengerModalVisible(false)}
            style={styles.submitButton}
          />
        </View>
      </View>
    </Modal>
  );

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
          title: 'Outstation',
          headerBackTitle: '',
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Outstation Type Selection */}
        <View style={styles.outstationTypeContainer}>
          <TouchableOpacity
            style={[
              styles.outstationTypeButton,
              outstationType === 'oneway' && styles.outstationTypeButtonActive,
              { 
                backgroundColor: outstationType === 'oneway' 
                  ? colorScheme.surface 
                  : 'transparent',
                borderColor: outstationType === 'oneway' 
                  ? colorScheme.primary 
                  : colorScheme.border
              }
            ]}
            onPress={() => handleOutstationTypeSelect('oneway')}
          >
            <Text style={[
              styles.outstationTypeText,
              { color: outstationType === 'oneway' ? colorScheme.text : colorScheme.subtext }
            ]}>
              One way
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.outstationTypeButton,
              outstationType === 'roundtrip' && styles.outstationTypeButtonActive,
              { 
                backgroundColor: outstationType === 'roundtrip' 
                  ? colorScheme.surface 
                  : 'transparent',
                borderColor: outstationType === 'roundtrip' 
                  ? colorScheme.primary 
                  : colorScheme.border
              }
            ]}
            onPress={() => handleOutstationTypeSelect('roundtrip')}
          >
            <Text style={[
              styles.outstationTypeText,
              { color: outstationType === 'roundtrip' ? colorScheme.text : colorScheme.subtext }
            ]}>
              Round Trip
            </Text>
          </TouchableOpacity>
        </View>

        <GlassCard style={styles.card}>
          {/* Location Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Location
            </Text>
            
            <View style={styles.locationContainer}>
              <LocationInput
                placeholder="Whitefield, Bengaluru, Karnataka, India"
                value={pickup}
                onSelect={handlePickupSelect}
                label=""
              />
              
              <LocationInput
                placeholder="XJXR+W5J, Sathya Nagar, Maruthi Sevanagar, Be"
                value={dropoff}
                onSelect={handleDropoffSelect}
                label=""
              />
            </View>
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Schedule
            </Text>
            <SchedulePicker
              date={selectedDate || undefined}
              onDateTimeChange={handleDateSelect}
              placeholder="July 31, 1:55 pm"
              minimumDate={new Date()}
            />
            
            {/* Round Trip Return Schedule */}
            {outstationType === 'roundtrip' && (
              <View style={styles.returnScheduleContainer}>
                <SchedulePicker
                  date={roundTrip.returnDate || undefined}
                  onDateTimeChange={handleReturnDateSelect}
                  placeholder="Drop off time"
                  minimumDate={selectedDate || new Date()}
                />
              </View>
            )}
          </View>

          {/* Passenger Info */}
          <View style={styles.passengerContainer}>
            <TouchableOpacity
              style={[
                styles.passengerInfoButton,
                { borderColor: colorScheme.border }
              ]}
              onPress={() => setPassengerModalVisible(true)}
            >
              <Text style={[styles.passengerInfoButtonText, { color: colorScheme.text }]}>
                {passengerInfo.passengers} Passengers
              </Text>
            </TouchableOpacity>
          </View>

          {/* Work Travel Checkbox */}
          <View style={styles.workTravelContainer}>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox, 
                { borderColor: colorScheme.border }
              ]} />
              <Text style={[styles.workTravelText, { color: colorScheme.text }]}>
                Bill to my company - I&apos;m travelling for work
              </Text>
            </View>
          </View>
        </GlassCard>

        <Button
          title="Select Cars"
          onPress={handleSelectCars}
          disabled={!isFormValid}
          style={styles.selectCarsButton}
        />
      </ScrollView>

      <PassengerInfoModal />
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
  outstationTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  outstationTypeButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outstationTypeButtonActive: {
    // Active styles handled in component
  },
  outstationTypeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    padding: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },

  locationContainer: {
    gap: 12,
  },
  returnScheduleContainer: {
    marginTop: 12,
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
  workTravelContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
  },
  workTravelText: {
    fontSize: 14,
    flex: 1,
  },
  selectCarsButton: {
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
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
  passengerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  passengerInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passengerInfoIcon: {
    fontSize: 20,
  },
  passengerInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  passengerInfoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  passengerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerCount: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  passengerInfoNote: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});