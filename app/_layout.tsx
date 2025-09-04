import { EVBackground } from '@/components/ui/EVBackground';
import colors from '@/constants/colors';
import { AuthProvider } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Hide splash screen after a delay
    const hideSplash = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await SplashScreen.hideAsync();
    };
    
    hideSplash();
  }, []);
  
  return (
    <AuthProvider>
      <View style={[
        styles.container,
        { backgroundColor: theme === 'dark' ? colors.dark.background : colors.light.background }
      ]}>
        {/* Subtle EV-themed animated background */}
        <EVBackground intensity={0.5} speed={1} variant="subtle" />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <RootLayoutNav />
      </View>
    </AuthProvider>
  );
}

function RootLayoutNav() {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme.background,
        },
        headerTintColor: colorScheme.text,
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: {
          backgroundColor: colorScheme.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Shop My Trips',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(auth)/login"
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <Stack.Screen name="(auth)/auth-selection" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/onboarding" options={{ headerShown: false }} />
      <Stack.Screen
        name="(rider-tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(driver-tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});