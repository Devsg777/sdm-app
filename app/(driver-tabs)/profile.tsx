import { DocumentUpload } from '@/components/driver/DocumentUpload';
import { DocumentView } from '@/components/driver/DocumentView';
import { GlassCard } from '@/components/ui/GlassCard';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { DrawerMenu } from '@/components/ui/DrawerMenu';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { UserService } from '@/services/user';
import { BookingService } from '@/services/booking';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Shield, Star, User, Edit, Save } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator, TextInput } from 'react-native';

export default function DriverProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [vehicleInfo, setVehicleInfo] = useState<any>(null);
  const [tripStats, setTripStats] = useState({
    totalTrips: 0,
    rating: 0,
    totalEarned: 0
  });
  
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editedPhone, setEditedPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  
  // Document state
  const [documents, setDocuments] = useState({
    license: false,
    identity: false,
    registration: false,
    insurance: false,
  });
  
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
        setFirstName(userProfileData.full_name || '');
        setLastName('');

        setEditedPhone(userProfileData.phone_no || '');
        setProfileImage(userProfileData.profile_picture_url || null);
      }
      
      // Fetch driver profile
      const driverProfileData = await UserService.getDriverProfile(user?.id || '');
      if (driverProfileData) {
        setDriverProfile(driverProfileData);
        setLicenseNumber(driverProfileData.license_number || '');
        
        // Set document upload status based on URLs
        setDocuments({
          license: !!driverProfileData.license_document_url,
          identity: !!driverProfileData.id_proof_document_url,
          registration: !!driverProfileData.vehicle_info[0]?.registration_document_url,
          insurance: !!driverProfileData.vehicle_info[0]?.insurance_document_url,
        });
         console.log('Driver Profile Data:', driverProfileData);
        // Set vehicle info if available
        if (driverProfileData.vehicle_info && driverProfileData.vehicle_info.length > 0) {
          // In a real implementation, you would fetch vehicle details from a vehicle service
          // For now, we'll use mock data
          setVehicleInfo({
            model:driverProfileData.vehicle_info[0].model,
            year: driverProfileData.vehicle_info[0].year,
            color: driverProfileData.vehicle_info[0].color,
            license_plate: driverProfileData.vehicle_info[0].license_plate,
            registration_document_url: driverProfileData.vehicle_info[0].registration_document_url,
            insurance_document_url: driverProfileData.vehicle_info[0].insurance_document_url,
            image_url: driverProfileData.vehicle_info[0].image_url,
          });
          
        }
      }
      
      // Fetch trip statistics
      // In a real implementation, you would fetch completed trips and calculate statistics
      // For now, we'll use data from driver profile
      setTripStats({
        totalTrips: driverProfileData.total_rides || 0,
        rating: driverProfileData.rating || 0,
        totalEarned: 2450 // This would come from a separate API
      });
      
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
  
  const handleDocumentUpload = async (type: string, uri: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // In a real implementation, you would upload the document to storage
      // and update the driver profile with the document URL
      // For now, we'll just update the local state

      setDocuments(prev => ({
        ...prev,
        [type]: true,
      }));

      // Simulate API call for document upload
      // const documentFile = {
      //   uri: uri,
      //   name: `${type}-document.jpg`,
      //   type: 'image/jpeg'
      // } as any;
      //
      // const documentUrl = await UserService.uploadDocument(
      //   user?.id || '',
      //   documentFile,
      //   type === 'license' ? 'license' : 'id_proof'
      // );

    } catch (error) {
      console.error(`Error uploading ${type} document:`, error);
      Alert.alert('Error', `Failed to upload ${type} document. Please try again.`);

      // Revert the state change
      setDocuments(prev => ({
        ...prev,
        [type]: false,
      }));
    }
  };

  const handleDocumentDelete = async (type: string) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    try {
      // In a real implementation, you would delete the document from storage
      // and update the driver profile to remove the document URL
      // For now, we'll just update the local state

      setDocuments(prev => ({
        ...prev,
        [type]: false,
      }));

      // Simulate API call for document delete
      // await UserService.deleteDocument(user?.id || '', type);

    } catch (error) {
      console.error(`Error deleting ${type} document:`, error);
      Alert.alert('Error', `Failed to delete ${type} document. Please try again.`);

      // Revert the state change
      setDocuments(prev => ({
        ...prev,
        [type]: true,
      }));
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
        last_name: lastName,
        phone_no: editedPhone,
        profile_image_url: profileImage || undefined
      });
      
      // Update driver profile
      const updatedDriverProfile = await UserService.updateDriverProfile(user?.id || '', {
        license_number: licenseNumber
      });
      
      if (updatedUserProfile) {
        setUserProfile(updatedUserProfile);
      }
      
      if (updatedDriverProfile) {
        setDriverProfile(updatedDriverProfile);
      }
      
      // Vehicle information is now read-only and managed by admins only
      // No need to update vehicle info in handleSave
      
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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
  
  const handleLogout = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
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
          title="Driver Profile" 
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
              
              <Text style={[styles.profileName, { color: colorScheme.text }]}>
                {firstName} {lastName}
              </Text>
              
              <View style={styles.ratingContainer}>
                <Star size={16} color={colorScheme.warning} fill={colorScheme.warning} />
                <Text style={[styles.ratingText, { color: colorScheme.text }]}>
                  {tripStats.rating.toFixed(1)}
                </Text>
                <Text style={[styles.tripCount, { color: colorScheme.subtext }]}>
                  ({tripStats.totalTrips} trips)
                </Text>
              </View>
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
              
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                  Last Name
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Enter last name"
                    placeholderTextColor={colorScheme.subtext}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {lastName || 'Not provided'}
                  </Text>
                )}
              </View>
              
              <View style={styles.infoItem}>
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
              
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                  License Number
                </Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.infoInput, { color: colorScheme.text, borderColor: colorScheme.border }]}
                    value={licenseNumber}
                    onChangeText={setLicenseNumber}
                    placeholder="Enter license number"
                    placeholderTextColor={colorScheme.subtext}
                  />
                ) : (
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {licenseNumber || 'Not provided'}
                  </Text>
                )}
              </View>
            </GlassCard>
            
            <GlassCard style={styles.vehicleCard}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colorScheme.text }]}>
                  Vehicle Information
                </Text>
                <Text style={[styles.readOnlyText, { color: colorScheme.subtext }]}>
                  Read Only
                </Text>
              </View>

              {vehicleInfo?.image_url && (
                <View style={styles.vehicleImageContainer}>
                  <Image
                    source={{ uri: vehicleInfo.image_url }}
                    style={styles.vehicleImage}
                  />
                </View>
              )}

              <View style={styles.vehicleInfo}>
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                    Vehicle Model
                  </Text>
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {vehicleInfo?.model || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                    Year
                  </Text>
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {vehicleInfo?.year || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                    Color
                  </Text>
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {vehicleInfo?.color || 'Not provided'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colorScheme.subtext }]}>
                    License Plate
                  </Text>
                  <Text style={[styles.infoValue, { color: colorScheme.text }]}>
                    {vehicleInfo?.license_plate || 'Not provided'}
                  </Text>
                </View>
              </View>
               <DocumentView
                title="Vehicle Registration"
                description="Vehicle registration certificate (view only)"
                documentUrl={vehicleInfo?.registration_document_url}
              />

              <DocumentView
                title="Insurance"
                description="Vehicle insurance document (view only)"
                documentUrl={vehicleInfo?.insurance_document_url}
              />
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
                    ${tripStats.totalEarned.toFixed(0)}
                  </Text>
                  <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
                    Total Earned
                  </Text>
                </View>
              </View>
            </GlassCard>
            
            <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
              Documents
            </Text>
            
            <View style={styles.documentsContainer}>
              <DocumentUpload
                title="Driver's License"
                description="Upload a clear photo of your valid driver's license"
                onUpload={(uri) => handleDocumentUpload('license', uri)}
                onDelete={() => handleDocumentDelete('license')}
                isUploaded={documents.license}
                documentUrl={driverProfile?.license_document_url}
              />
              <DocumentUpload
                title="Identity Proof"
                description="Upload government issued ID (passport, SSN, etc.)"
                onUpload={(uri) => handleDocumentUpload('identity', uri)}
                onDelete={() => handleDocumentDelete('identity')}
                isUploaded={documents.identity}
                documentUrl={driverProfile?.id_proof_document_url}
              />
            </View>
            
            <GlassCard style={styles.verificationCard}>
              <View style={styles.verificationHeader}>
                <Shield size={24} color={colorScheme.primary} />
                <Text style={[styles.verificationTitle, { color: colorScheme.text }]}>
                  Verification Status
                </Text>
              </View>

              <View style={[
                styles.verificationStatus,
                {
                  backgroundColor: driverProfile?.kyc_status === 'approved'
                    ? colorScheme.success
                    : driverProfile?.kyc_status === 'rejected'
                    ? colorScheme.error
                    : colorScheme.warning
                }
              ]}>
                <Text style={styles.verificationStatusText}>
                  {driverProfile?.kyc_status === 'approved'
                    ? 'Verified'
                    : driverProfile?.kyc_status === 'rejected'
                    ? 'Rejected'
                    : 'Pending Verification'
                  }
                </Text>
              </View>

              <Text style={[styles.verificationText, { color: colorScheme.subtext }]}>
                {driverProfile?.kyc_status === 'approved'
                  ? 'Your account has been verified. You are good to go!'
                  : driverProfile?.kyc_status === 'rejected'
                  ? `Verification rejected: ${driverProfile?.rejection_reason || 'No reason provided'}`
                  : 'Your documents are under review. Please wait for verification.'
                }
              </Text>
            </GlassCard>
            
            <Button
              title="Logout"
              onPress={handleLogout}
              style={[styles.logoutButton, { backgroundColor: colorScheme.error }]}
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
  infoCard: {
    marginBottom: 16,
    padding: 16,
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
  editingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  readOnlyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  vehicleImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
  },
  infoItem: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
  },
  infoInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vehicleCard: {
    padding: 16,
    marginBottom: 24,
  },
  vehicleInfo: {
    
  },
  statsCard: {
    padding: 16,
    marginBottom: 24,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  documentsContainer: {
    marginBottom: 24,
  },
  verificationCard: {
    padding: 16,
    marginBottom: 24,
  },
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  verificationStatus: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  verificationStatusText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  verificationText: {
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});