import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { BookingType } from '@/types';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Car, Clock, MapPin, Plane, Share2 } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface BookingCardProps {
  type: BookingType;
  title: string;
  description: string;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  type,
  title,
  description,
}) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { setBookingType } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const getIcon = () => {
    switch (type) {
      case 'airport':
        return <Plane size={24} color={colorScheme.primary} />;
      case 'hourly':
        return <Clock size={24} color={colorScheme.primary} />;
      case 'outstation':
        return <MapPin size={24} color={colorScheme.primary} />;
      case 'shared':
        return <Share2 size={24} color={colorScheme.primary} />;
      case 'city':
      default:
        return <Car size={24} color={colorScheme.primary} />;
    }
  };
  
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setBookingType(type);
    
    // Navigate to specialized screens
    if (type === 'airport') {
      router.push('/airport-transfer');
    } else if (type === 'outstation') {
      router.push('/outstation');
    } else if (type === 'hourly') {
      router.push('/hourly-rental');
    } else {
      router.push('/booking');
    }
  };
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <GlassCard style={styles.card} intensity={50}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.content}>
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
      </GlassCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
});