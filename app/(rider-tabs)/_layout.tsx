import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Tabs } from 'expo-router';
import { Clock, Grid3X3, Home, User } from 'lucide-react-native';
import React from 'react';

export default function RiderTabLayout() {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme.primary,
        tabBarInactiveTintColor: colorScheme.subtext,
        tabBarStyle: {
          backgroundColor: colorScheme.background,
          borderTopColor: colorScheme.border,
        },
        headerStyle: {
          backgroundColor: colorScheme.background,
        },
        headerTintColor: colorScheme.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="services"
        options={{
          title: 'Services',
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Grid3X3 size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Clock size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}