import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Tabs } from 'expo-router';
import { Clock, Home, Settings, User } from 'lucide-react-native';
import React from 'react';

export default function DriverTabLayout() {
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
          title: 'Dashboard',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="trips"
        options={{
          title: 'My Trips',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Clock size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <User size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}