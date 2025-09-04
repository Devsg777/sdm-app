import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, DollarSign, MapPin, Star } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverTripsScreen() {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month'>('today');
  
  // Mock data for demonstration
  const mockTrips = [
    {
      id: '1',
      riderName: 'John Smith',
      pickup: 'Downtown Mall',
      dropoff: 'Airport Terminal 1',
      date: '2025-07-08',
      time: '14:30',
      duration: 25,
      distance: 18.5,
      fare: 45.50,
      rating: 4.8,
      status: 'completed',
    },
    {
      id: '2',
      riderName: 'Sarah Johnson',
      pickup: 'Central Station',
      dropoff: 'Business District',
      date: '2025-07-08',
      time: '12:15',
      duration: 15,
      distance: 8.2,
      fare: 22.75,
      rating: 5.0,
      status: 'completed',
    },
    {
      id: '3',
      riderName: 'Mike Wilson',
      pickup: 'University Campus',
      dropoff: 'Shopping Center',
      date: '2025-07-08',
      time: '09:45',
      duration: 20,
      distance: 12.3,
      fare: 28.90,
      rating: 4.5,
      status: 'completed',
    },
  ];
  
  const renderTripCard = (trip: any) => (
    <TouchableOpacity key={trip.id} style={styles.tripCardContainer}>
      <GlassCard style={styles.tripCard}>
        <View style={styles.tripHeader}>
          <View>
            <Text style={[styles.riderName, { color: colorScheme.text }]}>
              {trip.riderName}
            </Text>
            <Text style={[styles.tripTime, { color: colorScheme.subtext }]}>
              {trip.time} • {trip.duration} min
            </Text>
          </View>
          
          <View style={styles.fareContainer}>
            <Text style={[styles.fareAmount, { color: colorScheme.text }]}>
              ${trip.fare.toFixed(2)}
            </Text>
            {trip.rating && (
              <View style={styles.ratingContainer}>
                <Star size={14} color={colorScheme.warning} fill={colorScheme.warning} />
                <Text style={[styles.ratingText, { color: colorScheme.text }]}>
                  {trip.rating}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.locationContainer}>
          <View style={styles.locationItem}>
            <MapPin size={16} color={colorScheme.success} />
            <Text style={[styles.locationText, { color: colorScheme.text }]}>
              {trip.pickup}
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
          
          <View style={styles.locationItem}>
            <MapPin size={16} color={colorScheme.error} />
            <Text style={[styles.locationText, { color: colorScheme.text }]}>
              {trip.dropoff}
            </Text>
          </View>
        </View>
        
        <View style={styles.tripFooter}>
          <View style={styles.tripDetails}>
            <View style={styles.detailItem}>
              <Clock size={14} color={colorScheme.subtext} />
              <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                {trip.distance} km
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <DollarSign size={14} color={colorScheme.subtext} />
              <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                Earnings: ${(trip.fare * 0.8).toFixed(2)}
              </Text>
            </View>
          </View>
          
          <ChevronRight size={20} color={colorScheme.subtext} />
        </View>
      </GlassCard>
    </TouchableOpacity>
  );
  
  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          My Trips
        </Text>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'today' && { backgroundColor: colorScheme.primary }
            ]}
            onPress={() => setActiveTab('today')}
          >
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'today' 
                  ? (theme === 'dark' ? colors.dark.background : colors.light.background)
                  : colorScheme.text 
              }
            ]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'week' && { backgroundColor: colorScheme.primary }
            ]}
            onPress={() => setActiveTab('week')}
          >
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'week' 
                  ? (theme === 'dark' ? colors.dark.background : colors.light.background)
                  : colorScheme.text 
              }
            ]}>
              This Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'month' && { backgroundColor: colorScheme.primary }
            ]}
            onPress={() => setActiveTab('month')}
          >
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'month' 
                  ? (theme === 'dark' ? colors.dark.background : colors.light.background)
                  : colorScheme.text 
              }
            ]}>
              This Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.summaryContainer}>
        <GlassCard style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
              {mockTrips.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
              Trips
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
              ${mockTrips.reduce((sum, trip) => sum + (trip.fare * 0.8), 0).toFixed(2)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
              Earnings
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: colorScheme.text }]}>
              {(mockTrips.reduce((sum, trip) => sum + trip.rating, 0) / mockTrips.length).toFixed(1)}
            </Text>
            <Text style={[styles.summaryLabel, { color: colorScheme.subtext }]}>
              Rating
            </Text>
          </View>
        </GlassCard>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {mockTrips.length > 0 ? (
          mockTrips.map(renderTripCard)
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Text style={[styles.emptyTitle, { color: colorScheme.text }]}>
              No trips found
            </Text>
            <Text style={[styles.emptyText, { color: colorScheme.subtext }]}>
              Your completed trips will appear here
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  summaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  tripCardContainer: {
    marginBottom: 16,
  },
  tripCard: {
    padding: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  riderName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  tripTime: {
    fontSize: 14,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 24,
    marginVertical: 4,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
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
});