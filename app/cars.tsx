import colors from '@/constants/colors';
import { useRides } from '@/hooks/useRides';
import { useTheme } from '@/hooks/useTheme';
import { Vehicle } from '@/types';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Car, Clock, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Mock vehicle data based on the screenshot
const vehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Sedan',
    type: 'sedan',
    description: 'Comfortable and economical',
    passengers: 4,
    price: 450,
    estimatedTime: '5 min arrival',
    image: 'sedan',
    features: ['AC', 'GPS Tracking', 'Safe & Secure']
  },
  {
    id: '2',
    name: 'SUV',
    type: 'suv',
    description: 'Spacious for groups',
    passengers: 6,
    price: 300,
    estimatedTime: '7 min arrival',
    image: 'suv',
    features: ['AC', 'GPS Tracking', 'Extra Space']
  },
  {
    id: '3',
    name: 'Premium',
    type: 'premium',
    description: 'Luxury experience',
    passengers: 4,
    price: 700,
    estimatedTime: '10 min arrival',
    image: 'premium',
    features: ['AC', 'GPS Tracking', 'Luxury Interior']
  }
];

export default function CarSelectionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { currentRide, setVehicle } = useRides();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const handleVehicleSelect = (vehicle: Vehicle) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedVehicle(vehicle);
  };
  
  const handleContinue = () => {
    if (!selectedVehicle) {
      return;
    }
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setVehicle(selectedVehicle);
    router.push('/payment');
  };

  const handleBack = () => {
    router.back();
  };

  const getVehicleIcon = (type: string) => {
    return <Car size={40} color="#22C55E" />;
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
      <Stack.Screen 
        options={{
          headerShown: false,
        }}
      />
      
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colorScheme.background }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={colorScheme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colorScheme.text }]}>Choose Your Vehicle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            Select the perfect vehicle for your journey
          </Text>

          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Choose Your Vehicle
          </Text>
          
          <Text style={[styles.sectionSubtitle, { color: colorScheme.subtext }]}>
            Select the perfect ride for your journey
          </Text>
          
          <View style={styles.vehiclesContainer}>
            {vehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  { backgroundColor: colorScheme.card },
                  selectedVehicle?.id === vehicle.id && { borderColor: '#22C55E', borderWidth: 2 }
                ]}
                onPress={() => handleVehicleSelect(vehicle)}
              >
                <View style={styles.vehicleHeader}>
                  <View style={[styles.vehicleIconContainer, { backgroundColor: '#22C55E20' }]}>
                    {getVehicleIcon(vehicle.type)}
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: colorScheme.text }]}>
                      {vehicle.name}
                    </Text>
                    <Text style={[styles.vehicleDescription, { color: colorScheme.subtext }]}>
                      {vehicle.description}
                    </Text>
                    <View style={styles.vehicleDetails}>
                      <View style={styles.detailItem}>
                        <Users size={16} color={colorScheme.subtext} />
                        <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                          {vehicle.passengers} passengers
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Clock size={16} color={colorScheme.subtext} />
                        <Text style={[styles.detailText, { color: colorScheme.subtext }]}>
                          {vehicle.estimatedTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.price, { color: '#22C55E' }]}>
                      ₹{vehicle.price}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {selectedVehicle ? (
            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: '#22C55E' }]}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>
                Continue with {selectedVehicle.name}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.backButtonBottom,
                { backgroundColor: colorScheme.card }
              ]}
              onPress={handleBack}
            >
              <Text style={[styles.backButtonText, { color: colorScheme.text }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  vehiclesContainer: {
    marginBottom: 30,
  },
  vehicleCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButtonBottom: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonTextDisabled: {
    color: '#666',
  },
  continueButtonTextEnabled: {
    color: '#fff',
  },
  
});