import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MapPin, Phone, Shield, Users } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SafetyScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const safetyFeatures = [
    {
      id: '1',
      title: 'Real-time Tracking',
      description: 'Share your trip details with trusted contacts',
      icon: <MapPin size={24} color={colorScheme.primary} />,
    },
    {
      id: '2',
      title: 'Emergency Button',
      description: 'Quick access to emergency services',
      icon: <Phone size={24} color={colorScheme.error} />,
    },
    {
      id: '3',
      title: 'Driver Verification',
      description: 'All drivers are background checked',
      icon: <Shield size={24} color={colorScheme.success} />,
    },
    {
      id: '4',
      title: 'Trusted Contacts',
      description: 'Add emergency contacts for peace of mind',
      icon: <Users size={24} color={colorScheme.warning} />,
    },
  ];

  const SafetyFeature = ({ feature }: { feature: typeof safetyFeatures[0] }) => (
    <GlassCard style={styles.featureCard}>
      <View style={styles.featureContent}>
        <View style={[styles.featureIcon, { backgroundColor: colorScheme.border }]}>
          {feature.icon}
        </View>
        <View style={styles.featureText}>
          <Text style={[styles.featureTitle, { color: colorScheme.text }]}>
            {feature.title}
          </Text>
          <Text style={[styles.featureDescription, { color: colorScheme.subtext }]}>
            {feature.description}
          </Text>
        </View>
      </View>
    </GlassCard>
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
        <View style={styles.heroSection}>
          <View style={[styles.heroIcon, { backgroundColor: colorScheme.primary + '20' }]}>
            <Shield size={48} color={colorScheme.primary} />
          </View>
          <Text style={[styles.title, { color: colorScheme.text }]}>
            Your Safety is Our Priority
          </Text>
          <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
            We&apos;ve built multiple safety features to ensure you have a secure and comfortable ride experience.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          {safetyFeatures.map((feature) => (
            <SafetyFeature key={feature.id} feature={feature} />
          ))}
        </View>

        <GlassCard style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: colorScheme.text }]}>
            Safety Tips
          </Text>
          <View style={styles.tipsList}>
            <Text style={[styles.tipItem, { color: colorScheme.subtext }]}>
              • Always verify the driver and vehicle details before getting in
            </Text>
            <Text style={[styles.tipItem, { color: colorScheme.subtext }]}>
              • Share your trip details with trusted contacts
            </Text>
            <Text style={[styles.tipItem, { color: colorScheme.subtext }]}>
              • Sit in the back seat when riding alone
            </Text>
            <Text style={[styles.tipItem, { color: colorScheme.subtext }]}>
              • Trust your instincts - if something feels wrong, end the trip
            </Text>
            <Text style={[styles.tipItem, { color: colorScheme.subtext }]}>
              • Keep your phone charged and accessible
            </Text>
          </View>
        </GlassCard>

        <GlassCard style={styles.emergencyCard}>
          <Text style={[styles.emergencyTitle, { color: colorScheme.error }]}>
            In Case of Emergency
          </Text>
          <Text style={[styles.emergencyText, { color: colorScheme.text }]}>
            If you feel unsafe during a ride, use the emergency button in the app or call emergency services immediately.
          </Text>
          <TouchableOpacity style={[styles.emergencyButton, { backgroundColor: colorScheme.error }]}>
            <Text style={[styles.emergencyButtonText, { color: colorScheme.background }]}>
              Emergency: 911
            </Text>
          </TouchableOpacity>
        </GlassCard>
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
  headerSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    position: 'relative',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeButton: {
    padding: 4,
    width: 32,
    alignItems: 'center',
    position: 'absolute',
    right: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    lineHeight: 24,
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureCard: {
    padding: 16,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsCard: {
    padding: 20,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
  },
  emergencyCard: {
    padding: 20,
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emergencyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  emergencyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});