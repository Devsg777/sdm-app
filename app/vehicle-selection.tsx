import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { VehicleSelection } from '@/components/ui/VehicleSelection';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { useRides } from '@/hooks/useRides';
import { Vehicle } from '@/types';

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentRide, setVehicle } = useRides();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const handleVehicleSelect = (vehicleType: string) => {
    setSelectedVehicle(vehicleType);

    // Create a mock vehicle based on type
    const mockVehicle: Vehicle = {
      id: `${vehicleType.toLowerCase()}-1`,
      name: vehicleType,
      make: vehicleType === 'Sedan' ? 'Toyota' : vehicleType === 'SUV' ? 'Mahindra' : 'Mercedes',
      model: vehicleType === 'Sedan' ? 'Etios' : vehicleType === 'SUV' ? 'Scorpio' : 'E-Class',
      year: 2023,
      license_plate: 'KA01AB1234',
      color: 'White',
      capacity: vehicleType === 'Sedan' ? 4 : vehicleType === 'SUV' ? 6 : 4,
      status: 'active',
      type: vehicleType,
      price: vehicleType === 'Sedan' ? 150 : vehicleType === 'SUV' ? 200 : 300,
      rating: 4.5,
      seatingCapacity: vehicleType === 'Sedan' ? 4 : vehicleType === 'SUV' ? 6 : 4,
      features: ['AC', 'GPS', 'Music System']
    };

    setVehicle(mockVehicle);
  };

  const handleNext = () => {
    if (selectedVehicle) {
      router.push('/payment');
    }
  };

  const handleBack = () => {
    router.back();
  };

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
          title: 'Select Vehicle',
          headerBackTitle: '',
        }}
      />

      <VehicleSelection
        bookingData={currentRide}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={handleVehicleSelect}
        onNext={handleNext}
        onBack={handleBack}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});