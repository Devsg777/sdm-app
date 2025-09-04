import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { UserRole } from '@/types';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Phone, User as UserIcon } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';

type SignupStep = 'signup' | 'otp' | 'google-phone' | 'google-otp';

interface GoogleUser {
  name: string;
  email: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { 
    selectedRole, 
    userRole, 
    setUserRole,
    user, 
    isPhoneVerified,
    signInWithPhone,
    verifyPhoneOTP,
    signInWithGoogle,
    sendPhoneVerification,
    verifyPhoneForGoogleUser,
    authError,
    clearAuthError
  } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [currentStep, setCurrentStep] = useState<SignupStep>('signup');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    // If user is authenticated and phone is verified, redirect to appropriate dashboard
    if (user && isPhoneVerified) {
      if (userRole === 'customer') {
        router.replace('(rider-tabs)');
      } else {
        router.replace('(driver-tabs)');
      }
    }
    // If user is authenticated but phone not verified, show phone verification step
    else if (user && !isPhoneVerified) {
      setCurrentStep('google-phone');
    }
  }, [user, isPhoneVerified, userRole, router,selectedRole]);

  useEffect(() => {
    // Show error alert if auth error occurs
    if (authError) {
      Alert.alert('Authentication Error', authError, [
        { text: 'OK', onPress: () => clearAuthError() }
      ]);
    }
  }, [authError, clearAuthError]);

  const handleSendOtp = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (currentStep === 'signup') {
        result = await signInWithPhone(phoneNumber);
        if (result.success) {
          setCurrentStep('otp');
        } else {
          Alert.alert('Error', result.error || 'Failed to send OTP');
        }
      } else if (currentStep === 'google-phone') {
        result = await sendPhoneVerification(phoneNumber);
        if (result.success) {
          setCurrentStep('google-otp');
        } else {
          Alert.alert('Error', result.error || 'Failed to send verification code');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const isSignupFormValid = () => {
    const digits = phoneNumber.replace(/\D/g, '');
    return digits.length >= 10;
  };

  const handleVerifyOtp = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  
    if (!otp || otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (currentStep === 'otp') {
        result = await verifyPhoneOTP(phoneNumber, otp);
      } else if (currentStep === 'google-otp') {
        result = await verifyPhoneForGoogleUser(phoneNumber, otp);
      } else {
        throw new Error('Invalid step for OTP verification');
      }
      
      if (!result.success) {
        Alert.alert('Verification Failed', result.error || 'Invalid OTP code. Please check and try again.');
      }

      // If successful, the auth state change will trigger navigation
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    
    setIsLoading(true);
    
    try {
      const result = await signInWithGoogle();
      
      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to sign in with Google');
      }
      // If successful, the auth state change will handle the rest
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRedirect = () => {
    // For now, just show a message or redirect to email login
    router.push('(auth)/signup');
  };

  const handleChangePhoneNumber = () => {
    if (currentStep === 'otp') {
      setCurrentStep('signup');
    } else if (currentStep === 'google-otp') {
      setCurrentStep('google-phone');
    }
    setOtp('');
  };

  const handleUseDifferentMethod = () => {
    setGoogleUser(null);
    setCurrentStep('signup');
  };

  const renderSignupScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
         Login
        </Text>
        <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
          Login as {selectedRole === 'customer' ? 'Rider' : 'Driver'}
        </Text>
      </View>

      <GlassCard style={[styles.formCard, { 
        backgroundColor: colorScheme.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }]}>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInputWrapper}>
            <Phone size={20} color={'#22C55E'} style={styles.phoneIcon} />
            <TextInput
              style={[
                styles.phoneInput,
                { 
                  color: colorScheme.text,
                  borderColor: colorScheme.border,
                }
              ]}
              placeholder="Phone Number"
              placeholderTextColor={colorScheme.subtext}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              returnKeyType="done"
            />
          </View>
        </View>
        
        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          loading={isLoading}
          disabled={!isSignupFormValid()}
          style={[styles.primaryButton, { backgroundColor: '#22C55E', opacity: isSignupFormValid() ? 1 : 0.6 }]}
          textStyle={{ color: '#FFFFFF' }}
        />
        
        
      </GlassCard>

      <View style={styles.dividerContainer}>
        <Text style={[styles.dividerText, { color: colorScheme.subtext }]}>
          Or continue with
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleGoogleLogin}
        style={[styles.googleButton, { 
          borderColor: '#22C55E',
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }]}
        disabled={isLoading}
      >
        <Text style={[styles.googleText, { color: '#22C55E' }]}>
          Google
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOtpScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Verify OTP
        </Text>
        <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
          Enter the OTP sent to your phone
        </Text>
      </View>

      <GlassCard style={[styles.formCard, { 
        backgroundColor: colorScheme.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }]}>
        <Text style={[styles.otpMessage, { color: colorScheme.subtext }]}>
          We've sent a verification code to
        </Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.otpInput,
              { 
                color: colorScheme.text,
                borderColor: '#E5E7EB',
              }
            ]}
            placeholder="Enter OTP"
            placeholderTextColor={colorScheme.subtext}
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
            textAlign="center"
          />
        </View>
        
        <Button
          title="Verify & Login"
          onPress={handleVerifyOtp}
          loading={isLoading}
          style={[styles.primaryButton, { backgroundColor: '#22C55E' }]}
          textStyle={{ color: '#FFFFFF' }}
        />
        
        <TouchableOpacity onPress={handleChangePhoneNumber} style={styles.linkButton}>
          <Text style={[styles.linkText, { color: colorScheme.text }]}>
            Change Phone Number
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );

  const renderGooglePhoneScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Welcome
        </Text>
        <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
          Complete your profile with phone verification
        </Text>
      </View>

      <GlassCard style={[styles.singleCard, { 
        backgroundColor: colorScheme.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }]}>
        <View style={styles.userWelcomeSection}>
          <Text style={[styles.welcomeUserName, { color: colorScheme.text }]}>
            Welcome, {googleUser?.name}!
          </Text>
          <Text style={[styles.userEmail, { color: colorScheme.subtext }]}>
            {googleUser?.email}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.phoneInputWrapper}>
            <Phone size={20} color={'#22C55E'} style={styles.phoneIcon} />
            <TextInput
              style={[
                styles.phoneInput,
                { 
                  color: colorScheme.text,
                  borderColor: colorScheme.border,
                }
              ]}
              placeholder="Phone Number"
              placeholderTextColor={colorScheme.subtext}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>
        
        <Button
          title="Send OTP"
          onPress={handleSendOtp}
          loading={isLoading}
          style={[styles.primaryButton, { backgroundColor: '#22C55E' }]}
          textStyle={{ color: '#FFFFFF' }}
        />
        
        <TouchableOpacity onPress={handleUseDifferentMethod} style={styles.centeredLinkButton}>
          <Text style={[styles.centeredLinkText, { color: colorScheme.text }]}>
            Use different signin method
          </Text>
        </TouchableOpacity>
      </GlassCard>
    </View>
  );

  const renderCurrentScreen = () => {
    switch (currentStep) {
      case 'signup':
        return renderSignupScreen();
      case 'otp':
        return renderOtpScreen();
      case 'google-phone':
        return renderGooglePhoneScreen();
      case 'google-otp':
        return renderOtpScreen();
      default:
        return renderSignupScreen();
    }
  };

  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1c1c1c' : '#f5f5f5',
        theme === 'dark' ? '#1c1c1c' : '#f5f5f5'
      ]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {renderCurrentScreen()}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:100,
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 560,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
   
    marginBottom: 20,
    width: '100%',
    borderRadius: 16,
  },
  combinedCard: {
    // padding: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  userInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  welcomeUserText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmailText: {
    fontSize: 14,
    textAlign: 'center',
  },
  phoneSection: {
    marginBottom: 20,
  },
  centerLinkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  centerLinkText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  singleCard: {
    // padding: 24,
    marginBottom: 24,
    borderRadius: 16,
  },
  userWelcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
    // paddingTop: 10,
  },
  welcomeUserName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 14,
    textAlign: 'center',
  },
  centeredLinkButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  centeredLinkText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  phoneIcon: {
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  primaryButton: {
    height: 52,
    borderRadius: 12,
    marginBottom: 16,
  },
  linkButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dividerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerText: {
    fontSize: 14,
  },
  googleButton: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    fontSize: 16,
    fontWeight: '500',
  },
  otpMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    letterSpacing: 2,
  },
});