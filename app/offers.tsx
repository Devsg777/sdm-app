import { GlassCard } from '@/components/ui/GlassCard';
import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Gift, Tag } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function OffersScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;

  const offers = [
    {
      id: '1',
      title: 'First Ride Free',
      description: 'Get your first ride absolutely free up to $20',
      code: 'FIRST20',
      discount: '100%',
      validUntil: '2024-12-31',
      type: 'new-user',
    },
    {
      id: '2',
      title: 'Weekend Special',
      description: '20% off on all weekend rides',
      code: 'WEEKEND20',
      discount: '20%',
      validUntil: '2024-12-31',
      type: 'weekend',
    },
    {
      id: '3',
      title: 'Airport Rides',
      description: 'Flat $5 off on airport transfers',
      code: 'AIRPORT5',
      discount: '$5',
      validUntil: '2024-12-31',
      type: 'airport',
    },
  ];

  const OfferCard = ({ offer }: { offer: typeof offers[0] }) => (
    <GlassCard style={styles.offerCard}>
      <View style={styles.offerHeader}>
        <View style={[styles.offerIcon, { backgroundColor: colorScheme.primary + '20' }]}>
          <Gift size={24} color={colorScheme.primary} />
        </View>
        <View style={styles.offerContent}>
          <Text style={[styles.offerTitle, { color: colorScheme.text }]}>
            {offer.title}
          </Text>
          <Text style={[styles.offerDescription, { color: colorScheme.subtext }]}>
            {offer.description}
          </Text>
        </View>
        <View style={styles.discountBadge}>
          <Text style={[styles.discountText, { color: colorScheme.success }]}>
            {offer.discount} OFF
          </Text>
        </View>
      </View>
      
      <View style={styles.offerFooter}>
        <View style={styles.codeContainer}>
          <Tag size={16} color={colorScheme.primary} />
          <Text style={[styles.codeText, { color: colorScheme.primary }]}>
            {offer.code}
          </Text>
        </View>
        <Text style={[styles.validText, { color: colorScheme.subtext }]}>
          Valid until {offer.validUntil}
        </Text>
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
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Available Offers
        </Text>
        
        <Text style={[styles.subtitle, { color: colorScheme.subtext }]}>
          Save money on your rides with these exclusive offers
        </Text>

        <View style={styles.offersContainer}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  offersContainer: {
    gap: 16,
  },
  offerCard: {
    padding: 16,
  },
  offerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  offerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  offerContent: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  validText: {
    fontSize: 12,
  },
});