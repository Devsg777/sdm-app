import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Clock, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DriverOTPScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const correctOTP = '1234'; // Mock OTP
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 3) {
      // const nextInput = `otp-${index + 1}`;
      // In a real app, you'd focus the next input
    }
    
    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('') === correctOTP) {
      handleVerifyOTP();
    }
  };
  
  const handleVerifyOTP = () => {
    const enteredOTP = otp.join('');
    
    if (enteredOTP === correctOTP) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/driver-trip');
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      // Reset OTP
      setOtp(['', '', '', '']);
    }
  };
  
  const handleResendOTP = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimer(30);
    setCanResend(false);
    setOtp(['', '', '', '']);
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
          title: 'Verify OTP',
          headerBackTitle: '',
        }}
      />
      
      <View style={styles.content}>
        <GlassCard style={styles.otpCard}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={colorScheme.primary} />
          </View>
          
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Verify Ride OTP
          </Text>
          
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            Enter the 4-digit OTP shared by the rider to start the trip
          </Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput,
                  {
                    borderColor: digit ? colorScheme.primary : colorScheme.border,
                    backgroundColor: colorScheme.background,
                    color: colorScheme.text,
                  }
                ]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>
          
          <View style={styles.timerContainer}>
            <Clock size={16} color={colorScheme.subtext} />
            <Text style={[styles.timerText, { color: colorScheme.subtext }]}>
              {timer > 0 ? `Resend OTP in ${timer}s` : 'You can resend OTP now'}
            </Text>
          </View>
          
          <Button
            title="Verify & Start Trip"
            onPress={handleVerifyOTP}
            disabled={otp.some(digit => digit === '')}
            style={styles.verifyButton}
          />
          
          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={!canResend}
            style={styles.resendButton}
          >
            <Text style={[
              styles.resendText,
              { 
                color: canResend ? colorScheme.primary : colorScheme.subtext 
              }
            ]}>
              Resend OTP
            </Text>
          </TouchableOpacity>
        </GlassCard>
        
        <GlassCard style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colorScheme.text }]}>
            Ride Details
          </Text>
          <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
            Pickup: Downtown Mall
          </Text>
          <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
            Drop: Airport Terminal 1
          </Text>
          <Text style={[styles.infoText, { color: colorScheme.primary }]}>
            Fare: $45.50
          </Text>
        </GlassCard>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  otpCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '80%',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 14,
  },
  verifyButton: {
    width: '100%',
    marginBottom: 16,
  },
  resendButton: {
    paddingVertical: 8,
  },
  resendText: {
    fontSize: 16,
    fontWeight: '500',
  },
  infoCard: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 4,
  },
});