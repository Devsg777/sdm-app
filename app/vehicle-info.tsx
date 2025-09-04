import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Camera, Car, Edit, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface VehicleInfo {
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  seats: string;
  fuelType: string;
  transmission: string;
}

export default function VehicleInfoScreen() {
  // const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [isEditing, setIsEditing] = useState(false);
  const [vehicleImages, setVehicleImages] = useState<string[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo>({
    make: 'Toyota',
    model: 'Camry',
    year: '2022',
    color: 'White',
    plateNumber: 'ABC 123',
    seats: '4',
    fuelType: 'Gasoline',
    transmission: 'Automatic',
  });
  
  const handleEdit = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setIsEditing(false);
    // In a real app, save to backend
  };
  
  const handleAddImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to add vehicle photos!');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setVehicleImages(prev => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };
  
  const updateVehicleInfo = (field: keyof VehicleInfo, value: string) => {
    setVehicleInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const InfoField = ({ 
    label, 
    value, 
    field, 
    placeholder 
  }: { 
    label: string; 
    value: string; 
    field: keyof VehicleInfo; 
    placeholder?: string;
  }) => (
    <View style={styles.infoField}>
      <Text style={[styles.fieldLabel, { color: colorScheme.subtext }]}>
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.fieldInput,
            {
              borderColor: colorScheme.border,
              backgroundColor: colorScheme.background,
              color: colorScheme.text,
            }
          ]}
          value={value}
          onChangeText={(text) => updateVehicleInfo(field, text)}
          placeholder={placeholder}
          placeholderTextColor={colorScheme.subtext}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: colorScheme.text }]}>
          {value}
        </Text>
      )}
    </View>
  );
  
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
          title: 'Vehicle Information',
          headerBackTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={isEditing ? handleSave : handleEdit}>
              {isEditing ? (
                <Save size={24} color={colorScheme.primary} />
              ) : (
                <Edit size={24} color={colorScheme.primary} />
              )}
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <GlassCard style={styles.vehicleCard}>
          <View style={styles.cardHeader}>
            <Car size={24} color={colorScheme.primary} />
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
              Vehicle Details
            </Text>
          </View>
          
          <View style={styles.vehicleDetails}>
            <InfoField
              label="Make"
              value={vehicleInfo.make}
              field="make"
              placeholder="e.g., Toyota"
            />
            
            <InfoField
              label="Model"
              value={vehicleInfo.model}
              field="model"
              placeholder="e.g., Camry"
            />
            
            <InfoField
              label="Year"
              value={vehicleInfo.year}
              field="year"
              placeholder="e.g., 2022"
            />
            
            <InfoField
              label="Color"
              value={vehicleInfo.color}
              field="color"
              placeholder="e.g., White"
            />
            
            <InfoField
              label="License Plate"
              value={vehicleInfo.plateNumber}
              field="plateNumber"
              placeholder="e.g., ABC 123"
            />
            
            <InfoField
              label="Number of Seats"
              value={vehicleInfo.seats}
              field="seats"
              placeholder="e.g., 4"
            />
            
            <InfoField
              label="Fuel Type"
              value={vehicleInfo.fuelType}
              field="fuelType"
              placeholder="e.g., Gasoline"
            />
            
            <InfoField
              label="Transmission"
              value={vehicleInfo.transmission}
              field="transmission"
              placeholder="e.g., Automatic"
            />
          </View>
        </GlassCard>
        
        <GlassCard style={styles.imagesCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Vehicle Photos
          </Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
            {vehicleImages.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.vehicleImage}
              />
            ))}
            
            <TouchableOpacity
              onPress={handleAddImage}
              style={[styles.addImageButton, { borderColor: colorScheme.border }]}
            >
              <Camera size={32} color={colorScheme.primary} />
              <Text style={[styles.addImageText, { color: colorScheme.primary }]}>
                Add Photo
              </Text>
            </TouchableOpacity>
          </ScrollView>
          
          <Text style={[styles.imageHint, { color: colorScheme.subtext }]}>
            Add photos of your vehicle from different angles for better rider confidence
          </Text>
        </GlassCard>
        
        <GlassCard style={styles.statusCard}>
          <Text style={[styles.statusTitle, { color: colorScheme.text }]}>
            Verification Status
          </Text>
          
          <View style={[styles.statusBadge, { backgroundColor: colorScheme.success }]}>
            <Text style={styles.statusText}>Verified</Text>
          </View>
          
          <Text style={[styles.statusDescription, { color: colorScheme.subtext }]}>
            Your vehicle information has been verified and approved for rides.
          </Text>
        </GlassCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  vehicleCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  vehicleDetails: {
    
  },
  infoField: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  fieldInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  imagesCard: {
    padding: 16,
    marginBottom: 16,
  },
  imagesScroll: {
    marginVertical: 16,
  },
  vehicleImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  addImageButton: {
    width: 120,
    height: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  imageHint: {
    fontSize: 12,
    lineHeight: 16,
  },
  statusCard: {
    padding: 16,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statusDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});