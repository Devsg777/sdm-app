import { AppHeader } from '@/components/ui/AppHeader';
import { DrawerMenu } from '@/components/ui/DrawerMenu';
import { GlassCard } from '@/components/ui/GlassCard';
import { LiveTrackingModal } from '@/components/ui/LiveTrackingModal';
import { PaymentSummaryModal } from '@/components/ui/PaymentSummaryModal';
import { RatingModal } from '@/components/ui/RatingModal';
import { TripDetailsModal } from '@/components/ui/TripDetailsModal';
import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ChevronDown, Filter } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TripsScreen() {
  const { theme } = useTheme();
  const { pastRides, rides: allRides } = useRides();
  const router = useRouter();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('completed');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [tripDetailsModalVisible, setTripDetailsModalVisible] = useState(false);
  const [liveTrackingModalVisible, setLiveTrackingModalVisible] = useState(false);
  const [paymentSummaryModalVisible, setPaymentSummaryModalVisible] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Ride | null>(null);

  useEffect(() => {
    // Update current time every minute to check for status changes
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDrawerVisible(true);
  };

  const handleDateFilterPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDateModalVisible(true);
  };

  const handleDateRangeSelect = (range: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setSelectedDateRange(range);
    setDateModalVisible(false);
  };
  
  // Mock upcoming trips (fallback for demo)
  const mockUpcomingTrips: Ride[] = [
    {
      id: 'upcoming1',
      riderId: 'rider1',
      bookingType: 'airport',
      tripType: 'one-way',
      pickup: {
        id: '1',
        name: 'Home',
        address: '123 Main St, Bangalore',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      dropoff: {
        id: '2',
        name: 'Kempegowda International Airport',
        address: 'Terminal 1, Bengaluru Airport',
        latitude: 13.1986,
        longitude: 77.7066,
      },
      date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 hours from now
      time: new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      passengers: 2,
      passengerInfo: [
        { name: 'John Doe', age: 30, phone: '1234567890' },
        { name: 'Jane Doe', age: 28, phone: '0987654321' }
      ],
      status: 'pending',
      vehicle: {
        id: 'v1',
        name: 'Toyota Innova Crysta',
        type: 'SUV',
        image: 'https://example.com/innova.jpg',
        capacity: 7,
        price: 12,
        rating: 4.5,
        seatingCapacity: 7,
        features: ['AC', 'GPS', 'Music System'],
      },
      fare: {
        base: 300,
        distance: 35,
        time: 45,
        surge: 50,
        tax: 35,
        total: 420,
        advancePayment: 105,
        remainingPayment: 315,
      },
      paymentMethod: 'card',
      paymentStatus: 'partial',
      distance: 35,
      duration: 45,
    },
    {
      id: 'upcoming2',
      riderId: 'rider1',
      bookingType: 'hourly',
      tripType: 'one-way',
      pickup: {
        id: '3',
        name: 'Office',
        address: 'IT Park, Whitefield',
        latitude: 12.9698,
        longitude: 77.7500,
      },
      dropoff: {
        id: '4',
        name: 'Multiple Stops',
        address: 'Various locations',
        latitude: 12.9716,
        longitude: 77.5946,
      },
      date: new Date(Date.now() + 8 * 60 * 1000).toISOString().split('T')[0], // 8 minutes from now
      time: new Date(Date.now() + 8 * 60 * 1000).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      passengers: 1,
      passengerInfo: [
        { name: 'John Doe', age: 30, phone: '1234567890' }
      ],
      status: 'accepted',
      fare: {
        base: 250,
        distance: 0,
        time: 180, // 3 hours
        surge: 0,
        tax: 25,
        total: 275,
        advancePayment: 68.75,
        remainingPayment: 206.25,
      },
      paymentMethod: 'upi',
      paymentStatus: 'partial',
      distance: 0,
      duration: 180,
    },
  ];

  // Mock completed trips data (fallback for demo)
  const mockCompletedTrips: Ride[] = [
    {
      id: '1',
      riderId: 'rider1',
      driverId: 'driver1',
      bookingType: 'airport',
      tripType: 'one-way',
      pickup: {
        id: '1',
        name: 'Home',
        address: '123 Main St, City',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      dropoff: {
        id: '2',
        name: 'Airport',
        address: 'International Airport',
        latitude: 37.6213,
        longitude: -122.3790,
      },
      date: '2025-07-08',
      time: '14:30',
      passengers: 2,
      passengerInfo: [
        {
          name: 'John Doe',
          age: 30,
          phone: '555-1234',
        }
      ],
      status: 'completed',
      fare: {
        base: 45,
        distance: 18.5,
        time: 30,
        surge: 0,
        tax: 4.5,
        total: 49.5,
        advancePayment: 12.38,
        remainingPayment: 37.12,
      },
      paymentMethod: 'card',
      paymentStatus: 'completed',
      distance: 18.5,
      duration: 30,
      rating: 4.8,
      review: "Great service, very punctual!",
    },
    {
      id: '2',
      riderId: 'rider1',
      bookingType: 'city',
      tripType: 'one-way',
      pickup: {
        id: '3',
        name: 'Work',
        address: '456 Market St, City',
        latitude: 37.7899,
        longitude: -122.4034,
      },
      dropoff: {
        id: '4',
        name: 'Mall',
        address: 'Shopping Center, Downtown',
        latitude: 37.7833,
        longitude: -122.4167,
      },
      date: '2025-07-07',
      time: '16:45',
      passengers: 1,
      passengerInfo: [
        {
          name: 'Jane Smith',
          age: 28,
          phone: '555-5678',
        }
      ],
      status: 'completed',
      fare: {
        base: 25,
        distance: 8.2,
        time: 15,
        surge: 0,
        tax: 2.5,
        total: 27.5,
        advancePayment: 6.88,
        remainingPayment: 20.62,
      },
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      distance: 8.2,
      duration: 15,
      rating: 4.5,
    },
    // Additional mock trips to match screenshot
    {
      id: '3',
      riderId: 'rider1',
      bookingType: 'city',
      tripType: 'one-way',
      pickup: {
        id: '5',
        name: 'Home Street',
        address: '123 Home Street, Hometown',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      dropoff: {
        id: '6',
        name: 'Office Avenue',
        address: '456 Office Avenue, Business District',
        latitude: 37.6213,
        longitude: -122.3790,
      },
      date: 'Jul 24, 2025',
      time: '02:00 PM',
      passengers: 1,
      passengerInfo: [
        {
          name: 'John Doe',
          age: 30,
          phone: '555-1234',
        }
      ],
      status: 'completed',
      fare: {
        base: 150,
        distance: 18.5,
        time: 30,
        surge: 25,
        tax: 0,
        total: 175,
        advancePayment: 43.75,
        remainingPayment: 131.25,
      },
      paymentMethod: 'card',
      paymentStatus: 'completed',
      distance: 18.5,
      duration: 30,
      rating: 4.8,
    },
    {
      id: '4',
      riderId: 'rider1',
      bookingType: 'shared',
      tripType: 'one-way',
      pickup: {
        id: '7',
        name: 'Office Avenue',
        address: '456 Office Avenue, Business District',
        latitude: 37.6213,
        longitude: -122.3790,
      },
      dropoff: {
        id: '8',
        name: 'Home Street',
        address: '123 Home Street, Hometown',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      date: 'Jul 23, 2025',
      time: '12:15 AM',
      passengers: 1,
      passengerInfo: [
        {
          name: 'John Doe',
          age: 30,
          phone: '555-1234',
        }
      ],
      status: 'completed',
      fare: {
        base: 100,
        distance: 18.5,
        time: 30,
        surge: 30,
        tax: 0,
        total: 130,
        advancePayment: 32.5,
        remainingPayment: 97.5,
      },
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      distance: 18.5,
      duration: 30,
      rating: 4.2,
    },
  ];

  // Mock cancelled trips
  const mockCancelledTrips: Ride[] = [
    {
      id: 'cancelled1',
      riderId: 'rider1',
      bookingType: 'city',
      tripType: 'one-way',
      pickup: {
        id: '9',
        name: 'Mall',
        address: 'Shopping Mall, Downtown',
        latitude: 37.7749,
        longitude: -122.4194,
      },
      dropoff: {
        id: '10',
        name: 'Airport',
        address: 'International Airport',
        latitude: 37.6213,
        longitude: -122.3790,
      },
      date: 'Jul 22, 2025',
      time: '10:00 AM',
      passengers: 2,
      passengerInfo: [
        {
          name: 'John Doe',
          age: 30,
          phone: '555-1234',
        }
      ],
      status: 'cancelled',
      fare: {
        base: 200,
        distance: 25,
        time: 45,
        surge: 0,
        tax: 20,
        total: 220,
        advancePayment: 0,
        remainingPayment: 0,
      },
      paymentMethod: 'card',
      paymentStatus: 'refunded',
      distance: 25,
      duration: 45,
    },
  ];

  // Get trips based on active filter
  const getFilteredTrips = () => {
    const allTrips = [...pastRides, ...mockCompletedTrips, ...mockUpcomingTrips, ...mockCancelledTrips];
    
    switch (activeFilter) {
      case 'active':
        return allTrips.filter(ride => 
          ride.status === 'pending' || ride.status === 'accepted' || ride.status === 'arriving' || ride.status === 'arrived' || ride.status === 'in_progress'
        );
      case 'completed':
        return allTrips.filter(ride => ride.status === 'completed');
      case 'cancelled':
        return allTrips.filter(ride => ride.status === 'cancelled');
      default:
        return allTrips;
    }
  };

  // Date utilities
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  const startOfWeek = (d: Date) => {
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day; // start Sunday
    return new Date(d.getFullYear(), d.getMonth(), diff);
  };
  const endOfWeek = (d: Date) => {
    const start = startOfWeek(d);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
  };
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  const startOfYear = (d: Date) => new Date(d.getFullYear(), 0, 1);
  const endOfYear = (d: Date) => new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);

  // Custom range state
  const [customRangeVisible, setCustomRangeVisible] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);

  const parseTripDate = (trip: Ride) => {
    // Trip dates can be ISO (YYYY-MM-DD) or formatted like 'Jul 24, 2025'
    // Combine with time when available
    const dateStr = trip.date;
    const timeStr = trip.time || '00:00';
    const parsed = new Date(`${dateStr} ${timeStr}`);
    if (!isNaN(parsed.getTime())) return parsed;
    // Fallback: parse date only
    const dateOnly = new Date(dateStr);
    if (!isNaN(dateOnly.getTime())) return dateOnly;
    // Last fallback: try Date.parse directly
    const byParse = new Date(Date.parse(dateStr));
    return byParse;
  };

  const within = (d: Date, start: Date, end: Date) => d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

  const getDateRangeBounds = () => {
    const now = new Date();
    switch (selectedDateRange) {
      case 'daily':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'weekly':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'monthly':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'yearly':
        return { start: startOfYear(now), end: endOfYear(now) };
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: startOfDay(customStartDate), end: endOfDay(customEndDate) };
        }
        // If not set, default to today so list isn’t empty
        return { start: startOfDay(now), end: endOfDay(now) };
      default:
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  };

  const filteredTrips = getFilteredTrips().filter((trip) => {
    const d = parseTripDate(trip);
    if (isNaN(d.getTime())) return false;
    const { start, end } = getDateRangeBounds();
    return within(d, start, end);
  });

  // Helper function to get trip status based on time
  const getTripStatus = (trip: Ride) => {
    if (!trip.date || !trip.time) return 'active';
    
    const tripDateTime = new Date(`${trip.date} ${trip.time}`);
    const timeDiff = tripDateTime.getTime() - currentTime.getTime();
    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesDiff <= 15 && minutesDiff > 0) {
      return 'in progress';
    } else if (minutesDiff <= 0) {
      return 'in progress';
    }
    return 'active';
  };

  const handleTripPress = (trip: Ride) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setSelectedTrip(trip);
    
    const status = getTripStatus(trip);
    if (trip.status === 'completed') {
      setTripDetailsModalVisible(true);
    } else if (status === 'in progress' || activeFilter === 'active') {
      setLiveTrackingModalVisible(true);
    } else {
      setTripDetailsModalVisible(true);
    }
  };

  const handleCompleteRide = () => {
    setLiveTrackingModalVisible(false);
    // Simulate completing the ride by showing payment summary
    setTimeout(() => {
      setPaymentSummaryModalVisible(true);
    }, 500);
  };

  const handlePaymentComplete = () => {
    setPaymentSummaryModalVisible(false);
    // Show rating modal after payment
    setTimeout(() => {
      setRatingModalVisible(true);
    }, 500);
  };

  const handleRatingSubmit = (rating: number, review?: string) => {
    // Update the trip with rating and review
    if (selectedTrip) {
      // In a real app, this would be sent to the backend
      console.log('Rating submitted:', rating, review);
    }
    setRatingModalVisible(false);
    setSelectedTrip(null);
  };

  const handleModalClose = () => {
    setTripDetailsModalVisible(false);
    setLiveTrackingModalVisible(false);
    setPaymentSummaryModalVisible(false);
    setRatingModalVisible(false);
    setSelectedTrip(null);
  };
  
  const renderTripCard = (ride: Ride) => {
    const tripStatus = ride.status === 'completed' ? 'completed' : 
                      ride.status === 'cancelled' ? 'cancelled' : getTripStatus(ride);
    
    return (
      <TouchableOpacity 
        style={styles.tripCardContainer}
        onPress={() => handleTripPress(ride)}
      >
      <GlassCard style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View style={styles.tripHeaderLeft}>
            <Text style={[styles.tripType, { color: colorScheme.text }]}>
              {ride.bookingType === 'city' ? 'City Ride' : 
               ride.bookingType === 'shared' ? 'Shared Ride' : 
               ride.bookingType === 'airport' ? 'Airport Transfer' : 
               ride.bookingType.charAt(0).toUpperCase() + ride.bookingType.slice(1) + ' Ride'}
            </Text>
          </View>
          <View style={[
            styles.statusBadge, 
            { 
              backgroundColor: tripStatus === 'completed' 
                ? '#4CAF50' 
                : tripStatus === 'cancelled'
                ? '#F44336'
                : tripStatus === 'in progress'
                ? '#2196F3'
                : '#FF9800'
            }
          ]}>
            <Text style={styles.statusText}>
              {tripStatus === 'completed' ? 'Completed' : 
               tripStatus === 'cancelled' ? 'Cancelled' :
               tripStatus === 'in progress' ? 'In Progress' : 'Active'}
            </Text>
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <View style={styles.locationDot} />
            <Text style={[styles.locationText, { color: colorScheme.text }]}>
              {ride.pickup?.address || 'Pickup location not available'}
            </Text>
          </View>
          
          <View style={styles.locationRow}>
            <View style={[styles.locationDot, { backgroundColor: colorScheme.error }]} />
            <Text style={[styles.locationText, { color: colorScheme.text }]}>
              {ride.dropoff?.address || 'Dropoff location not available'}
            </Text>
          </View>
        </View>
        
        <View style={styles.tripFooter}>
          <View style={styles.tripDateTime}>
            <Text style={[styles.tripDate, { color: colorScheme.subtext }]}>
              {ride.date}
            </Text>
            <Text style={[styles.tripTime, { color: colorScheme.subtext }]}>
              {ride.time}
            </Text>
          </View>
          
          <Text style={[styles.fareAmount, { color: colorScheme.text }]}>
            ₹{ride.fare?.total?.toFixed(0) || '0'}
          </Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
  };
  
  return (
    <>
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        <AppHeader 
          title="My Trips" 
          onMenuPress={handleMenuPress}
          showMenu={true}
        />
        
        <LinearGradient
          colors={[
            theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
            theme === 'dark' ? '#121212' : '#ffffff',
          ]}
          style={styles.gradientContainer}
        >
          {/* Statistics Section */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Your Rides
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colorScheme.text }]}>
                  {filteredTrips.length}
                </Text>
                <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>Total Rides</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colorScheme.text }]}>
                  ₹{filteredTrips.reduce((sum, trip) => sum + (trip.fare?.total || 0), 0).toFixed(0)}
                </Text>
                <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colorScheme.text }]}>
                  {(filteredTrips.reduce((sum, trip) => sum + (trip.rating || 0), 0) / filteredTrips.filter(t => t.rating).length || 0).toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>Avg. Rating</Text>
              </View>
            </View>
          </View>

          {/* Spacer after stats */}
          <View style={styles.sectionSpacer} />

          {/* Filter Section Header */}
          <View style={styles.filterHeader}>
            <View style={styles.filterLeft}>
              <Filter size={20} color={colorScheme.text} />
              <Text style={[styles.filterHeaderText, { color: colorScheme.text }]}>
                Filter & Sort
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.dateFilterButton, { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }]}
              onPress={handleDateFilterPress}
            >
              <Text style={[styles.dateFilterText, { color: colorScheme.text }]}>
                {selectedDateRange === 'daily' ? 'Today' : 
                 selectedDateRange === 'weekly' ? 'This Week' :
                 selectedDateRange === 'monthly' ? 'This Month' :
                 'This Year'}
              </Text>
              <ChevronDown size={16} color={colorScheme.text} />
            </TouchableOpacity>
          </View>

          {/* Status Filter Buttons */}
          <View style={styles.statusFilterContainer}>
            {['all', 'active', 'completed', 'cancelled'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.statusFilterButton,
                  activeFilter === filter && { backgroundColor: colorScheme.primary },
                  activeFilter !== filter && { backgroundColor: colorScheme.surface, borderColor: colorScheme.border }
                ]}
                onPress={() => setActiveFilter(filter as any)}
              >
                <Text style={[
                  styles.statusFilterText,
                  {
                    color: activeFilter === filter
                      ? (theme === 'dark' ? colors.dark.background : colors.light.background)
                      : colorScheme.text
                  }
                ]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <FlatList
            data={filteredTrips}
            renderItem={({ item }) => renderTripCard(item)}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <GlassCard style={styles.emptyCard}>
                <Text style={[styles.emptyTitle, { color: colorScheme.text }]}>
                  No trips found
                </Text>
                <Text style={[styles.emptyText, { color: colorScheme.subtext }]}>
                  Your trips will appear here based on the selected filter
                </Text>
              </GlassCard>
            )}
          />
        </LinearGradient>
      </View>

      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />

      {/* Trip Details Modal */}
      <TripDetailsModal
        visible={tripDetailsModalVisible}
        trip={selectedTrip}
        onClose={handleModalClose}
      />

      {/* Live Tracking Modal */}
      <LiveTrackingModal
        visible={liveTrackingModalVisible}
        trip={selectedTrip}
        onClose={handleModalClose}
        onCompleteRide={handleCompleteRide}
      />

      {/* Payment Summary Modal */}
      <PaymentSummaryModal
        visible={paymentSummaryModalVisible}
        trip={selectedTrip}
        onClose={handleModalClose}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => {
          setRatingModalVisible(false);
          setSelectedTrip(null);
        }}
        onSubmitRating={handleRatingSubmit}
      />

      {/* Date Range Modal */}
      <Modal
        visible={dateModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setDateModalVisible(false)}
          />
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: '#000000' }]}>
                Select Date Range
              </Text>
              
              {['daily', 'weekly', 'monthly', 'yearly'].map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[
                    styles.modalOption,
                    selectedDateRange === range && styles.modalOptionSelected
                  ]}
                  onPress={() => handleDateRangeSelect(range as any)}
                >
                  <Text style={[
                    styles.modalOptionText,
                    selectedDateRange === range && styles.modalOptionTextSelected
                  ]}>
                    {range === 'daily' ? 'Today' :
                     range === 'weekly' ? 'This Week' :
                     range === 'monthly' ? 'This Month' :
                     'This Year'}
                  </Text>
                  {selectedDateRange === range && (
                    <View style={styles.selectedIndicator} />
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setDateModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filter</Text>
              </TouchableOpacity>

              {/* Custom Range Calendar Flow */}
              {selectedDateRange === 'custom' && (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ textAlign: 'center', marginBottom: 8, color: '#333' }}>
                    {customStartDate && customEndDate
                      ? `${customStartDate.toLocaleDateString()} → ${customEndDate.toLocaleDateString()}`
                      : customStartDate
                        ? `Start: ${customStartDate.toLocaleDateString()} — Select end date`
                        : 'Select start date'}
                  </Text>
                  <CustomCalendar
                    visible={customRangeVisible}
                    onClose={() => setCustomRangeVisible(false)}
                    onDateSelect={(pickedDate) => {
                      if (!customStartDate || (customStartDate && customEndDate)) {
                        // Start a new selection
                        setCustomStartDate(pickedDate);
                        setCustomEndDate(null);
                        // Reopen to pick end
                        setTimeout(() => setCustomRangeVisible(true), 0);
                      } else {
                        // Pick end date (ensure end >= start)
                        const end = pickedDate < customStartDate ? customStartDate : pickedDate;
                        setCustomEndDate(end);
                        setCustomRangeVisible(false);
                      }
                    }}
                    selectedDate={customEndDate || customStartDate || new Date()}
                    minimumDate={new Date(2000, 0, 1)}
                    title={!customStartDate || (customStartDate && customEndDate) ? 'Select Start Date' : 'Select End Date'}
                  />

                  {(!customStartDate || !customEndDate) && (
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: '#A7A7A7', marginTop: 8 }]}
                      onPress={() => setCustomRangeVisible(true)}
                    >
                      <Text style={styles.applyButtonText}>
                        {customStartDate ? 'Pick End Date' : 'Pick Start Date'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {customStartDate && customEndDate && (
                    <TouchableOpacity
                      style={[styles.applyButton, { backgroundColor: '#22C55E', marginTop: 8 }]}
                      onPress={() => {
                        // Closing the select modal already applies the filter via state
                        setDateModalVisible(false);
                      }}
                    >
                      <Text style={styles.applyButtonText}>Apply Custom Range</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  statsSection: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  sectionSpacer: {
    height: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 120,
    justifyContent: 'center',
  },
  dateFilterText: {
    fontSize: 14,
    marginRight: 8,
  },

  statusFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 16,
    paddingTop: 10,
    gap: 6,
    justifyContent: 'space-between',
  },
  statusFilterButton: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  statusFilterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
    flexGrow: 1,
  },
  tripCardContainer: {
    marginBottom: 16,
  },
  // tripCard: {
  //   padding: 16,
  // },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripHeaderLeft: {
    flex: 1,
  },
  tripType: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  tripDate: {
    fontSize: 14,
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDateTime: {
    flex: 1,
  },
  tripDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 12,
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 350,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
  },
  modalOptionSelected: {
    backgroundColor: '#E8F5E8',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  modalOptionTextSelected: {
    fontWeight: '600',
    color: '#333333',
  },
  selectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});