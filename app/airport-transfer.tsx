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
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

type AirportTransferType = 'drop' | 'pickup';

interface GuestInfo {
  passengers: number;
  suitcases: number;
}

interface RoundTripInfo {
  enabled: boolean;
  dropoffDate: Date | null;
  dropoffTime: Date | null;
}

export default function AirportTransferScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { setPickup, setDropoff, setDateTime, setPassengers, setBookingType } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  // Main state
  const [transferType, setTransferType] = useState<AirportTransferType>('drop');
  const [pickup, setPickupLocal] = useState<Location | null>(null);
  const [dropoff, setDropoffLocal] = useState<Location | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [flightNumber, setFlightNumber] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<'T1' | 'T2' | null>(null);
  
  // Guest info modal state
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    passengers: 2,
    suitcases: 2
  });
  
  // Round trip state
  const [roundTrip, setRoundTrip] = useState<RoundTripInfo>({
    enabled: false,
    dropoffDate: null,
    dropoffTime: null
  });

  const handleTransferTypeSelect = (type: AirportTransferType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTransferType(type);
    // Reset location inputs when switching types
    setPickupLocal(null);
    setDropoffLocal(null);
    setSelectedTerminal(null);
  };

  const handleTerminalSelect = (terminal: 'T1' | 'T2') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedTerminal(terminal);
    
    // Create airport location based on terminal
    const airportLocation: Location = {
      id: `airport-${terminal}`,
      name: `KIA (BLR) - ${terminal}`,
      address: `Kempegowda International Airport, Terminal ${terminal}`,
      latitude: 13.1986,
      longitude: 77.7066
    };
    
    if (transferType === 'drop') {
      setDropoffLocal(airportLocation);
    } else {
      setPickupLocal(airportLocation);
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
    // SchedulePicker combines date and time, so no separate time state needed
  };

  const handleGuestInfoChange = (field: keyof GuestInfo, increment: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setGuestInfo(prev => {
      const currentValue = prev[field];
      const newValue = increment 
        ? Math.min(currentValue + 1, field === 'passengers' ? 8 : 10)
        : Math.max(currentValue - 1, field === 'passengers' ? 1 : 0);
      
      return { ...prev, [field]: newValue };
    });
  };

  const handleRoundTripToggle = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRoundTrip(prev => ({
      ...prev,
      enabled: !prev.enabled,
      dropoffDate: !prev.enabled ? null : prev.dropoffDate,
      dropoffTime: !prev.enabled ? null : prev.dropoffTime
    }));
  };

  const handleRoundTripRemove = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setRoundTrip({
      enabled: false,
      dropoffDate: null,
      dropoffTime: null
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
      name: 'KIA (BLR) - T1',
      address: 'Kempegowda International Airport, Terminal 1',
      latitude: 13.1986,
      longitude: 77.7066,
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
    
    setBookingType('airport');
    setPickup(finalPickup);
    setDropoff(finalDropoff);
    setDateTime(dateString, timeString);
    setPassengers(guestInfo.passengers);
    
    router.push('/cars');
  };

  const GuestInfoModal = () => (
    <Modal
      visible={guestModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setGuestModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#ffffff' }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: '#000000' }]}>
              Guest Info
            </Text>
            <TouchableOpacity
              onPress={() => setGuestModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.guestInfoRow}>
            <View style={styles.guestInfoItem}>
              <Users size={20} color="#000000" />
              <Text style={[styles.guestInfoLabel, { color: '#000000' }]}>
                Passengers
              </Text>
            </View>
            <View style={styles.guestInfoControls}>
              <TouchableOpacity
                style={[styles.guestButton, { borderColor: '#cccccc' }]}
                onPress={() => handleGuestInfoChange('passengers', false)}
              >
                <Minus size={16} color="#000000" />
              </TouchableOpacity>
              <Text style={[styles.guestCount, { color: '#000000' }]}>
                {guestInfo.passengers}
              </Text>
              <TouchableOpacity
                style={[styles.guestButton, { borderColor: '#cccccc' }]}
                onPress={() => handleGuestInfoChange('passengers', true)}
              >
                <Plus size={16} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.guestInfoRow}>
            <View style={styles.guestInfoItem}>
              <Text style={[styles.guestInfoIcon, { color: '#000000' }]}>🧳</Text>
              <Text style={[styles.guestInfoLabel, { color: '#000000' }]}>
                Suitcases
              </Text>
            </View>
            <View style={styles.guestInfoControls}>
              <TouchableOpacity
                style={[styles.guestButton, { borderColor: '#cccccc' }]}
                onPress={() => handleGuestInfoChange('suitcases', false)}
              >
                <Minus size={16} color="#000000" />
              </TouchableOpacity>
              <Text style={[styles.guestCount, { color: '#000000' }]}>
                {guestInfo.suitcases}
              </Text>
              <TouchableOpacity
                style={[styles.guestButton, { borderColor: '#cccccc' }]}
                onPress={() => handleGuestInfoChange('suitcases', true)}
              >
                <Plus size={16} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Button
            title="Submit"
            onPress={() => setGuestModalVisible(false)}
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
          title: 'Airport Transfers',
          headerBackTitle: '',
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Transfer Type Selection */}
        <View style={styles.transferTypeContainer}>
          <TouchableOpacity
            style={[
              styles.transferTypeButton,
              transferType === 'drop' && styles.transferTypeButtonActive,
              { 
                backgroundColor: transferType === 'drop' 
                  ? colorScheme.surface 
                  : 'transparent',
                borderColor: transferType === 'drop' 
                  ? colorScheme.primary 
                  : colorScheme.border
              }
            ]}
            onPress={() => handleTransferTypeSelect('drop')}
          >
            <Text style={[
              styles.transferTypeText,
              { color: transferType === 'drop' ? colorScheme.text : colorScheme.subtext }
            ]}>
              Drop To Airport
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.transferTypeButton,
              transferType === 'pickup' && styles.transferTypeButtonActive,
              { 
                backgroundColor: transferType === 'pickup' 
                  ? colorScheme.surface 
                  : 'transparent',
                borderColor: transferType === 'pickup' 
                  ? colorScheme.primary 
                  : colorScheme.border
              }
            ]}
            onPress={() => handleTransferTypeSelect('pickup')}
          >
            <Text style={[
              styles.transferTypeText,
              { color: transferType === 'pickup' ? colorScheme.text : colorScheme.subtext }
            ]}>
              Pick-up From Airport
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
                placeholder={transferType === 'drop' ? 'Pick-up' : 'Drop-off'}
                value={transferType === 'drop' ? pickup : dropoff}
                onSelect={transferType === 'drop' ? handlePickupSelect : handleDropoffSelect}
                label=""
              />
              
              {/* Airport Terminal Selection */}
              <View style={styles.airportContainer}>
                <Text style={[styles.airportLabel, { color: colorScheme.text }]}>
                  KIA (BLR)
                </Text>
                <View style={styles.terminalContainer}>
                  <TouchableOpacity
                    style={[
                      styles.terminalButton,
                      selectedTerminal === 'T1' && styles.terminalButtonActive,
                      { 
                        backgroundColor: selectedTerminal === 'T1' 
                          ? colorScheme.primary 
                          : colorScheme.surface,
                        borderColor: colorScheme.border
                      }
                    ]}
                    onPress={() => handleTerminalSelect('T1')}
                  >
                    <Text style={[
                      styles.terminalText,
                      { color: selectedTerminal === 'T1' ? '#fff' : colorScheme.text }
                    ]}>
                      T1
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.terminalButton,
                      selectedTerminal === 'T2' && styles.terminalButtonActive,
                      { 
                        backgroundColor: selectedTerminal === 'T2' 
                          ? colorScheme.primary 
                          : colorScheme.surface,
                        borderColor: colorScheme.border
                      }
                    ]}
                    onPress={() => handleTerminalSelect('T2')}
                  >
                    <Text style={[
                      styles.terminalText,
                      { color: selectedTerminal === 'T2' ? '#fff' : colorScheme.text }
                    ]}>
                      T2
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
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
              placeholder="Pick-up"
              minimumDate={new Date()}
            />
          </View>

          {/* Flight Number Section */}
          <View style={styles.section}>
            <View style={styles.flightNumberHeader}>
              <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                Flight No.
              </Text>
              <Text style={[styles.moreInfo, { color: colorScheme.primary }]}>
                More Info
              </Text>
            </View>
            <TextInput
              style={[
                styles.flightNumberInput,
                { 
                  backgroundColor: colorScheme.surface,
                  borderColor: colorScheme.border,
                  color: colorScheme.text
                }
              ]}
              placeholder="Flight Number (optional)"
              placeholderTextColor={colorScheme.subtext}
              value={flightNumber}
              onChangeText={setFlightNumber}
            />
          </View>

          {/* Guest Info and Round Trip */}
          <View style={styles.bottomControls}>
            <TouchableOpacity
              style={[
                styles.guestInfoButton,
                { borderColor: colorScheme.border }
              ]}
              onPress={() => setGuestModalVisible(true)}
            >
              <Text style={[styles.guestInfoButtonText, { color: colorScheme.text }]}>
                {guestInfo.passengers} Passengers
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.roundTripButton,
                { borderColor: colorScheme.border }
              ]}
              onPress={handleRoundTripToggle}
            >
              <Text style={[styles.roundTripButtonText, { color: colorScheme.text }]}>
                Round Trip
              </Text>
            </TouchableOpacity>
          </View>

          {/* Round Trip Details */}
          {roundTrip.enabled && (
            <View style={styles.roundTripDetails}>
              <View style={styles.roundTripHeader}>
                <Text style={[styles.roundTripTitle, { color: colorScheme.text }]}>
                  Round Trip
                </Text>
                <TouchableOpacity
                  style={[
                    styles.removeButton,
                    { borderColor: colorScheme.border }
                  ]}
                  onPress={handleRoundTripRemove}
                >
                  <Text style={[styles.removeButtonText, { color: colorScheme.text }]}>
                    Remove
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                  Location
                </Text>
                <LocationInput
                  placeholder="Pick-up"
                  value={null}
                  onSelect={() => {}}
                  label=""
                />
                
                <View style={styles.airportContainer}>
                  <Text style={[styles.airportLabel, { color: colorScheme.text }]}>
                    KIA (BLR)
                  </Text>
                  <View style={styles.terminalContainer}>
                    <TouchableOpacity style={[styles.terminalButton, { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }]}>
                      <Text style={[styles.terminalText, { color: colorScheme.text }]}>T1</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.terminalButton, { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }]}>
                      <Text style={[styles.terminalText, { color: colorScheme.text }]}>T2</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
                  Schedule
                </Text>
                <SchedulePicker
                  date={roundTrip.dropoffDate || undefined}
                  onDateTimeChange={(date) => setRoundTrip(prev => ({ ...prev, dropoffDate: date }))}
                  placeholder="Date and Time"
                  minimumDate={new Date()}
                />
              </View>
            </View>
          )}
        </GlassCard>

        <Button
          title="Select Cars"
          onPress={handleSelectCars}
          disabled={!isFormValid}
          style={styles.selectCarsButton}
        />
      </ScrollView>

      <GuestInfoModal />
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
  transferTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  transferTypeButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transferTypeButtonActive: {
    // Active styles handled in component
  },
  transferTypeText: {
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
  airportContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  airportLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  terminalContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  terminalButton: {
    width: 40,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  terminalButtonActive: {
    // Active styles handled in component
  },
  terminalText: {
    fontSize: 14,
    fontWeight: '600',
  },
  flightNumberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moreInfo: {
    fontSize: 14,
    fontWeight: '500',
  },
  flightNumberInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  bottomControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  guestInfoButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestInfoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roundTripButton: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roundTripButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  roundTripDetails: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  roundTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  roundTripTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  removeButton: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectCarsButton: {
    marginTop: 8,
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
  guestInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  guestInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestInfoIcon: {
    fontSize: 20,
  },
  guestInfoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  guestInfoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  guestButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestCount: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 20,
    textAlign: 'center',
  },
  guestInfoNote: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  submitButton: {
    marginTop: 8,
  },
});