import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { BookingType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Car, Clock, MapPin, Plane } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceCardProps {
  type: BookingType;
  title: string;
  description: string;
  price: string;
  duration: string;
  features: string[];
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  type,
  title,
  description,
  price,
  duration,
  features,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { setBookingType } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const getIcon = () => {
    switch (type) {
      case 'airport':
        return <Plane size={24} color={colorScheme.success} />;
      case 'hourly':
        return <Clock size={24} color={colorScheme.success} />;
      case 'outstation':
        return <MapPin size={24} color={colorScheme.success} />;
      case 'city':
      default:
        return <Car size={24} color={colorScheme.success} />;
    }
  };
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setBookingType(type);
    
    // Navigate to home page with the selected tab
    router.push({
      pathname: '/(rider-tabs)',
      params: { activeTab: type }
    });
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? colorScheme.surface : '#FFFFFF' }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: theme === 'dark' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(0, 200, 83, 0.1)' }]}>
          {getIcon()}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            {title}
          </Text>
          <Text 
            style={[styles.description, { color: colorScheme.subtext }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={[styles.arrow, { color: colorScheme.success }]}>→</Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.priceSection}>
        <View>
          <Text style={[styles.priceLabel, { color: colorScheme.subtext }]}>Starting from</Text>
          <Text style={[styles.price, { color: colorScheme.success }]}>₹{price}</Text>
        </View>
        <View style={[styles.durationBadge, { backgroundColor: theme === 'dark' ? 'rgba(0, 200, 83, 0.2)' : 'rgba(0, 200, 83, 0.1)' }]}>
          <Clock size={16} color={colorScheme.success} style={styles.durationIcon} />
          <Text style={[styles.duration, { color: colorScheme.success}]}>{duration}</Text>
        </View>
      </View>
      
      <View style={styles.featuresContainer}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Text style={[styles.featureStar, { color: colorScheme.success }]}>☆</Text>
            <Text style={[styles.featureText, { color: colorScheme.subtext }]}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[styles.bookButton, { backgroundColor: colorScheme.success }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#00C853',
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  priceLabel: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00C853',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  durationIcon: {
    marginRight: 4,
  },
  duration: {
    fontSize: 14,
    color: '#00C853',
    fontWeight: '500',
  },
  featuresContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '50%',
  },
  featureStar: {
    fontSize: 18,
    color: '#64b184ff',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
  },
  bookButton: {
    backgroundColor: '#00C853',
    borderRadius: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginLeft: 16,
    marginBottom: 16,
    shadowColor: '#000',
    
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});