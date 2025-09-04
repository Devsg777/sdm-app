import colors from '@/constants/colors';
import { useTheme } from '@/hooks/useTheme';
import { Calendar, Clock, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GlassCard } from '../ui/GlassCard';

interface EarningsCardProps {
  totalEarnings: number;
  todayEarnings: number;
  weeklyEarnings: number;
  totalTrips: number;
  onlineHours: number;
}

export const EarningsCard: React.FC<EarningsCardProps> = ({
  totalEarnings,
  todayEarnings,
  weeklyEarnings,
  totalTrips,
  onlineHours,
}) => {
  const { theme } = useTheme();
  const colorScheme = theme === 'dark' ? colors.dark : colors.light;
  
  return (
    <GlassCard style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colorScheme.text }]}>
          Earnings
        </Text>
        <TrendingUp size={20} color={colorScheme.success} />
      </View>
      
      <View style={styles.amountContainer}>
        <Text style={[styles.totalAmount, { color: colorScheme.text }]}>
          ${totalEarnings.toFixed(2)}
        </Text>
        <Text style={[styles.totalLabel, { color: colorScheme.subtext }]}>
          Total Earnings
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <Calendar size={16} color={colorScheme.subtext} />
            <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
              Today
            </Text>
          </View>
          <Text style={[styles.statValue, { color: colorScheme.text }]}>
            ${todayEarnings.toFixed(2)}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <Calendar size={16} color={colorScheme.subtext} />
            <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
              This Week
            </Text>
          </View>
          <Text style={[styles.statValue, { color: colorScheme.text }]}>
            ${weeklyEarnings.toFixed(2)}
          </Text>
        </View>
      </View>
      
      <View style={[styles.divider, { backgroundColor: colorScheme.border }]} />
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <TrendingUp size={16} color={colorScheme.subtext} />
            <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
              Total Trips
            </Text>
          </View>
          <Text style={[styles.statValue, { color: colorScheme.text }]}>
            {totalTrips}
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statHeader}>
            <Clock size={16} color={colorScheme.subtext} />
            <Text style={[styles.statLabel, { color: colorScheme.subtext }]}>
              Online Hours
            </Text>
          </View>
          <Text style={[styles.statValue, { color: colorScheme.text }]}>
            {onlineHours}h
          </Text>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statLabel: {
    marginLeft: 4,
    fontSize: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
});