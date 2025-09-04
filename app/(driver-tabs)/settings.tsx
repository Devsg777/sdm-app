import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Bell,
    Car,
    ChevronRight,
    CreditCard,
    FileText,
    Globe,
    HelpCircle,
    MapPin,
    Shield,
    Star,
    Volume2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DriverSettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { logout } = useAuth();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);
  
  const handleToggle = (setter: (value: boolean) => void, currentValue: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setter(!currentValue);
  };
  
  const handleNavigation = (route: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(route as any);
  };
  
  const handleLogout = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    logout();
  };
  
  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showToggle = false, 
    toggleValue = false, 
    onToggle 
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showToggle?: boolean;
    toggleValue?: boolean;
    onToggle?: () => void;
  }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={showToggle}
    >
      <View style={styles.settingIcon}>
        {icon}
      </View>
      
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: colorScheme.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colorScheme.subtext }]}>
            {subtitle}
          </Text>
        )}
      </View>
      
      {showToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ 
            false: colorScheme.border, 
            true: colorScheme.success 
          }}
          thumbColor={colorScheme.background}
        />
      ) : (
        <ChevronRight size={20} color={colorScheme.subtext} />
      )}
    </TouchableOpacity>
  );
  
  return (
    <LinearGradient
      colors={[
        theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
        theme === 'dark' ? '#121212' : '#ffffff',
      ]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Settings
        </Text>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Appearance
          </Text>
          
          <View style={styles.themeContainer}>
            <View style={styles.settingIcon}>
              <Globe size={24} color={colorScheme.primary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: colorScheme.text }]}>
                Dark Mode
              </Text>
              <Text style={[styles.settingSubtitle, { color: colorScheme.subtext }]}>
                Switch between light and dark theme
              </Text>
            </View>

          </View>
        </GlassCard>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Driver Preferences
          </Text>
          
          <SettingItem
            icon={<Car size={24} color={colorScheme.primary} />}
            title="Auto Accept Rides"
            subtitle="Automatically accept ride requests"
            showToggle={true}
            toggleValue={autoAccept}
            onToggle={() => handleToggle(setAutoAccept, autoAccept)}
          />
          
          <SettingItem
            icon={<MapPin size={24} color={colorScheme.primary} />}
            title="Vehicle Information"
            subtitle="Update your vehicle details"
            onPress={() => handleNavigation('/vehicle-info')}
          />
          
          <SettingItem
            icon={<FileText size={24} color={colorScheme.primary} />}
            title="Documents"
            subtitle="Manage your driver documents"
            onPress={() => handleNavigation('/driver-documents')}
          />
        </GlassCard>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Notifications
          </Text>
          
          <SettingItem
            icon={<Bell size={24} color={colorScheme.primary} />}
            title="Push Notifications"
            subtitle="Receive ride requests and updates"
            showToggle={true}
            toggleValue={notifications}
            onToggle={() => handleToggle(setNotifications, notifications)}
          />
          
          <SettingItem
            icon={<Volume2 size={24} color={colorScheme.primary} />}
            title="Sound"
            subtitle="Play sounds for ride requests"
            showToggle={true}
            toggleValue={soundEnabled}
            onToggle={() => handleToggle(setSoundEnabled, soundEnabled)}
          />
        </GlassCard>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Privacy & Security
          </Text>
          
          <SettingItem
            icon={<Shield size={24} color={colorScheme.primary} />}
            title="Privacy Settings"
            subtitle="Manage your privacy preferences"
            onPress={() => handleNavigation('/privacy-settings')}
          />
          
          <SettingItem
            icon={<Shield size={24} color={colorScheme.primary} />}
            title="Location Sharing"
            subtitle="Share location during rides"
            showToggle={true}
            toggleValue={locationSharing}
            onToggle={() => handleToggle(setLocationSharing, locationSharing)}
          />
        </GlassCard>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Earnings & Payments
          </Text>
          
          <SettingItem
            icon={<CreditCard size={24} color={colorScheme.primary} />}
            title="Bank Account"
            subtitle="Manage your payout account"
            onPress={() => handleNavigation('/bank-account')}
          />
          
          <SettingItem
            icon={<FileText size={24} color={colorScheme.primary} />}
            title="Earnings History"
            subtitle="View your earnings and payouts"
            onPress={() => handleNavigation('/earnings-history')}
          />
        </GlassCard>
        
        <GlassCard style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colorScheme.text }]}>
            Support
          </Text>
          
          <SettingItem
            icon={<HelpCircle size={24} color={colorScheme.primary} />}
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => handleNavigation('/help-center')}
          />
          
          <SettingItem
            icon={<Star size={24} color={colorScheme.primary} />}
            title="Rate App"
            subtitle="Rate Shop My Trips on the app store"
            onPress={() => handleNavigation('/rate-app')}
          />
          
          <SettingItem
            icon={<FileText size={24} color={colorScheme.primary} />}
            title="Terms & Conditions"
            subtitle="Read our terms and privacy policy"
            onPress={() => handleNavigation('/terms')}
          />
        </GlassCard>
        
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outlined"
          style={styles.logoutButton}
        />
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colorScheme.subtext }]}>
            Shop My Trips Driver v1.0.0
          </Text>
        </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  themeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  logoutButton: {
    marginBottom: 20,
  },
  versionContainer: {
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
});