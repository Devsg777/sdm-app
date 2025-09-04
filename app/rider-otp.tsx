import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { Copy, Shield } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RiderOTPScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  
  // Mock OTP for demo
  const correctOTP = '1234';
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const handleOtpChange = (value: string, index: number) => {
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
      handleVerify();
    }
  };
  
  const handleVerify = () => {
    const enteredOtp = otp.join('');
    
    if (enteredOtp === correctOTP) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      router.replace('/tracking');
    } else {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      Alert.alert('Invalid OTP', 'Please enter the correct OTP');
      setOtp(['', '', '', '']);
    }
  };
  
  const handleResend = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setTimeLeft(300);
    setCanResend(false);
    Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
  };
  
  const copyOTP = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // In a real app, copy to clipboard
      Alert.alert('Demo OTP', `Use: ${correctOTP}`);
    } else {
      Alert.alert('Demo OTP', `Use: ${correctOTP}`);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
          title: 'Verify Booking',
          headerBackTitle: '',
        }}
      />
      
      <View style={styles.content}>
        <GlassCard style={styles.card}>
          <View style={styles.iconContainer}>
            <Shield size={48} color={colorScheme.primary} />
          </View>
          
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Verify Your Booking
          </Text>
          
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            We have sent a 4-digit verification code to your registered phone number
          </Text>
          
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                style={[
                  styles.otpInput,
                  { 
                    color: colorScheme.text,
                    borderColor: digit ? colorScheme.primary : colorScheme.border,
                    backgroundColor: digit ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
                  }
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.copyButton} onPress={copyOTP}>
            <Copy size={16} color={colorScheme.primary} />
            <Text style={[styles.copyText, { color: colorScheme.primary }]}>
              Demo: Tap to see OTP
            </Text>
          </TouchableOpacity>
          
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: colorScheme.subtext }]}>
              {timeLeft > 0 ? `Resend OTP in ${formatTime(timeLeft)}` : 'You can now resend OTP'}
            </Text>
          </View>
          
          <Button
            title="Verify & Confirm Booking"
            onPress={handleVerify}
            disabled={otp.some(digit => digit === '')}
            style={styles.verifyButton}
          />
          
          <TouchableOpacity
            style={styles.resendButton}
            onPress={handleResend}
            disabled={!canResend}
          >
            <Text style={[
              styles.resendText, 
              { color: canResend ? colorScheme.primary : colorScheme.subtext }
            ]}>
              Resend OTP
            </Text>
          </TouchableOpacity>
        </GlassCard>
        
        <GlassCard style={styles.infoCard}>
          <Text style={[styles.infoTitle, { color: colorScheme.text }]}>
            Booking Confirmed!
          </Text>
          <Text style={[styles.infoText, { color: colorScheme.subtext }]}>
            After verification, your ride will be confirmed and you will be redirected to track your driver.
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
  card: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 24,
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
    marginBottom: 16,
    width: '80%',
  },
  otpInput: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  copyText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  timerContainer: {
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});