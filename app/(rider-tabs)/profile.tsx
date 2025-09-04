import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { DrawerMenu } from '@/components/ui/DrawerMenu';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';
import { SavedAddress } from '@/types';
import { UserService } from '@/services/user';
import { BookingService } from '@/services/booking';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Camera, Edit, Home, Mail, MapPin, Phone, Plus, Save, Star, User } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Alert, ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [customerProfile, setCustomerProfile] = useState<any>(null);
  const [tripStats, setTripStats] = useState({
    totalTrips: 0,
    rating: 0,
    totalSpent: 0
  });

  // Form state
  const [firstName, setFirstName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [dob, setDob] = useState('');
  const [preferredPayment, setPreferredPayment] = useState('');
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', address: '', type: 'other' as 'home' | 'work' | 'other' });
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
    const router = useRouter();
  
  // Load user data
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch user profile
      const userProfileData = await UserService.getUserProfile(user?.id || '');
      if (userProfileData) {
        setUserProfile(userProfileData);
        // Handle full_name field from database
        const fullName = userProfileData.full_name || '';
        const nameParts = fullName.split(' ');
        setFirstName(nameParts[0] || '');
        // Use email from auth user, not from profile
        setEditedEmail(user?.email || userProfileData.email || '');
        setEditedPhone(userProfileData.phone_no || '');
        setProfileImage(userProfileData.profile_picture_url || null);
      }
      
      // Fetch customer profile
      const customerProfileData = await UserService.getCustomerProfile(user?.id || '');
      if (customerProfileData) {
        setCustomerProfile(customerProfileData);
        setDob(customerProfileData.dob || '');
        setPreferredPayment(customerProfileData.preferred_payment_method || '');
        setLoyaltyPoints(customerProfileData.loyalty_points || 0);
      }
      
      // Fetch saved addresses
      const savedLocations = await BookingService.getSavedLocations(user?.id || '');
      if (savedLocations && savedLocations.length > 0) {
        const formattedAddresses: SavedAddress[] = savedLocations.map(location => ({
          id: location.id,
          type: (location.name.toLowerCase().includes('home') ? 'home' : 
                 location.name.toLowerCase().includes('work') ? 'work' : 'other') as 'home' | 'work' | 'other',
          name: location.name,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude
        }));
        setSavedAddresses(formattedAddresses);
      }
      
      // Fetch trip statistics
      const completedBookings = await BookingService.getCompletedBookings(user?.id || '');
      if (completedBookings) {
        const totalTrips = completedBookings.length;
        let totalSpent = 0;
        let totalRating = 0;
        let ratingCount = 0;
        
        completedBookings.forEach(booking => {
          if (booking.fare_amount) {
            totalSpent += booking.fare_amount;
          }
          // Assuming ratings are stored in a related table and not directly on bookings
        });
        
        setTripStats({
          totalTrips,
          rating: ratingCount > 0 ? totalRating / ratingCount : 0,
          totalSpent
        });
      }
      
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMenuPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setDrawerVisible(true);
  };
  
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to change profile picture!');
        return;
      }
    }
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        setProfileImage(result.assets[0].uri);
        
        // In a real implementation, you would upload the image to storage
        // and update the user profile with the image URL
        // For now, we'll just update the local state
        // const imageFile = {
        //   uri: result.assets[0].uri,
        //   name: 'profile-image.jpg',
        //   type: 'image/jpeg'
        // } as any;
        // const imageUrl = await UserService.uploadProfileImage(user?.id || '', imageFile);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };
  
  const handleSave = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    try {
      setIsSaving(true);
      
      // Update user profile
      const updatedUserProfile = await UserService.updateUserProfile(user?.id || '', {
        first_name: firstName,
        phone_no: editedPhone,
        profile_image_url: profileImage || undefined
      });
      
      // Update customer profile
      const updatedCustomerProfile = await UserService.updateCustomerProfile(user?.id || '', {
        dob,
        preferred_payment_method: preferredPayment
      });
      
      if (updatedUserProfile) {
        setUserProfile(updatedUserProfile);
      }
      
      if (updatedCustomerProfile) {
        setCustomerProfile(updatedCustomerProfile);
      }
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // In a real implementation, you would get actual coordinates from a geocoding service
      const savedLocation = await BookingService.saveLocation(user?.id || '', {
        label: newAddress.name,
        address: newAddress.address,
        latitude: 37.7749, // Mock coordinates
        longitude: -122.4194,
        is_default: false
      });
      
      if (savedLocation) {
        const newSavedAddress: SavedAddress = {
          id: savedLocation.id,
          type: newAddress.type,
          name: savedLocation.name,
          address: savedLocation.address,
          latitude: savedLocation.latitude,
          longitude: savedLocation.longitude
        };
        
        setSavedAddresses([...savedAddresses, newSavedAddress]);
        setNewAddress({ name: '', address: '', type: 'other' });
        setShowAddAddress(false);
        
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        
        Alert.alert('Success', 'Address added successfully!');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      Alert.alert('Error', 'Failed to add address. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real implementation, you would delete the address from the database
              // For now, we'll just update the local state
              setSavedAddresses(savedAddresses.filter(addr => addr.id !== id));
              
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              
              // Simulate API call
              // await BookingService.deleteLocation(id);
            } catch (error) {
              console.error('Error deleting address:', error);
              Alert.alert('Error', 'Failed to delete address. Please try again.');
            }
          },
        },
      ]
    );
  };
  
  const handleLogout = async () => {
      console.log('🚪 Attempting logout...');
        
        Alert.alert(
          'Sign Out',
          'Are you sure you want to sign out?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Sign Out',
              style: 'destructive',
              onPress: () => {
                console.log('✅ User confirmed logout');
                
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }
                
                
                setTimeout(() => {
                  try {
                    console.log('🔄 Executing logout...');
                    signOut();
                    console.log('🔄 Navigating to auth selection...');
                    router.replace('/(auth)/auth-selection');
                  } catch (error) {
                    console.error('❌ Logout error:', error);
                    // Force navigation even if logout fails
                    router.replace('/');
                  }
                }, 300);
              },
            },
          ]
        );
  };
  
  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home size={16} color={colorScheme.success} />;
      case 'work':
        return <Briefcase size={16} color={colorScheme.primary} />;
      default:
        return <MapPin size={16} color={colorScheme.warning} />;
    }
  };
  
  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colorScheme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colorScheme.primary} />
        <Text style={[styles.loadingText, { color: colorScheme.text, marginTop: 16 }]}>Loading profile...</Text>
      </View>
    );
  }
  
  return (
    <>
      <View style={[styles.container, { backgroundColor: colorScheme.background }]}>
        <AppHeader 
          title="Profile" 
          onMenuPress={handleMenuPress}
        />
        
        <LinearGradient
          colors={[
            theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
            theme === 'dark' ? '#121212' : '#ffffff',
          ]}
          style={styles.gradientContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profilePlaceholder, { backgroundColor: colorScheme.border }]}>
                <User size={40} color={colorScheme.primary} />
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.cameraButton, { backgroundColor: colorScheme.primary }]}
              onPress={pickImage}
            >
              <Camera size={16} color={theme === 'dark' ? colors.dark.background : colors.light.background} />
            </TouchableOpacity>
          </View>
          
          
          <View style={styles.ratingContainer}>
            <Star size={16} color={colorScheme.warning} fill={colorScheme.warning} />
            <Text style={[styles.ratingText, { color: colorScheme.text }]}>
              {tripStats.rating.toFixed(1) || '0.0'}
            </Text>
            <Text style={[styles.tripCount, { color: colorScheme.subtext }]}>
              ({tripStats.totalTrips} trips)
            </Text>
          </View>
          
          {loyaltyPoints > 0 && (
            <View style={[styles.loyaltyBadge, { backgroundColor: colorScheme.primary }]}>
              <Text style={styles.loyaltyText}>
                {loyaltyPoints} Loyalty Points
              </Text>
            </View>
          )}
        </View>
        
        <GlassCard style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
              Personal Information
            </Text>
            <TouchableOpacity 
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              style={styles.editButton}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color={colorScheme.primary} />
              ) : isEditing ? (
                <Save size={20} color={colorScheme.success} />
              ) : (
                <Edit size={20} color={colorScheme.primary} />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.infoItem}>
            <Phone size={20} color={colorScheme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                Phone Number
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={colorScheme.subtext}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                  {editedPhone || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <Mail size={20} color={colorScheme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                Email
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                  value={editedEmail}
                  onChangeText={setEditedEmail}
                  placeholder="Enter email"
                  placeholderTextColor={colorScheme.subtext}
                  keyboardType="email-address"
                  editable={false} // Email is managed by auth system
                />
              ) : (
                <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                  {editedEmail || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <User size={20} color={colorScheme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                First Name
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  placeholderTextColor={colorScheme.subtext}
                />
              ) : (
                <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                  {firstName || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
          
          
          <View style={styles.infoItem}>
            <User size={20} color={colorScheme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                Date of Birth
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                  value={dob}
                  onChangeText={setDob}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colorScheme.subtext}
                />
              ) : (
                <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                  {dob || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
          
          <View style={styles.infoItem}>
            <User size={20} color={colorScheme.primary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                Preferred Payment Method
              </Text>
              {isEditing ? (
                <TextInput
                  style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                  value={preferredPayment}
                  onChangeText={setPreferredPayment}
                  placeholder="card, upi, cash, etc."
                  placeholderTextColor={colorScheme.subtext}
                />
              ) : (
                <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                  {preferredPayment || 'Not provided'}
                </Text>
              )}
            </View>
          </View>
        </GlassCard>
        
        <GlassCard style={styles.statsCard}>
          <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
            Trip Statistics
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme.text }]}>
                {tripStats.totalTrips}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
                Total Trips
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme.text }]}>
                {tripStats.rating.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
                Rating
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colorScheme.text }]}>
                ${tripStats.totalSpent.toFixed(0)}
              </Text>
              <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
                Total Spent
              </Text>
            </View>
          </View>
        </GlassCard>
        
        <GlassCard style={styles.addressesCard}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
              Saved Addresses
            </Text>
            <TouchableOpacity 
              onPress={() => setShowAddAddress(!showAddAddress)}
              style={styles.editButton}
            >
              <Plus size={20} color={colorScheme.primary} />
            </TouchableOpacity>
          </View>
          
          {savedAddresses.length === 0 && !showAddAddress && (
            <Text style={[styles.noAddressText, { color: colorScheme.subtext }]}>
              No saved addresses. Add one to quickly select it when booking.
            </Text>
          )}
          
          {savedAddresses.map((address) => (
            <TouchableOpacity 
              key={address.id}
              style={styles.addressItem}
              onLongPress={() => handleDeleteAddress(address.id)}
            >
              {getAddressIcon(address.type || 'other')}
              <View style={styles.addressContent}>
                <Text style={[styles.addressLabel, { color: colorScheme.text }]}>
                  {address.name}
                </Text>
                <Text style={[styles.addressText, { color: colorScheme.subtext }]}>
                  {address.address}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          
          {showAddAddress && (
            <GlassCard style={styles.addAddressForm}>
              <Text style={[styles.formTitle, { color: colorScheme.text }]}>
                Add New Address
              </Text>
              
              <TextInput
                style={[styles.formInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                placeholder="Address name (e.g., Home, Office)"
                placeholderTextColor={colorScheme.subtext}
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />
              
              <TextInput
                style={[styles.formInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                placeholder="Full address"
                placeholderTextColor={colorScheme.subtext}
                value={newAddress.address}
                onChangeText={(text) => setNewAddress({ ...newAddress, address: text })}
                multiline
              />
              
              <View style={styles.typeSelector}>
                {(['home', 'work', 'other'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      { 
                        borderColor: newAddress.type === type ? colorScheme.primary : colorScheme.border,
                        backgroundColor: newAddress.type === type ? 'rgba(0, 255, 0, 0.1)' : 'transparent'
                      }
                    ]}
                    onPress={() => setNewAddress({ ...newAddress, type })}
                  >
                    <Text style={[
                      styles.typeText, 
                      { color: newAddress.type === type ? colorScheme.primary : colorScheme.text }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.formButtons}>
                <Button
                  title="Cancel"
                  onPress={() => setShowAddAddress(false)}
                  variant="outlined"
                  style={styles.formButton}
                />
                <Button
                  title="Add"
                  onPress={handleAddAddress}
                  style={styles.formButton}
                  loading={isSaving}
                  disabled={isSaving}
                />
              </View>
            </GlassCard>
          )}
        </GlassCard>
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outlined"
          style={styles.logoutButton}
        />
          </ScrollView>
        </LinearGradient>
      </View>

      <DrawerMenu 
        visible={drawerVisible} 
        onClose={() => setDrawerVisible(false)} 
      />
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profilePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '500',
  },
  tripCount: {
    marginLeft: 4,
    fontSize: 14,
  },
  loyaltyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  loyaltyText: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontSize: 14,
  },
  infoCard: {
    // padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoInput: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statsCard: {
    // padding: 16,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
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
  },
  addressesCard: {
    // padding: 16,
    marginBottom: 24,
  },
  noAddressText: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 16,
    fontStyle: 'italic',
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  addressContent: {
    marginLeft: 12,
    flex: 1,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
  },
  addAddressForm: {
    padding: 16,
    marginTop: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  formButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});