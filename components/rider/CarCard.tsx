import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Vehicle } from '@/types';
import { Image } from 'expo-image';
import { CheckCircle, Star, Users } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface CarCardProps {
  vehicle: Vehicle;
  onSelect: (vehicle: Vehicle) => void;
  isSelected?: boolean;
}

export const CarCard: React.FC<CarCardProps> = ({
  vehicle,
  onSelect,
  isSelected = false,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const handlePress = () => {
    console.log('CarCard pressed:', vehicle.name);
    onSelect(vehicle);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <GlassCard
        style={[
          styles.card,
          isSelected && { 
            borderColor: colorScheme.primary, 
            borderWidth: 3,
            backgroundColor: theme === 'dark' ? 'rgba(0, 255, 0, 0.15)' : 'rgba(0, 255, 0, 0.1)',
            shadowColor: colorScheme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 8,
          }
        ]}
        intensity={isSelected ? 90 : 50}
      >
        <Image
          source={{ uri: vehicle.image }}
          style={styles.carImage}
          contentFit="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.carName, { color: colorScheme.text }]}>
              {vehicle.name}
            </Text>
            <View style={styles.priceContainer}>
              <Text style={[styles.carPrice, { color: colorScheme.primary }]}>
                ${vehicle.price}
              </Text>
              {isSelected && (
                <CheckCircle 
                  size={20} 
                  color={colorScheme.primary} 
                  fill={colorScheme.primary}
                  style={styles.selectedIcon}
                />
              )}
            </View>
          </View>
          
          <Text style={[styles.carType, { color: colorScheme.subtext }]}>
            {vehicle.type}
          </Text>
          
          <View style={styles.details}>
            <View style={styles.detailItem}>
              <Users size={16} color={colorScheme.primary} />
              <Text style={[styles.detailText, { color: colorScheme.text }]}>
                {vehicle.seatingCapacity} seater
              </Text>
            </View>
            
            <View style={styles.detailItem}>
              <Star size={16} color={colorScheme.warning} fill={colorScheme.warning} />
              <Text style={[styles.detailText, { color: colorScheme.text }]}>
                {vehicle.rating}
              </Text>
            </View>
          </View>
          
          <View style={styles.features}>
            {vehicle.features.map((feature, index) => (
              <View 
                key={index} 
                style={[styles.featureTag, { backgroundColor: colorScheme.border }]}
              >
                <Text style={[styles.featureText, { color: colorScheme.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
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
    padding: 16,
  },
  carImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  carName: {
    fontSize: 18,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carPrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedIcon: {
    marginLeft: 8,
  },
  carType: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 8,
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
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
  },
});