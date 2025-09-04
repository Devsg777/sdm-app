import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Car, Clock, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AIMedia } from './AIMedia';
import { GlassCard } from './GlassCard';

interface VehicleType {
  type: string;
  capacity: string;
  estimatedDuration: string;
  estimatedDistance: string;
  icon: any;
  description: string;
  disabled: boolean;
  comingSoon: boolean;
}

interface VehicleSelectionProps {
  bookingData: any;
  selectedVehicle: string | null;
  onVehicleSelect: (vehicleType: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  bookingData,
  selectedVehicle,
  onVehicleSelect,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const vehicleTypes: VehicleType[] = [
    {
      type: 'Sedan',
      capacity: '4 passengers',
      estimatedDuration: bookingData?.durationMinutes ? `${bookingData.durationMinutes.toFixed(2)} min` : 'N/A',
      estimatedDistance: bookingData?.distanceKm ? `${bookingData.distanceKm.toFixed(2)} km` : 'N/A',
      icon: Car,
      description: 'Comfortable and economical',
      disabled: false,
      comingSoon: false,
    },
    {
      type: 'SUV',
      capacity: '6 passengers',
      estimatedDuration: bookingData?.durationMinutes ? `${bookingData.durationMinutes.toFixed(2)} min` : 'N/A',
      estimatedDistance: bookingData?.distanceKm ? `${bookingData.distanceKm.toFixed(2)} km` : 'N/A',
      icon: Users,
      description: 'Spacious for groups',
      disabled: false,
      comingSoon: false,
    },
    {
      type: 'Premium',
      capacity: '4 passengers',
      estimatedDuration: bookingData?.durationMinutes ? `${bookingData.durationMinutes.toFixed(2)} min` : 'N/A',
      estimatedDistance: bookingData?.distanceKm ? `${bookingData.distanceKm.toFixed(2)} km` : 'N/A',
      icon: Car,
      description: 'Luxury experience',
      disabled: true,
      comingSoon: true,
    },
  ];

  const handleVehicleSelection = (vehicleType: string) => {
    if (!vehicleTypes.find(v => v.type === vehicleType)?.disabled) {
      onVehicleSelect(vehicleType);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <GlassCard style={styles.card}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Choose Your Vehicle
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            Select the perfect ride for your journey
          </Text>
        </View>

        <View style={styles.vehicleList}>
          {vehicleTypes.map((vehicle) => {
            const isSelected = selectedVehicle === vehicle.type;
            const isDisabled = vehicle.disabled;

            return (
              <TouchableOpacity
                key={vehicle.type}
                style={[
                  styles.vehicleCard,
                  {
                    backgroundColor: colorScheme.card,
                    borderColor: isSelected ? '#22C55E' : colorScheme.border,
                    opacity: isDisabled ? 0.6 : 1,
                  }
                ]}
                onPress={() => handleVehicleSelection(vehicle.type)}
                disabled={isDisabled}
              >
                {vehicle.comingSoon && (
                  <View style={styles.comingSoonBadge}>
                    <Text style={styles.comingSoonText}>Coming Soon</Text>
                  </View>
                )}

                <View style={styles.vehicleHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: '#22C55E20' }]}>
                    <vehicle.icon size={24} color="#22C55E" />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: colorScheme.text }]}>
                      {vehicle.type}
                    </Text>
                    <Text style={[styles.vehicleDescription, { color: colorScheme.subtext }]}>
                      {vehicle.description}
                    </Text>
                    <View style={styles.vehicleDetails}>
                      <View style={styles.detailItem}>
                        <Users size={14} color={colorScheme.subtext} />
                        <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                          {vehicle.capacity}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Clock size={14} color={colorScheme.subtext} />
                        <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                          {vehicle.estimatedDistance} • {vehicle.estimatedDuration}
                        </Text>
                      </View>
                    </View>
                    {/* Vehicle visual - AI image hinting the vehicle type (cached by Unsplash) */}
                    <AIMedia
                      imageUrl={`https://source.unsplash.com/featured/?${encodeURIComponent(vehicle.type + ' electric car')}`}
                      height={120}
                      style={{ marginTop: 12 }}
                    />
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <Text style={[styles.priceText, { color: '#22C55E' }]}>
                    ₹{bookingData?.selectedFare?.price || '0'}
                  </Text>
                  {bookingData?.isRoundTrip && (
                    <Text style={[styles.roundTripText, { color: '#22C55E' }]}>
                      Round Trip - Double Distance
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.backButton, { borderColor: colorScheme.border }]}
            onPress={onBack}
          >
            <Text style={[styles.backButtonText, { color: colorScheme.text }]}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: '#22C55E' }]}
            onPress={onNext}
            disabled={!selectedVehicle}
          >
            <Text style={styles.nextButtonText}>Continue to Payment</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  vehicleList: {
    marginBottom: 24,
  },
  vehicleCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    position: 'relative',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceSection: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  roundTripText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});