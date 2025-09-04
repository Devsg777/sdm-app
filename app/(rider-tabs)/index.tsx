import { AppHeader } from '@/components/ui/AppHeader';
import { CustomCalendar } from '@/components/ui/CustomCalendar';
import { DrawerMenu } from '@/components/ui/DrawerMenu';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { BookingType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Calendar,
  Car,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  Minus,
  Plane,
  Plus,
  User,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Generate time slots with 30-minute intervals from 09:00 to 23:30
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

// Generate time slots for outstation (1-24 hours with 30-minute intervals)
const generateOutstationTimeSlots = () => {
  const slots = [];
  for (let hour = 1; hour <= 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 24) { // Don't add 24:30
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();
const outstationTimeSlots = generateOutstationTimeSlots();

// Hours options for hourly rental
const hoursOptions = ['2 Hours', '4 Hours', '6 Hours', '8 Hours', '10 Hours', '12 Hours'];

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setBookingType, setPickup, setDropoff, setDateTime, setTripType, setHours: setRideHours, setPassengers } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<BookingType>((params.activeTab as BookingType) || 'city');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [date, setDate] = useState('Select Date');
  const [time, setTime] = useState('Select Time');
  const [returnDate, setReturnDate] = useState('Return Date');
  const [returnTime, setReturnTime] = useState('Return Time');
  const [hours, setHours] = useState('Select hours');
  const [activeMapButton, setActiveMapButton] = useState('pickup');
  const [isRoundTrip, setIsRoundTrip] = useState(false);
  const [tripDirection, setTripDirection] = useState('pickup'); // 'pickup' or 'drop'
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  
  // Date and Time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showReturnDatePicker, setShowReturnDatePicker] = useState(false);
  const [showReturnTimePicker, setShowReturnTimePicker] = useState(false);
  const [showHoursPicker, setShowHoursPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedReturnDate, setSelectedReturnDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedReturnTime, setSelectedReturnTime] = useState('');
  
  // Guest info modal state
  const [showGuestModal, setShowGuestModal] = useState(false);
  
  // Special instructions state
  const [luggageCount, setLuggageCount] = useState(0);
  const [travelingWithPet, setTravelingWithPet] = useState(false);
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [specialInstructionsText, setSpecialInstructionsText] = useState('');
  const [willBeSavedAs, setWillBeSavedAs] = useState('');

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Update special instructions text when values change
  useEffect(() => {
    let text = '';
    let savedAs = '';
    
    if (luggageCount > 0) {
      text += `${luggageCount} luggage item${luggageCount > 1 ? 's' : ''}`;
      savedAs += `${luggageCount} luggage item${luggageCount > 1 ? 's' : ''}`;
    }
    
    if (travelingWithPet) {
      text += text ? ', Traveling with pet' : 'Traveling with pet';
      savedAs += savedAs ? ', Traveling with pet' : 'Traveling with pet';
    }
    
    if (additionalRequirements) {
      text += text ? ', ' + additionalRequirements : additionalRequirements;
      savedAs += savedAs ? ', ' + additionalRequirements : additionalRequirements;
    }
    
    setSpecialInstructionsText(text);
    
    if (savedAs) {
      setWillBeSavedAs(`Will be saved as: ${savedAs}`);
    } else {
      setWillBeSavedAs('');
    }
  }, [luggageCount, travelingWithPet, additionalRequirements]);

  // Check if all required fields are filled
  const areAllFieldsFilled = () => {
    const hasPickup = pickupLocation.trim() !== '';
    const hasDropoff = dropoffLocation.trim() !== '';
    const hasDate = date !== 'Select Date';
    const hasTime = time !== 'Select Time';
    const hasReturnDate = returnDate !== 'Return Date';
    const hasReturnTime = returnTime !== 'Return Time';
    
    switch (activeTab) {
      case 'airport':
        return hasPickup && hasDropoff && hasDate && hasTime;
      case 'outstation':
        if (isRoundTrip) {
          return hasPickup && hasDropoff && hasDate && hasTime && hasReturnDate && hasReturnTime;
        }
        return hasPickup && hasDropoff && hasDate && hasTime;
      case 'hourly':
        return hasPickup && hours !== 'Select hours' && hasDate && hasTime;
      case 'city':
      default:
        return hasPickup && hasDropoff && hasDate && hasTime;
    }
  };

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDrawerVisible(true);
  };

  const handleTabPress = (tab: BookingType) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(tab);
    setBookingType(tab);
  };



  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setTime(time);
    setShowTimePicker(false);
  };

  const handleReturnTimeSelect = (time: string) => {
    setSelectedReturnTime(time);
    setReturnTime(time);
    setShowReturnTimePicker(false);
  };

  const handleHoursSelect = (selectedHours: string) => {
    setHours(selectedHours);
    setShowHoursPicker(false);
  };

  const handleGuestCountChange = (increment: boolean) => {
    if (increment && guestCount < 10) {
      setGuestCount(guestCount + 1);
    } else if (!increment && guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const handleLuggageCountChange = (increment: boolean) => {
    if (increment && luggageCount < 10) {
      setLuggageCount(luggageCount + 1);
    } else if (!increment && luggageCount > 0) {
      setLuggageCount(luggageCount - 1);
    }
  };

  const handleContinue = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Save the current ride details to the store
    if (pickupLocation) {
      setPickup({
        id: '1',
        name: 'Pickup',
        address: pickupLocation,
        latitude: 12.9716,
        longitude: 77.5946
      });
    }
    
    if (dropoffLocation) {
      setDropoff({
        id: '2',
        name: 'Dropoff',
        address: dropoffLocation,
        latitude: 13.0016,
        longitude: 77.6246
      });
    }
    
    setDateTime(date, time);
    setTripType(isRoundTrip ? 'round-trip' : 'one-way');
    
    // Save passenger count
    setPassengers(guestCount);
    
    // For hourly rental, also save the selected hours
    if (activeTab === 'hourly' && hours !== 'Select hours') {
      setRideHours(hours);
    }
    
    // Navigate to cars selection page for all booking types
    router.push('/cars');
  };

  const renderCityRideForm = () => (
    <>
      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <MapPin size={20} color="#22C55E" />
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Pick-up location"
          placeholderTextColor={colorScheme.subtext}
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <View style={[styles.dropoffIcon, { backgroundColor: '#A855F7' }]}>
          <MapPin size={16} color="#FFFFFF" />
        </View>
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Drop-off location"
          placeholderTextColor={colorScheme.subtext}
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />
      </View>

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity 
          style={[styles.dateContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{date}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{time}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderAirportTaxiForm = () => (
    <>
      <View style={styles.airportToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.airportToggleButton, 
            styles.airportToggleButtonLeft,
            tripDirection === 'pickup' && { backgroundColor: '#22C55E' },
            tripDirection !== 'pickup' && { backgroundColor: colorScheme.card }
          ]}
          onPress={() => setTripDirection('pickup')}
        >
          <Text style={[
            styles.airportToggleText, 
            { color: tripDirection === 'pickup' ? '#FFFFFF' : colorScheme.text }
          ]}>
            Pick-up 
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.airportToggleButton, 
            styles.airportToggleButtonRight,
            tripDirection === 'drop' && { backgroundColor: '#22C55E' },
            tripDirection !== 'drop' && { backgroundColor: colorScheme.card }
          ]}
          onPress={() => setTripDirection('drop')}
        >
          <Text style={[
            styles.airportToggleText, 
            { color: tripDirection === 'drop' ? '#FFFFFF' : colorScheme.text }
          ]}>
            Drop 
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.roundTripContainer}>
        <TouchableOpacity 
          style={styles.roundTripCheckbox}
          onPress={() => setIsRoundTrip(!isRoundTrip)}
        >
          <View style={[
            styles.circularCheckbox, 
            isRoundTrip && { backgroundColor: '#22C55E', borderColor: '#22C55E' },
            !isRoundTrip && { backgroundColor: 'transparent', borderColor: '#CCCCCC' }
          ]}>
            {isRoundTrip && <Check size={12} color="#FFFFFF" />}
          </View>
          <Text style={[styles.roundTripText, { color: colorScheme.text }]}>Round Trip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <MapPin size={20} color="#22C55E" />
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Pick-up location"
          placeholderTextColor={colorScheme.subtext}
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <View style={[styles.dropoffIcon, { backgroundColor: '#A855F7' }]}>
          <MapPin size={16} color="#FFFFFF" />
        </View>
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Drop-off location"
          placeholderTextColor={colorScheme.subtext}
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />
      </View>

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity 
          style={[styles.dateContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{date}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{time}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderOutstationForm = () => (
    <>
      <View style={styles.tripTypeContainer}>
        <TouchableOpacity 
          style={[
            styles.tripTypeButton, 
            !isRoundTrip && { backgroundColor: colorScheme.card, borderBottomWidth: 2, borderBottomColor: colorScheme.success }
          ]}
          onPress={() => setIsRoundTrip(false)}
        >
          <Text style={[styles.tripTypeText, { color: colorScheme.text }]}>One way</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tripTypeButton, 
            isRoundTrip && { backgroundColor: colorScheme.card, borderBottomWidth: 2, borderBottomColor: colorScheme.success }
          ]}
          onPress={() => setIsRoundTrip(true)}
        >
          <Text style={[styles.tripTypeText, { color: colorScheme.text }]}>Round Trip</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <MapPin size={20} color="#22C55E" />
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Pick-up location"
          placeholderTextColor={colorScheme.subtext}
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <View style={[styles.dropoffIcon, { backgroundColor: '#A855F7' }]}>
          <MapPin size={16} color="#FFFFFF" />
        </View>
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Drop-off location"
          placeholderTextColor={colorScheme.subtext}
          value={dropoffLocation}
          onChangeText={setDropoffLocation}
        />
      </View>

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity 
          style={[styles.dateContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{date}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{time}</Text>
        </TouchableOpacity>
      </View>

      {/* Show return date and time for round trip */}
      {isRoundTrip && (
        <View style={styles.dateTimeContainer}>
          <TouchableOpacity 
            style={[styles.dateContainer, { backgroundColor: colorScheme.card }]}
            onPress={() => setShowReturnDatePicker(true)}
          >
            <Calendar size={20} color={colorScheme.text} />
            <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{returnDate}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.timeContainer, { backgroundColor: colorScheme.card }]}
            onPress={() => setShowReturnTimePicker(true)}
          >
            <Clock size={20} color={colorScheme.text} />
            <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{returnTime}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  const renderHourlyRentalForm = () => (
    <>
      <View style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}>
        <MapPin size={20} color="#22C55E" />
        <TextInput
          style={[styles.input, { color: colorScheme.text }]}
          placeholder="Pick-up location"
          placeholderTextColor={colorScheme.subtext}
          value={pickupLocation}
          onChangeText={setPickupLocation}
        />
      </View>

      <TouchableOpacity 
        style={[styles.inputContainer, { backgroundColor: colorScheme.card }]}
        onPress={() => setShowHoursPicker(true)}
      >
        <View style={[styles.dropoffIcon, { backgroundColor: '#A855F7' }]}>
          <Clock size={16} color="#FFFFFF" />
        </View>
        <Text style={[
          styles.input, 
          { color: hours === 'Select hours' ? colorScheme.subtext : colorScheme.text }
        ]}>
          {hours}
        </Text>
      </TouchableOpacity>

      <View style={styles.dateTimeContainer}>
        <TouchableOpacity 
          style={[styles.dateContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Calendar size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{date}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.timeContainer, { backgroundColor: colorScheme.card }]}
          onPress={() => setShowTimePicker(true)}
        >
          <Clock size={20} color={colorScheme.text} />
          <Text style={[styles.dateTimeText, { color: colorScheme.text }]}>{time}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderActiveForm = () => {
    switch (activeTab) {
      case 'airport':
        return renderAirportTaxiForm();
      case 'outstation':
        return renderOutstationForm();
      case 'hourly':
        return renderHourlyRentalForm();
      case 'city':
      default:
        return renderCityRideForm();
    }
  };

  // Render time picker modal
  const renderTimePicker = () => (
    <Modal
      visible={showTimePicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTimePicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowTimePicker(false)}
      >
        <View style={[styles.timePickerContainer, { backgroundColor: colorScheme.card }]}>
          <View style={styles.timePickerHeader}>
            <Text style={[styles.timePickerTitle, { color: colorScheme.text }]}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
              <X size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={activeTab === 'outstation' ? outstationTimeSlots : timeSlots}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  selectedTime === item && { backgroundColor: colorScheme.success + '20' }
                ]}
                onPress={() => handleTimeSelect(item)}
              >
                <Text style={[
                  styles.timeSlotText, 
                  { color: colorScheme.text },
                  selectedTime === item && { color: colorScheme.success, fontWeight: 'bold' }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.timeSlotList}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render return time picker modal
  const renderReturnTimePicker = () => (
    <Modal
      visible={showReturnTimePicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowReturnTimePicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowReturnTimePicker(false)}
      >
        <View style={[styles.timePickerContainer, { backgroundColor: colorScheme.card }]}>
          <View style={styles.timePickerHeader}>
            <Text style={[styles.timePickerTitle, { color: colorScheme.text }]}>Select Return Time</Text>
            <TouchableOpacity onPress={() => setShowReturnTimePicker(false)}>
              <X size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={activeTab === 'outstation' ? outstationTimeSlots : timeSlots}
            numColumns={3}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeSlot,
                  { backgroundColor: colorScheme.background },
                  selectedReturnTime === item && { backgroundColor: colorScheme.success + '20' }
                ]}
                onPress={() => handleReturnTimeSelect(item)}
              >
                <Text style={[
                  styles.timeSlotText, 
                  { color: colorScheme.text },
                  selectedReturnTime === item && { color: colorScheme.success, fontWeight: 'bold' }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
            style={styles.timeSlotList}
            showsVerticalScrollIndicator={true}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render hours picker modal
  const renderHoursPicker = () => (
    <Modal
      visible={showHoursPicker}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowHoursPicker(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowHoursPicker(false)}
      >
        <View style={[styles.hoursPickerContainer, { backgroundColor: colorScheme.card }]}>
          <View style={styles.hoursPickerHeader}>
            <Text style={[styles.hoursPickerTitle, { color: colorScheme.text }]}>Select Hours</Text>
            <TouchableOpacity onPress={() => setShowHoursPicker(false)}>
              <X size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.hoursGrid}>
            {hoursOptions.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.hourOption,
                  { backgroundColor: colorScheme.background },
                  hours === hour && { backgroundColor: colorScheme.success + '20' }
                ]}
                onPress={() => handleHoursSelect(hour)}
              >
                <Text style={[
                  styles.hourOptionText, 
                  { color: colorScheme.text },
                  hours === hour && { color: colorScheme.success, fontWeight: 'bold' }
                ]}>
                  {hour}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Render guest info modal
  const renderGuestModal = () => (
    <Modal
      visible={showGuestModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowGuestModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGuestModal(false)}
      >
        <View style={[styles.guestModalContainer, { backgroundColor: colorScheme.card }]}>
          <View style={styles.guestModalHeader}>
            <Text style={[styles.guestModalTitle, { color: colorScheme.text }]}>Guest Info</Text>
            <TouchableOpacity onPress={() => setShowGuestModal(false)}>
              <X size={20} color={colorScheme.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.guestCountContainer}>
            <View style={styles.guestCountLabel}>
              <User size={20} color="#22C55E" />
              <Text style={[styles.guestCountText, { color: colorScheme.text }]}>Passengers</Text>
            </View>
            
            <View style={styles.guestCountControls}>
              <TouchableOpacity 
                style={[styles.guestCountButton, { backgroundColor: colorScheme.background }]}
                onPress={() => handleGuestCountChange(false)}
              >
                <Minus size={16} color={colorScheme.text} />
              </TouchableOpacity>
              
              <Text style={[styles.guestCountValue, { color: colorScheme.text }]}>{guestCount}</Text>
              
              <TouchableOpacity 
                style={[styles.guestCountButton, { backgroundColor: colorScheme.background }]}
                onPress={() => handleGuestCountChange(true)}
              >
                <Plus size={16} color={colorScheme.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        <AppHeader 
          title="SDM" 
          onMenuPress={handleMenuPress}
        />

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={[styles.mainCard, { backgroundColor: theme === 'dark' ? colorScheme.surface : '#f3f3f3ff' }]}>
            {/* Booking Header */}
            <View style={styles.bookingHeader}>
              <Text style={[styles.bookingTitle, { color: colorScheme.text }]}>
                Book Your Ride
              </Text>
            </View>

            {/* Service Tabs */}
            <View style={[styles.serviceTabs, { backgroundColor: colorScheme.card }]}>
              <TouchableOpacity 
                style={[
                  styles.serviceTab, 
                  activeTab === 'city' && styles.activeServiceTab,
                ]} 
                onPress={() => handleTabPress('city')}
              >
                <Car size={18} color={activeTab === 'city' ? '#FFFFFF' : colorScheme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.serviceTab, 
                  activeTab === 'airport' && styles.activeServiceTab,
                ]} 
                onPress={() => handleTabPress('airport')}
              >
                <Plane size={18} color={activeTab === 'airport' ? '#FFFFFF' : colorScheme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.serviceTab, 
                  activeTab === 'outstation' && styles.activeServiceTab,
                ]} 
                onPress={() => handleTabPress('outstation')}
              >
                <MapPin size={18} color={activeTab === 'outstation' ? '#FFFFFF' : colorScheme.text} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.serviceTab, 
                  activeTab === 'hourly' && styles.activeServiceTab,
                ]} 
                onPress={() => handleTabPress('hourly')}
              >
                <Clock size={18} color={activeTab === 'hourly' ? '#FFFFFF' : colorScheme.text} />
              </TouchableOpacity>
            </View>

            {/* Dynamic Form Based on Selected Tab */}
            <View style={styles.formContainer}>
              {renderActiveForm()}
            </View>

            {/* Map Section */}
            <View style={styles.mapSection}>
              <View style={styles.mapSectionHeader}>
                <Text style={[styles.mapSectionTitle, { color: colorScheme.text }]}>Select on Map</Text>
                
                <View style={styles.mapButtons}>
                  <TouchableOpacity 
                    style={[
                      styles.mapButton, 
                      activeMapButton === 'pickup' && styles.activeMapButton,
                      { backgroundColor: activeMapButton === 'pickup' ? colorScheme.success : colorScheme.card }
                    ]}
                    onPress={() => setActiveMapButton('pickup')}
                  >
                    <MapPin size={16} color={activeMapButton === 'pickup' ? '#FFFFFF' : colorScheme.text} />
                    <Text style={[
                      styles.mapButtonText, 
                      { color: activeMapButton === 'pickup' ? '#FFFFFF' : colorScheme.text }
                    ]}>
                      Pickup
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.mapButton, 
                      activeMapButton === 'dropoff' && styles.activeMapButton,
                      { backgroundColor: activeMapButton === 'dropoff' ? colorScheme.success : colorScheme.card }
                    ]}
                    onPress={() => setActiveMapButton('dropoff')}
                  >
                    <MapPin size={16} color={activeMapButton === 'dropoff' ? '#FFFFFF' : colorScheme.text} />
                    <Text style={[
                      styles.mapButtonText, 
                      { color: activeMapButton === 'dropoff' ? '#FFFFFF' : colorScheme.text }
                    ]}>
                      Dropoff
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.mapPlaceholder, { backgroundColor: colorScheme.card }]}>
                <MapPin size={40} color={colorScheme.primary} />
                <Text style={[styles.mapPlaceholderText, { color: colorScheme.text }]}>
                  Map View
                </Text>
                <Text style={[styles.mapPlaceholderSubtext, { color: colorScheme.subtext }]}>
                  Select locations on the map
                </Text>
              </View>
            </View>

            {/* Passenger Info */}
            <TouchableOpacity 
              style={[styles.passengerInfo, { backgroundColor: '#ffffffff' }]}
              onPress={() => setShowGuestModal(true)}
            >
              <View style={styles.passengerInfoLeft}>
                <User size={20} color="#22C55E" />
                <Text style={[styles.passengerInfoText, { color: colorScheme.text }]}>{guestCount} Guest{guestCount > 1 ? 's' : ''}</Text>
              </View>
              <ChevronRight size={20} color={colorScheme.text} />
            </TouchableOpacity>

            {/* Special Instructions */}
            <View style={styles.specialInstructionsContainer}>
              <TouchableOpacity 
                style={styles.specialInstructionsHeader}
                onPress={() => setShowSpecialInstructions(!showSpecialInstructions)}
              >
                <View style={[styles.checkIcon, { backgroundColor: showSpecialInstructions ? '#22C55E' : '#F8F9FA', borderWidth: showSpecialInstructions ? 0 : 1, borderColor: '#22C55E' }]}>
                  {showSpecialInstructions ? (
                    <Check size={16} color="#FFFFFF" />
                  ) : null}
                </View>
                <Text style={[styles.specialInstructionsTitle, { color: colorScheme.text }]}>
                  Add Special Instructions
                </Text>
              </TouchableOpacity>

              {showSpecialInstructions && (
                <View style={styles.specialInstructionsContent}>
                  {/* Luggage Items */}
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionItemLabel}>
                      <View style={styles.luggageIcon}>
                        <MessageSquare size={20} color="#22C55E" />
                      </View>
                      <Text style={[styles.instructionItemText, { color: colorScheme.text }]}>Luggage Items</Text>
                    </View>
                    
                    <View style={styles.instructionItemControls}>
                      <TouchableOpacity 
                        style={[styles.instructionCountButton, { backgroundColor: '#F8F9FA' }]}
                        onPress={() => handleLuggageCountChange(false)}
                      >
                        <Minus size={16} color={colorScheme.text} />
                      </TouchableOpacity>
                      
                      <Text style={[styles.instructionCountValue, { color: colorScheme.text }]}>{luggageCount}</Text>
                      
                      <TouchableOpacity 
                        style={[styles.instructionCountButton, { backgroundColor: '#F8F9FA' }]}
                        onPress={() => handleLuggageCountChange(true)}
                      >
                        <Plus size={16} color={colorScheme.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                                   {/* Traveling with Pet */}
                  <View style={styles.instructionItem}>
                    <View style={styles.instructionItemLabel}>
                      <View style={styles.petIcon}>
                        <MessageSquare size={20} color="#22C55E" />
                      </View>
                      <Text style={[styles.instructionItemText, { color: colorScheme.text }]}>Traveling with Pet</Text>
                    </View>
                    
                    <Switch
                      value={travelingWithPet}
                      onValueChange={setTravelingWithPet}
                      trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                      thumbColor={'#FFFFFF'}
                    />
                  </View>
                  
                  {/* Additional Requirements */}
                  <View style={styles.additionalRequirementsContainer}>
                    <View style={styles.additionalRequirementsLabel}>
                      <View style={styles.messageIcon}>
                        <MessageSquare size={20} color="#22C55E" />
                      </View>
                      <Text style={[styles.additionalRequirementsText, { color: colorScheme.text }]}>
                        Additional Requirements
                      </Text>
                    </View>
                    
                    <TextInput
                      style={[
                        styles.additionalRequirementsInput, 
                        { 
                          color: colorScheme.text,
                          backgroundColor: '#FFFFFF',
                          borderColor: '#E5E7EB'
                        }
                      ]}
                      placeholder="Any other special requests or requirements..."
                      placeholderTextColor={colorScheme.subtext}
                      multiline={true}
                      numberOfLines={4}
                      value={additionalRequirements}
                      onChangeText={setAdditionalRequirements}
                    />
                  </View>

                  {/* Will be saved as text */}
                  {willBeSavedAs ? (
                    <Text style={styles.willBeSavedAsText}>
                      {willBeSavedAs}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Search Cars Button or Required Fields Message */}
            {areAllFieldsFilled() ? (
              <View style={styles.searchCarsButtonContainer}>
                <TouchableOpacity 
                  style={[styles.searchCarsButton, { backgroundColor: '#22C55E' }]}
                  onPress={handleContinue}
                >
                  <Text style={styles.searchCarsButtonText}>Search Cars</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={[styles.requiredFieldsText, { color: colorScheme.subtext }]}>
                Please fill all required fields
              </Text>
            )}
          </View>
        </ScrollView>
      </View>

      {/* Custom Date Picker */}
      <CustomCalendar
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={(selectedDate) => {
          setSelectedDate(selectedDate);
          setDate(formatDate(selectedDate));
        }}
        selectedDate={selectedDate}
        minimumDate={new Date()}
        title="Select Date"
      />

      {/* Custom Return Date Picker */}
      <CustomCalendar
        visible={showReturnDatePicker}
        onClose={() => setShowReturnDatePicker(false)}
        onDateSelect={(selectedDate) => {
          setSelectedReturnDate(selectedDate);
          setReturnDate(formatDate(selectedDate));
        }}
        selectedDate={selectedReturnDate}
        minimumDate={selectedDate} // Return date should be after departure date
        title="Select Return Date"
      />

      {/* Time Picker Modal */}
      {renderTimePicker()}

      {/* Return Time Picker Modal */}
      {renderReturnTimePicker()}

      {/* Hours Picker Modal */}
      {renderHoursPicker()}

      {/* Guest Info Modal */}
      {renderGuestModal()}

      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  mainCard: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookingHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  bookingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  serviceTabs: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  serviceTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeServiceTab: {
    backgroundColor: '#22C55E',
  },
  serviceTabText: {
    fontSize: 12,
    marginLeft: 4,
  },
  formContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tripDirectionContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tripDirectionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tripDirectionText: {
    fontSize: 14,
  },
  airportToggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  airportToggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  airportToggleButtonLeft: {
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  airportToggleButtonRight: {
    borderTopRightRadius: 5,
    borderBottomRightRadius:5,
  },
  airportToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tripTypeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tripTypeButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tripTypeText: {
    fontSize: 14,
  },
  roundTripContainer: {
    marginBottom: 12,
  },
  roundTripCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundTripText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  dropoffIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginRight: 6,
  },
  timeContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginLeft: 6,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 14,
  },
  mapSection: {
    marginBottom: 16,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  mapSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  mapButtons: {
    flexDirection: 'row',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
  },
  activeMapButton: {
    backgroundColor: '#22C55E',
  },
  mapButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  mapPlaceholder: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  passengerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
  },
  passengerInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passengerInfoText: {
    marginLeft: 12,
    fontSize: 14,
  },
  specialInstructionsContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  specialInstructionsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
},
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  specialInstructionsTitle: {
    fontSize: 14,
    flex: 1,
  },
  specialInstructionsContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  instructionItemLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  luggageIcon: {
    marginRight: 12,
  },
  petIcon: {
    marginRight: 12,
  },
  instructionItemText: {
    fontSize: 14,
  },
  instructionItemControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  instructionCountButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionCountValue: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
  },
  additionalRequirementsContainer: {
    marginBottom: 16,
  },
  additionalRequirementsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageIcon: {
    marginRight: 12,
  },
  additionalRequirementsText: {
    fontSize: 14,
  },
  additionalRequirementsInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
  },
  willBeSavedAsText: {
    fontSize: 12,
    color: '#22C55E',
    marginBottom: 8,
  },
  requiredFieldsText: {
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
    fontSize: 14,
    color: '#9CA3AF',
  },
  searchCarsButtonContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchCarsButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCarsButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Time picker styles
  timePickerContainer: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 16,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  timeSlotList: {
    maxHeight: 300,
  },
  timeSlot: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeSlotText: {
    fontSize: 16,
  },
  // Hours picker styles
  hoursPickerContainer: {
    width: '80%',
    borderRadius: 16,
    padding: 16,
  },
  hoursPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hoursPickerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hourOption: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  hourOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Guest modal styles
  guestModalContainer: {
    width: '80%',
    borderRadius: 16,
    padding: 16,
  },
  guestModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  guestModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  guestCountLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestCountText: {
    marginLeft: 12,
    fontSize: 16,
  },
  guestCountControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestCountButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCountValue: {
    marginHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
  },
});

