import colors from '@/constants/colors';
import { useLocations } from '@/hooks/useLocations';
import { useRidesWithSupabase } from '@/hooks/useRidesWithSupabase';
import { useTheme } from '@/hooks/useTheme';
import { Location } from '@/types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GooglePlacesInput } from './ui/GooglePlacesInput';
import { LiveMapTracking } from './ui/LiveMapTracking';

export default function BookingForm() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const {
    currentRide,
    setBookingType,
    setTripType,
    setPickup,
    setDropoff,
    setDateTime,
    setPassengers,
    setHours,
    resetRide,
  } = useRidesWithSupabase();

  const {
    popularLocations,
    savedLocations,
    fetchPopularLocations,
    fetchSavedLocations,
  } = useLocations();

  const [bookingType, setLocalBookingType] = useState<string>(currentRide?.bookingType || 'city');
  const [tripType, setLocalTripType] = useState<'one-way' | 'round-trip'>(currentRide?.tripType || 'one-way');
  const [pickup, setLocalPickup] = useState<Location | null>(currentRide?.pickup || null);
  const [dropoff, setLocalDropoff] = useState<Location | null>(currentRide?.dropoff || null);
  const [date, setLocalDate] = useState<Date>(
    currentRide?.date ? new Date(currentRide.date) : new Date()
  );
  const [time, setLocalTime] = useState<Date>(
    currentRide?.time
      ? new Date(`2023-01-01T${currentRide.time}:00`)
      : new Date(Date.now() + 30 * 60 * 1000)
  );
  const [passengers, setLocalPassengers] = useState<number>(currentRide?.passengers || 1);
  const [hours, setLocalHours] = useState<string>(currentRide?.hours || '4');

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPopularLocations();
    fetchSavedLocations();
  }, []);

  useEffect(() => {
    resetRide();
  }, []);

  const handleBookingTypeSelect = (type: string) => {
    setLocalBookingType(type);
    setBookingType(type);
  };

  const handleTripTypeSelect = (type: 'one-way' | 'round-trip') => {
    setLocalTripType(type);
    setTripType(type);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setLocalDate(selectedDate);
      setDateTime(
        selectedDate.toISOString().split('T')[0],
        time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setLocalTime(selectedTime);
      setDateTime(
        date.toISOString().split('T')[0],
        selectedTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      );
    }
  };

  const handlePassengerChange = (count: number) => {
    if (count >= 1 && count <= 10) {
      setLocalPassengers(count);
      setPassengers(count);
    }
  };

  const handleHoursSelect = (hoursValue: string) => {
    setLocalHours(hoursValue);
    setHours(hoursValue);
  };

  const handleContinue = () => {
    if (!pickup) {
      alert('Please select a pickup location');
      return;
    }

    if (bookingType !== 'hourly' && !dropoff) {
      alert('Please select a dropoff location');
      return;
    }

    router.push('/cars');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      )}

      {/* Booking Type Selection */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          Select Service
        </Text>

        <View style={styles.bookingTypeContainer}>
          <TouchableOpacity
            style={[
              styles.bookingTypeButton,
              bookingType === 'city' && styles.bookingTypeButtonActive,
              { backgroundColor: colorScheme.card }
            ]}
            onPress={() => handleBookingTypeSelect('city')}
          >
            <Text style={[
              styles.bookingTypeText,
              bookingType === 'city' && styles.bookingTypeTextActive,
              { color: bookingType === 'city' ? '#22C55E' : colorScheme.text }
            ]}>
              City
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookingTypeButton,
              bookingType === 'airport' && styles.bookingTypeButtonActive,
              { backgroundColor: colorScheme.card }
            ]}
            onPress={() => handleBookingTypeSelect('airport')}
          >
            <Text style={[
              styles.bookingTypeText,
              bookingType === 'airport' && styles.bookingTypeTextActive,
              { color: bookingType === 'airport' ? '#22C55E' : colorScheme.text }
            ]}>
              Airport
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookingTypeButton,
              bookingType === 'outstation' && styles.bookingTypeButtonActive,
              { backgroundColor: colorScheme.card }
            ]}
            onPress={() => handleBookingTypeSelect('outstation')}
          >
            <Text style={[
              styles.bookingTypeText,
              bookingType === 'outstation' && styles.bookingTypeTextActive,
              { color: bookingType === 'outstation' ? '#22C55E' : colorScheme.text }
            ]}>
              Outstation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookingTypeButton,
              bookingType === 'hourly' && styles.bookingTypeButtonActive,
              { backgroundColor: colorScheme.card }
            ]}
            onPress={() => handleBookingTypeSelect('hourly')}
          >
            <Text style={[
              styles.bookingTypeText,
              bookingType === 'hourly' && styles.bookingTypeTextActive,
              { color: bookingType === 'hourly' ? '#22C55E' : colorScheme.text }
            ]}>
              Hourly
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip Type Selection (for Airport and Outstation) */}
      {(bookingType === 'airport' || bookingType === 'outstation') && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Trip Type
          </Text>

          <View style={styles.tripTypeContainer}>
            <TouchableOpacity
              style={[
                styles.tripTypeButton,
                tripType === 'one-way' && styles.tripTypeButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleTripTypeSelect('one-way')}
            >
              <Text style={[
                styles.tripTypeText,
                tripType === 'one-way' && styles.tripTypeTextActive,
                { color: tripType === 'one-way' ? '#22C55E' : colorScheme.text }
              ]}>
                One Way
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tripTypeButton,
                tripType === 'round-trip' && styles.tripTypeButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleTripTypeSelect('round-trip')}
            >
              <Text style={[
                styles.tripTypeText,
                tripType === 'round-trip' && styles.tripTypeTextActive,
                { color: tripType === 'round-trip' ? '#22C55E' : colorScheme.text }
              ]}>
                Round Trip
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Pickup Location Autocomplete */}
      <View style={[styles.section, { zIndex: 3 }]}>
        <GooglePlacesInput
          label="Pickup Location"
          placeholder="Enter pickup location"
          value={pickup}
          onSelect={(loc) => {
            setLocalPickup(loc);
            setPickup(loc);
          }}
        />
      </View>

      {/* Dropoff Location Autocomplete (not for Hourly) */}
      {bookingType !== 'hourly' && (
        <View style={[styles.section, { zIndex: 2 }]}>
          <GooglePlacesInput
            label="Dropoff Location"
            placeholder="Enter dropoff location"
            value={dropoff}
            onSelect={(loc) => {
              setLocalDropoff(loc);
              setDropoff(loc);
            }}
          />
        </View>
      )}

      {/* Date and Time */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          When do you need the ride?
        </Text>

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: colorScheme.card }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#22C55E" />
            <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: colorScheme.card }]}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color="#22C55E" />
            <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>
              {formatTime(time)}
            </Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* Passengers */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
          Number of Passengers
        </Text>

        <View style={styles.passengersContainer}>
          <TouchableOpacity
            style={[styles.passengerButton, { backgroundColor: colorScheme.card }]}
            onPress={() => handlePassengerChange(passengers - 1)}
            disabled={passengers <= 1}
          >
            <Text style={[styles.passengerButtonText, { color: colorScheme.text }]}>-</Text>
          </TouchableOpacity>

          <View style={[styles.passengerCount, { backgroundColor: colorScheme.card }]}>
            <Users size={16} color="#22C55E" style={styles.passengerIcon} />
            <Text style={[styles.passengerCountText, { color: colorScheme.text }]}>
              {passengers}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.passengerButton, { backgroundColor: colorScheme.card }]}
            onPress={() => handlePassengerChange(passengers + 1)}
            disabled={passengers >= 10}
          >
            <Text style={[styles.passengerButtonText, { color: colorScheme.text }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hours Selection (for Hourly) */}
      {bookingType === 'hourly' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Package Hours
          </Text>

          <View style={styles.hoursContainer}>
            <TouchableOpacity
              style={[
                styles.hoursButton,
                hours === '2' && styles.hoursButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleHoursSelect('2')}
            >
              <Text style={[
                styles.hoursText,
                hours === '2' && styles.hoursTextActive,
                { color: hours === '2' ? '#22C55E' : colorScheme.text }
              ]}>
                2 Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.hoursButton,
                hours === '4' && styles.hoursButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleHoursSelect('4')}
            >
              <Text style={[
                styles.hoursText,
                hours === '4' && styles.hoursTextActive,
                { color: hours === '4' ? '#22C55E' : colorScheme.text }
              ]}>
                4 Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.hoursButton,
                hours === '8' && styles.hoursButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleHoursSelect('8')}
            >
              <Text style={[
                styles.hoursText,
                hours === '8' && styles.hoursTextActive,
                { color: hours === '8' ? '#22C55E' : colorScheme.text }
              ]}>
                8 Hours
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.hoursButton,
                hours === '12' && styles.hoursButtonActive,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={() => handleHoursSelect('12')}
            >
              <Text style={[
                styles.hoursText,
                hours === '12' && styles.hoursTextActive,
                { color: hours === '12' ? '#22C55E' : colorScheme.text }
              ]}>
                12 Hours
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map Preview when both locations set */}
      {pickup && dropoff && (
        <View style={{ marginBottom: 16 }}>
          <LiveMapTracking
            pickup={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            dropoff={{ latitude: dropoff.latitude, longitude: dropoff.longitude }}
            isActive={false}
            height={240}
          />
        </View>
      )}

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, { backgroundColor: '#22C55E' }]}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  bookingTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  bookingTypeButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bookingTypeButtonActive: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  bookingTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bookingTypeTextActive: {
    fontWeight: '600',
  },
  tripTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripTypeButtonActive: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  tripTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripTypeTextActive: {
    fontWeight: '600',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  locationPlaceholder: {
    fontWeight: '400',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  timeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  passengersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  passengerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passengerButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  passengerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  passengerIcon: {
    marginRight: 8,
  },
  passengerCountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  hoursContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  hoursButton: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  hoursButtonActive: {
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  hoursText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hoursTextActive: {
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 40,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});