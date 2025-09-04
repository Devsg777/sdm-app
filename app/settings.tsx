import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Shield,
  Star,
  Volume2
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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
            Notifications
          </Text>
          
          <SettingItem
            icon={<Bell size={24} color={colorScheme.primary} />}
            title="Push Notifications"
            subtitle="Receive ride updates and offers"
            showToggle={true}
            toggleValue={notifications}
            onToggle={() => handleToggle(setNotifications, notifications)}
          />
          
          <SettingItem
            icon={<Volume2 size={24} color={colorScheme.primary} />}
            title="Sound"
            subtitle="Play sounds for notifications"
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
            Payment & Billing
          </Text>
          
          <SettingItem
            icon={<CreditCard size={24} color={colorScheme.primary} />}
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => handleNavigation('/payment-methods')}
          />
          
          <SettingItem
            icon={<FileText size={24} color={colorScheme.primary} />}
            title="Billing History"
            subtitle="View your past transactions"
            onPress={() => handleNavigation('/billing-history')}
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
            onPress={() => handleNavigation('/support')}
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
        
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colorScheme.subtext }]}>
            Shop My Trips v1.0.0
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 32,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
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
  versionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  versionText: {
    fontSize: 14,
  },
});