import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Ride } from '@/types';
import { Clock, DollarSign, MapPin, Navigation } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

interface RequestCardProps {
  ride: Ride;
  onAccept: () => void;
  onDecline: () => void;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  ride,
  onAccept,
  onDecline,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          New Ride Request
        </Text>
        <View style={[styles.badge, { backgroundColor: colorScheme.accent }]}>
          <Text style={[styles.badgeText, { color: colorScheme.text }]}>
            {ride.bookingType.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <MapPin size={20} color={colorScheme.success} />
          <Text 
            style={[styles.locationText, { color: colorScheme.text }]}
            numberOfLines={1}
          >
            {ride.pickup.name}
          </Text>
        </View>
        
        <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
        
        <View style={styles.locationItem}>
          <MapPin size={20} color={colorScheme.error} />
          <Text 
            style={[styles.locationText, { color: colorScheme.text }]}
            numberOfLines={1}
          >
            {ride.dropoff.name}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Clock size={16} color={colorScheme.subtext} />
          <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
            {ride.distance} km • {ride.duration} min
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <DollarSign size={16} color={colorScheme.subtext} />
          <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
            ₹{ride.fare.total.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity 
        style={[styles.mapPreview, { backgroundColor: colorScheme.border }]}
        onPress={() => {}}
      >
        <Navigation size={24} color={colorScheme.primary} />
        <Text style={[styles.mapText, { color: colorScheme.primary }]}>
          View Route
        </Text>
      </TouchableOpacity>
      
      <View style={styles.actions}>
        <Button 
          title="Decline" 
          onPress={onDecline} 
          variant="outlined"
          style={styles.declineButton}
        />
        <Button 
          title="Accept" 
          onPress={onAccept} 
          style={styles.acceptButton}
        />
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 10,
    marginVertical: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
  },
  mapPreview: {
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  mapText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  declineButton: {
    flex: 1,
    marginRight: 8,
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
  },
});